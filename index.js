import express from 'express';
import { PORT } from './config';

const app = express();

const server = app.listen(PORT, () => {
  console.log(`server start at port ${PORT}`);
});

module.exports = server;