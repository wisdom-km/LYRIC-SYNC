import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'lyric-sync.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    audio_path TEXT NOT NULL,
    lyrics_content TEXT,
    cover_url TEXT DEFAULT 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
`);

// User operations
export function createUser(username, passwordHash) {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    try {
        const result = stmt.run(username, passwordHash);
        return { id: result.lastInsertRowid, username };
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return null; // Username already exists
        }
        throw error;
    }
}

export function getUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
}

export function getUserById(id) {
    const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
    return stmt.get(id);
}

// Song operations
export function createSong(userId, title, audioPath, lyricsContent = null, coverUrl = null) {
    const stmt = db.prepare(`
    INSERT INTO songs (user_id, title, audio_path, lyrics_content, cover_url) 
    VALUES (?, ?, ?, ?, COALESCE(?, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60'))
  `);
    const result = stmt.run(userId, title, audioPath, lyricsContent, coverUrl);
    return { id: result.lastInsertRowid };
}

export function getSongsByUser(userId) {
    const stmt = db.prepare('SELECT * FROM songs WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
}

export function getSongById(id) {
    const stmt = db.prepare('SELECT * FROM songs WHERE id = ?');
    return stmt.get(id);
}

export function updateSongLyrics(id, lyricsContent) {
    const stmt = db.prepare('UPDATE songs SET lyrics_content = ? WHERE id = ?');
    return stmt.run(lyricsContent, id);
}

export function deleteSong(id, userId) {
    const stmt = db.prepare('DELETE FROM songs WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
}

export default db;
