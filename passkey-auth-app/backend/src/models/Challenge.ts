import db from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface Challenge {
  id: string;
  challenge: string;
  user_id: string | null;
  type: 'registration' | 'authentication';
  created_at: string;
  expires_at: string;
}

export interface CreateChallengeData {
  challenge: string;
  userId?: string;
  type: 'registration' | 'authentication';
  expiresInMinutes?: number;
}

/**
 * 新規Challengeを作成
 */
export function createChallenge(data: CreateChallengeData): Challenge {
  const id = uuidv4();
  const expiresInMinutes = data.expiresInMinutes || 5;
  
  const stmt = db.prepare(`
    INSERT INTO challenges (id, challenge, user_id, type, expires_at)
    VALUES (?, ?, ?, ?, datetime('now', '+${expiresInMinutes} minutes'))
  `);

  stmt.run(id, data.challenge, data.userId || null, data.type);

  return getChallengeById(id)!;
}

/**
 * IDでChallengeを取得
 */
export function getChallengeById(id: string): Challenge | undefined {
  const stmt = db.prepare(`
    SELECT * FROM challenges WHERE id = ?
  `);

  return stmt.get(id) as Challenge | undefined;
}

/**
 * Challengeの値で取得（有効期限内のもの）
 */
export function getValidChallenge(
  challenge: string, 
  type: 'registration' | 'authentication'
): Challenge | undefined {
  const stmt = db.prepare(`
    SELECT * FROM challenges 
    WHERE challenge = ? 
      AND type = ?
      AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `);

  return stmt.get(challenge, type) as Challenge | undefined;
}

/**
 * ユーザーIDとタイプで最新のChallengeを取得
 */
export function getChallengeByUserAndType(
  userId: string,
  type: 'registration' | 'authentication'
): Challenge | undefined {
  const stmt = db.prepare(`
    SELECT * FROM challenges 
    WHERE user_id = ? 
      AND type = ?
      AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `);

  return stmt.get(userId, type) as Challenge | undefined;
}

/**
 * Challengeを削除
 */
export function deleteChallenge(id: string): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE id = ?
  `);

  stmt.run(id);
}

/**
 * Challengeを値で削除
 */
export function deleteChallengeByValue(challenge: string): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE challenge = ?
  `);

  stmt.run(challenge);
}

/**
 * ユーザーの古いChallengeを削除
 */
export function cleanupUserChallenges(userId: string, type: 'registration' | 'authentication'): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE user_id = ? AND type = ?
  `);

  stmt.run(userId, type);
}
