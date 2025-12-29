import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// ユーザー登録
router.post('/register', authController.register);

// パスワードログイン
router.post('/login', authController.login);

// ログアウト
router.post('/logout', authController.logout);

// セッション確認
router.get('/session', authController.getSession);

export default router;
