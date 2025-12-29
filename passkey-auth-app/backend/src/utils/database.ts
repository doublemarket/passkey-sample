import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

// Create the data directory if it does not exist.
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database connection
const db: BetterSqlite3.Database = new Database(DB_PATH);

// Enable WAL mode for better concurrency.
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables.
 */
export function initDatabase(): void {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Passkeys table
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

  // Challenges table (temporary challenge storage)
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

  // Index for removing expired challenges
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_challenges_expires_at 
    ON challenges(expires_at)
  `);

  console.log('✅ Database initialized successfully');
}

/**
 * Remove expired challenges.
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

// Periodically clean up expired challenges (every 5 minutes).
setInterval(cleanupExpiredChallenges, 5 * 60 * 1000);

export default db;
