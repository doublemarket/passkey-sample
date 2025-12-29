import { Request, Response } from 'express';
import * as UserModel from '../models/User';

/**
 * ユーザー登録
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // バリデーション
    if (!username || !password) {
      res.status(400).json({ 
        success: false,
        message: 'ユーザー名とパスワードは必須です' 
      });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ 
        success: false,
        message: 'ユーザー名は3文字以上である必要があります' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        success: false,
        message: 'パスワードは6文字以上である必要があります' 
      });
      return;
    }

    // 重複チェック
    if (UserModel.isUsernameExists(username)) {
      res.status(409).json({ 
        success: false,
        message: 'このユーザー名は既に使用されています' 
      });
      return;
    }

    // ユーザー作成
    const user = UserModel.createUser({ username, password });

    // セッションに保存
    req.session.userId = user.id;
    req.session.username = user.username;

    res.status(201).json({
      success: true,
      message: 'ユーザー登録が完了しました',
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました' 
    });
  }
}

/**
 * パスワードログイン
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // バリデーション
    if (!username || !password) {
      res.status(400).json({ 
        success: false,
        message: 'ユーザー名とパスワードは必須です' 
      });
      return;
    }

    // ユーザー取得
    const user = UserModel.getUserByUsername(username);
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません' 
      });
      return;
    }

    // パスワード検証
    if (!UserModel.verifyPassword(user, password)) {
      res.status(401).json({ 
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません' 
      });
      return;
    }

    // セッションに保存
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.authMethod = 'password';

    res.json({
      success: true,
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        username: user.username
      },
      authMethod: 'password'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました' 
    });
  }
}

/**
 * ログアウト
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).json({ 
          error: 'ログアウトに失敗しました' 
        });
        return;
      }
      res.json({ 
        message: 'ログアウトしました' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました' 
    });
  }
}

/**
 * セッション確認
 * GET /api/auth/session
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    if (!req.session.userId) {
      res.status(401).json({ 
        authenticated: false 
      });
      return;
    }

    const user = UserModel.getUserById(req.session.userId);
    if (!user) {
      res.status(401).json({ 
        authenticated: false 
      });
      return;
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username
      },
      authMethod: req.session.authMethod || 'password'
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました' 
    });
  }
}
