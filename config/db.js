import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DIALECT: process.env.DB_DIALECT || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_USE_SSL: process.env.DB_USE_SSL === 'true',
};

const sequelize = new Sequelize(
  CONFIG.DB_NAME,
  CONFIG.DB_USERNAME,
  CONFIG.DB_PASSWORD,
  {
    host: CONFIG.DB_HOST,
    dialect: CONFIG.DB_DIALECT,
    port: CONFIG.DB_PORT,
    logging: false,
    dialectOptions: CONFIG.DB_USE_SSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to PostgreSQL successful');

    await sequelize.sync({ alter: true }); // Optional: change to false in prod
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ DB connection failed:', error);
    throw error;
  }
};

export default sequelize;
