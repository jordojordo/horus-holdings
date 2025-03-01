import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import dotenvFlow from 'dotenv-flow';

if (process.env.NODE_ENV !== 'production') {
  dotenvFlow.config();
}

const database = process.env.DATABASE_NAME || 'horusdevdb';
const user = process.env.DATABASE_USER || 'root';
const password = process.env.DATABASE_PASSWORD || 'admin';
const host = process.env.DATABASE_HOST || '127.0.0.1';
const port = Number(process.env.DATABASE_PORT) || 3306;

/**
 * Creates a connection pool for the main database
 */
export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database,
  user,
  password,
  host,
  port,
  // ssl:     {},
  // debug:   true
});
export default sequelize;
