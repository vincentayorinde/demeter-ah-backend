import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import consola from 'consola';
import bodyParser from 'body-parser';
import db from './db/models';
import auth from './controllers/auth';

dotenv.config();

const swaggerDocument = YAML.load(`${__dirname}/swagger.yaml`);

const app = express();

const dbconnection = db.sequelize;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Welcome to Authors Haven'
  });
});
app.post('/signup', auth.signup);
app.put('/activate/:token', auth.activate);
dbconnection
  .authenticate()
  .then(() => {
    consola.success('connection to database successful');
    app.listen(process.env.PORT, () => {
      consola.success(`server start at port ${process.env.PORT}`);
    });
  })
  .catch((e) => {
    consola.error(e.message);
  });
export { app, dbconnection, db };
