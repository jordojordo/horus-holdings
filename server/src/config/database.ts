import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import dotenvFlow from 'dotenv-flow';

if (process.env.NODE_ENV !== 'production') {
  dotenvFlow.config();
}

const database = process.env.MYSQL_DATABASE || 'horusdevdb';
const user = process.env.MYSQL_USER || 'horus';
const password = process.env.MYSQL_PASSWORD || 'horus';
const host = process.env.MYSQL_HOST || 'localhost';
const port = Number(process.env.MYSQL_PORT) || 3306;

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
