import db from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface Passkey {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: string | null;
  created_at: string;
}

export interface CreatePasskeyData {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
}

/**
 * Create a new passkey.
 */
export function createPasskey(data: CreatePasskeyData): Passkey {
  const id = uuidv4();
  const transports = data.transports ? JSON.stringify(data.transports) : null;

  const stmt = db.prepare(`
    INSERT INTO passkeys (id, user_id, credential_id, public_key, counter, transports)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, data.userId, data.credentialId, data.publicKey, data.counter, transports);

  return getPasskeyById(id)!;
}

/**
 * Fetch a passkey by ID.
 */
export function getPasskeyById(id: string): Passkey | undefined {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE id = ?
  `);

  return stmt.get(id) as Passkey | undefined;
}

/**
 * Fetch a passkey by credential ID.
 */
export function getPasskeyByCredentialId(credentialId: string): Passkey | undefined {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE credential_id = ?
  `);

  return stmt.get(credentialId) as Passkey | undefined;
}

/**
 * Fetch passkeys by user ID.
 */
export function getPasskeysByUserId(userId: string): Passkey[] {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE user_id = ? ORDER BY created_at DESC
  `);

  return stmt.all(userId) as Passkey[];
}

/**
 * Update the passkey counter.
 */
export function updatePasskeyCounter(credentialId: string, counter: number): void {
  const stmt = db.prepare(`
    UPDATE passkeys SET counter = ? WHERE credential_id = ?
  `);

  stmt.run(counter, credentialId);
}

/**
 * Check whether a user has a passkey.
 */
export function hasPasskey(userId: string): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM passkeys WHERE user_id = ?
  `);

  const result = stmt.get(userId) as { count: number };
  return result.count > 0;
}
