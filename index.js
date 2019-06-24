import express from 'express';
import env from './config';
import db from './db/models';

const app = express();
const dbconnection = db.sequelize;
dbconnection
  .authenticate()
  .then(() => console.log('connection to database successful'))
  .catch(e => {
    throw e.message;
  });
const server = app.listen(env.PORT, () => {
  console.log(`server start at port ${env.PORT}`);
});
export default { server, dbconnection };
