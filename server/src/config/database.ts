import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/horusdevdb';

const sequelize = new Sequelize(databaseUrl, {
  host:    'localhost',
  dialect: 'mysql',
  logging: false
});

export default sequelize;
