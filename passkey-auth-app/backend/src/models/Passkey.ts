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
 * 新規Passkeyを作成
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
 * IDでPasskeyを取得
 */
export function getPasskeyById(id: string): Passkey | undefined {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE id = ?
  `);

  return stmt.get(id) as Passkey | undefined;
}

/**
 * Credential IDでPasskeyを取得
 */
export function getPasskeyByCredentialId(credentialId: string): Passkey | undefined {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE credential_id = ?
  `);

  return stmt.get(credentialId) as Passkey | undefined;
}

/**
 * ユーザーIDでPasskeyを取得（複数）
 */
export function getPasskeysByUserId(userId: string): Passkey[] {
  const stmt = db.prepare(`
    SELECT * FROM passkeys WHERE user_id = ? ORDER BY created_at DESC
  `);

  return stmt.all(userId) as Passkey[];
}

/**
 * Passkeyのカウンターを更新
 */
export function updatePasskeyCounter(credentialId: string, counter: number): void {
  const stmt = db.prepare(`
    UPDATE passkeys SET counter = ? WHERE credential_id = ?
  `);

  stmt.run(counter, credentialId);
}

/**
 * ユーザーがPasskeyを持っているか確認
 */
export function hasPasskey(userId: string): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM passkeys WHERE user_id = ?
  `);

  const result = stmt.get(userId) as { count: number };
  return result.count > 0;
}
