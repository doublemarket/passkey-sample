import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// Register
router.post('/register', authController.register);

// Password login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Check session
router.get('/session', authController.getSession);

export default router;
