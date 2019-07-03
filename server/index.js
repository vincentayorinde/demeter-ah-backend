import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import consola from 'consola';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import Routes from '../routes';
import db from '../db/models';

const app = express();

dotenv.config();

const swaggerDocument = YAML.load(`${__dirname}/../swagger.yaml`);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
  })
);
app.use(passport.initialize());
app.use(passport.session());
Routes(app);

app.get('/', (req, res) =>
  res.status(200).json({
    message: "welcome to Author's Haven"
  })
);
app.use((req, res) =>
  res.status(404).json({
    status: 404,
    error: `Route ${req.url} Not found`
  })
);

app.use((error, req, res) =>
  res.status(500).json({
    status: 500,
    error
  })
);

const dbconnection = db.sequelize;
dbconnection
  .authenticate()
  .then(() => {
    consola.success('connection to database successful');
    app.listen(process.env.PORT, () => {
      consola.success(`server start at port ${process.env.PORT}`);
    });
  })
  .catch(e => {
    throw e.message;
  });

export { app, db };
