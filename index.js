import express from 'express';
import dotenv from 'dotenv';
import db from './db/models';

dotenv.config();

const app = express();
const dbconnection = db.sequelize;

app.use('/', (req, res) => {
  res.send({
    message: 'receieved',
  });
});

dbconnection
  .authenticate()
  .then(() => {
    console.log('connection to database successful');
    app.listen(process.env.PORT, () => {
      console.log(`server start at port ${process.env.PORT}`);
    });
  })
  .catch((e) => {
    throw e.message;
  });

export { app, dbconnection };
