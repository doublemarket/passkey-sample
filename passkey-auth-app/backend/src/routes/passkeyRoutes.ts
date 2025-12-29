import { Router } from 'express';
import {
  registerStart,
  registerFinish,
  loginStart,
  loginFinish,
} from '../controllers/passkeyController';

const router = Router();

/**
 * Passkey登録開始
 * POST /api/passkey/register/start
 */
router.post('/register/start', registerStart);

/**
 * Passkey登録完了
 * POST /api/passkey/register/finish
 */
router.post('/register/finish', registerFinish);

/**
 * Passkeyログイン開始
 * POST /api/passkey/login/start
 */
router.post('/login/start', loginStart);

/**
 * Passkeyログイン完了
 * POST /api/passkey/login/finish
 */
router.post('/login/finish', loginFinish);

export default router;
