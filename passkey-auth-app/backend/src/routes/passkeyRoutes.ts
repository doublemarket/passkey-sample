import { Router } from 'express';
import {
  registerStart,
  registerFinish,
  loginStart,
  loginFinish,
} from '../controllers/passkeyController';

const router = Router();

/**
 * Start passkey registration.
 * POST /api/passkey/register/start
 */
router.post('/register/start', registerStart);

/**
 * Finish passkey registration.
 * POST /api/passkey/register/finish
 */
router.post('/register/finish', registerFinish);

/**
 * Start passkey login.
 * POST /api/passkey/login/start
 */
router.post('/login/start', loginStart);

/**
 * Finish passkey login.
 * POST /api/passkey/login/finish
 */
router.post('/login/finish', loginFinish);

export default router;
