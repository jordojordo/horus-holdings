import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';

import passport from './config/passport';
import sequelize from './config/database';

import authRoutes from './routes/auth';
import incomeRoutes from './routes/incomes';
import expenseRoutes from './routes/expenses';

const isDevelopment = process.env.NODE_ENV === 'development';

const CORS_OPT = {
  origin:      isDevelopment ? ['http://127.0.0.1:5173', 'http://localhost:5173'] : [`${ process.env.CORS_ORIGIN }`],
  credentials: true,
};
const sessionSecret = crypto.randomBytes(64).toString('hex');

const app = express();

app.use(cors(CORS_OPT));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret:            sessionSecret,
    resave:            false,
    saveUninitialized: false,
    cookie:            {
      secure:   !isDevelopment,
      httpOnly: true,
      sameSite: isDevelopment ? 'lax' : 'none',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

sequelize.sync();

app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);

const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${ PORT }`);
});

// WebSocket setup
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

wss.on('connection', (ws: WebSocketServer) => {
  console.log('WebSocket connection established');

  ws.on('message', (message: string) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

interface BroadcastData {
  type: string;
  data: any;
}


const broadcast = (data: BroadcastData) => {
  wss.clients.forEach((client) => {
    if ( client.readyState === client.OPEN ) {
      client.send(JSON.stringify(data));
    }
  });
};

export { broadcast };