import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// データベースファイルのパス
const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

// データディレクトリが存在しない場合は作成
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// データベース接続
const db: BetterSqlite3.Database = new Database(DB_PATH);

// WALモードを有効化（並行アクセス性能向上）
db.pragma('journal_mode = WAL');

/**
 * データベーステーブルの初期化
 */
export function initDatabase(): void {
  // Usersテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Passkeysテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS passkeys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      credential_id TEXT UNIQUE NOT NULL,
      public_key TEXT NOT NULL,
      counter INTEGER DEFAULT 0,
      transports TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Challengesテーブル（一時的なチャレンジ保存）
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      challenge TEXT NOT NULL,
      user_id TEXT,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `);

  // 期限切れチャレンジを削除するインデックス
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_challenges_expires_at 
    ON challenges(expires_at)
  `);

  console.log('✅ Database initialized successfully');
}

/**
 * 期限切れのチャレンジを削除
 */
export function cleanupExpiredChallenges(): void {
  const stmt = db.prepare(`
    DELETE FROM challenges 
    WHERE expires_at < datetime('now')
  `);
  const result = stmt.run();
  if (result.changes > 0) {
    console.log(`🧹 Cleaned up ${result.changes} expired challenges`);
  }
}

// 定期的に期限切れチャレンジをクリーンアップ（5分ごと）
setInterval(cleanupExpiredChallenges, 5 * 60 * 1000);

export default db;
