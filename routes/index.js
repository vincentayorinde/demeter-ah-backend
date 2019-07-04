import v1 from './v1';
import oauth from './oauth';

export default (app) => {
  app.use('/api/v1', v1);
  app.use('/auth', oauth);
};
