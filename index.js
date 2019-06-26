import express from 'express';
import dotenv from 'dotenv';
import db from './db/models';

dotenv.config();

const app = express();
const dbconnection = db.sequelize;
dbconnection
  .authenticate()
  .then(() => console.log('connection to database successful'))
  .catch(e => {
    throw e.message;
  });
const server = app.listen(process.env.PORT, () => {
  console.log(`server start at port ${process.env.PORT}`);
});
export default { server, dbconnection };
