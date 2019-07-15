import express from 'express';
import Middleware from '../../middlewares';
import Role from '../../controllers/role';
import Validation from '../../validators/role';


const router = express.Router();

router.patch(
  '/:username',
  Middleware.authenticate,
  Middleware.isAdmin,
  Validation.changeRole,
  Role.changeRole
);

export default router;
