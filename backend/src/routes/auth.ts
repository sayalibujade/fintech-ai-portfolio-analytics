import { Router } from 'express';
import { login, signup } from '../controllers/authController';

const router = Router();

//POST /auth/signup -> create new user
router.post('/signup', signup);

//POST /auth/login -> user login
router.post('/login', login);

export default router;