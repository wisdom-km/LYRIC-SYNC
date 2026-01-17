import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'lyric-sync.db');

// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 初始化数据库表
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

// 用户相关操作 (User operations)
// 创建新用户
export function createUser(username, passwordHash) {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    try {
        const result = stmt.run(username, passwordHash);
        return { id: result.lastInsertRowid, username };
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return null; // 用户名已存在
        }
        throw error;
    }
}

// 根据用户名查找用户
export function getUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
}

// 根据 ID 查找用户
export function getUserById(id) {
    const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
    return stmt.get(id);
}

// 歌曲相关操作 (Song operations)
// 创建新歌曲记录
export function createSong(userId, title, audioPath, lyricsContent = null, coverUrl = null) {
    const stmt = db.prepare(`
    INSERT INTO songs (user_id, title, audio_path, lyrics_content, cover_url) 
    VALUES (?, ?, ?, ?, COALESCE(?, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60'))
  `);
    const result = stmt.run(userId, title, audioPath, lyricsContent, coverUrl);
    return { id: result.lastInsertRowid };
}

// 获取指定用户的所有歌曲
export function getSongsByUser(userId) {
    const stmt = db.prepare('SELECT * FROM songs WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
}

// 根据 ID 获取歌曲详情
export function getSongById(id) {
    const stmt = db.prepare('SELECT * FROM songs WHERE id = ?');
    return stmt.get(id);
}

// 更新歌曲的歌词内容
export function updateSongLyrics(id, lyricsContent) {
    const stmt = db.prepare('UPDATE songs SET lyrics_content = ? WHERE id = ?');
    return stmt.run(lyricsContent, id);
}

// 删除歌曲
export function deleteSong(id, userId) {
    const stmt = db.prepare('DELETE FROM songs WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
}

export default db;
