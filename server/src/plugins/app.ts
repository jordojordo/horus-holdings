import dotenvFlow from 'dotenv-flow';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

import logger from '@server/config/logger';
import passport from '@server/config/passport';
import sequelize from '@server/config/database';

import authRoutes from '@server/routes/api/v1/auth';
import preferenceRoutes from '@server/routes/api/v1/preference';
import incomeRoutes from '@server/routes/api/v1/income';
import expenseRoutes from '@server/routes/api/v1/expense';
import recurrenceRoutes from '@server/routes/api/v1/recurrence';

if (process.env.NODE_ENV !== 'production') {
  dotenvFlow.config();
}

const isDevelopment = process.env.NODE_ENV === 'development';
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

const CORS_OPT = {
  origin:      isDevelopment ? ['http://127.0.0.1:5173', 'http://localhost:5173'] : [`${ process.env.CORS_ORIGIN }`],
  credentials: true,
};

// Create Redis client
const redisClient = createClient({
  socket: {
    host:              process.env.REDIS_HOST || 'localhost',
    port:              Number(process.env.REDIS_PORT) || 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect()
  .then(() => logger.info('Connected to Redis'))
  .catch(console.error);

// Handle Redis connection errors
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('reconnecting', () => logger.info('Redis Client Reconnecting'));
redisClient.on('ready', () => logger.info('Redis Client Ready'));

const redisStore = new RedisStore({ client: redisClient });

// Initialize database
sequelize.sync()
  .then(() => logger.info('Database synchronized'))
  .catch((err: unknown) => logger.error('Error synchronizing database:', err));

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
    store:             redisStore,
    secret:            sessionSecret,
    resave:            false,
    saveUninitialized: false,
    cookie:            {
      httpOnly: true,
      sameSite: 'lax',
      secure:   !isDevelopment,
      maxAge:   24 * 60 * 60 * 1000,
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
app.use('/api/v1/recurrence', recurrenceRoutes);

export default app;
