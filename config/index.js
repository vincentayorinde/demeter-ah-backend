import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:@localhost:5432/postgres',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:@localhost:5432/postgres'
};

export default env;
