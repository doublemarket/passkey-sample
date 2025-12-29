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
 * Create a new challenge.
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
 * Fetch a challenge by ID.
 */
export function getChallengeById(id: string): Challenge | undefined {
  const stmt = db.prepare(`
    SELECT * FROM challenges WHERE id = ?
  `);

  return stmt.get(id) as Challenge | undefined;
}

/**
 * Fetch a valid challenge by value.
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
 * Fetch the latest challenge by user and type.
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
 * Delete a challenge by ID.
 */
export function deleteChallenge(id: string): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE id = ?
  `);

  stmt.run(id);
}

/**
 * Delete a challenge by value.
 */
export function deleteChallengeByValue(challenge: string): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE challenge = ?
  `);

  stmt.run(challenge);
}

/**
 * Delete a user's old challenges.
 */
export function cleanupUserChallenges(userId: string, type: 'registration' | 'authentication'): void {
  const stmt = db.prepare(`
    DELETE FROM challenges WHERE user_id = ? AND type = ?
  `);

  stmt.run(userId, type);
}
