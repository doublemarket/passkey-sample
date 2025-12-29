import db from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  password: string;
}

/**
 * 新規ユーザーを作成
 */
export function createUser(data: CreateUserData): User {
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(data.password, SALT_ROUNDS);

  const stmt = db.prepare(`
    INSERT INTO users (id, username, password_hash)
    VALUES (?, ?, ?)
  `);

  stmt.run(id, data.username, passwordHash);

  return getUserById(id)!;
}

/**
 * ユーザー名でユーザーを取得
 */
export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE username = ?
  `);

  return stmt.get(username) as User | undefined;
}

/**
 * IDでユーザーを取得
 */
export function getUserById(id: string): User | undefined {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);

  return stmt.get(id) as User | undefined;
}

/**
 * パスワードを検証
 */
export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password_hash);
}

/**
 * ユーザー名の重複チェック
 */
export function isUsernameExists(username: string): boolean {
  const user = getUserByUsername(username);
  return user !== undefined;
}
