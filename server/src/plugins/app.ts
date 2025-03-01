import dotenvFlow from 'dotenv-flow';
import express from 'express';
import session from 'express-session';
import 'express-async-errors';
import cors from 'cors';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';

import logger from '@server/config/logger';
import passport from '@server/config/passport';
import sequelize from '@server/config/database';

import authRoutes from '@server/routes/api/v1/auth';
import preferenceRoutes from '@server/routes/api/v1/preference';
import incomeRoutes from '@server/routes/api/v1/income';
import expenseRoutes from '@server/routes/api/v1/expense';

if (process.env.NODE_ENV !== 'production') {
  dotenvFlow.config();
}

const isDevelopment = process.env.NODE_ENV === 'development';
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

const CORS_OPT = {
  origin:      isDevelopment ? ['http://127.0.0.1:5173', 'http://localhost:5173'] : [`${ process.env.CORS_ORIGIN }`],
  credentials: true,
};

// Initialize database
sequelize.sync()
  .then(() => logger.info('Database synchronized'))
  .catch((err: any) => logger.error('Error synchronizing database:', err));

// Create the Express application
const app = express();

app.use(cors(CORS_OPT));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`${ req.method } ${ req.url }`);
  next();
});

app.use(
  session({
    secret:            sessionSecret,
    resave:            false,
    saveUninitialized: false,
    cookie:            {
      httpOnly: true,
      sameSite: 'lax',
      secure:   false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Set up routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/preference', preferenceRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/expense', expenseRoutes);

export default app;
