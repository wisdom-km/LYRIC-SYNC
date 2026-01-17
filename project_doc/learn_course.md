
---

# 新手学习指南 (Beginner's Learning Guide)

本节专为刚开始学习 Web 开发的新手设计，将详细解释项目中每个关键部分的工作原理。

## 1. 环境搭建与项目运行

### 1.1 先决条件
确保你的电脑已安装以下软件：
- **Node.js** (v18+): JavaScript 运行时环境 → [下载地址](https://nodejs.org/)
- **npm**: Node 包管理器 (随 Node.js 一起安装)
- **代码编辑器**: 推荐 VSCode → [下载地址](https://code.visualstudio.com/)

### 1.2 运行项目
```bash
# 1. 进入项目目录
cd lyric-sync-web

# 2. 安装依赖 (首次运行需要)
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开
# 默认地址: http://localhost:3000
```

### 1.3 项目脚本说明
| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热重载） |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产版本 |
| `npm run lint` | 代码规范检查 |

---

## 2. Next.js App Router 基础知识

本项目使用 **Next.js 14** 的 **App Router** 架构。

### 2.1 文件即路由
在 `app/` 目录中，**文件夹结构直接决定 URL 路径**：

```
app/
├── page.js          → 对应路由: /
├── login/
│   └── page.js      → 对应路由: /login
├── dashboard/
│   └── page.js      → 对应路由: /dashboard
└── player/
    └── [id]/
        └── page.js  → 对应路由: /player/1, /player/2, ...
```

**动态路由**：`[id]` 是动态参数，可以匹配任何值。

### 2.2 特殊文件
| 文件名 | 用途 |
|--------|------|
| `page.js` | 页面组件（必须有此文件才能形成路由） |
| `layout.js` | 布局组件（包裹子页面，共享UI） |
| `route.js` | API 路由（处理后端请求） |

### 2.3 客户端 vs 服务端组件
```javascript
// 客户端组件 - 需要交互、状态、浏览器API
'use client';  // ← 必须在文件顶部声明

import { useState } from 'react';

export default function MyComponent() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

```javascript
// 服务端组件 - 默认，无需声明
// 可以直接访问数据库、文件系统

export default async function ServerComponent() {
    const data = await fetchDataFromDB();  // 直接在服务端获取数据
    return <div>{data}</div>;
}
```

---

## 3. 认证系统详解

### 3.1 密码加密 (`lib/auth.js`)
用户密码**绝不能明文存储**！我们使用 `bcryptjs` 进行哈希加密：

```javascript
import bcrypt from 'bcryptjs';

// 加密密码 (注册时使用)
export async function hashPassword(password) {
    return bcrypt.hash(password, 12);  // 12是加密强度
}
// 例: "123456" → "$2a$12$LQv3c1yqBW..."

// 验证密码 (登录时使用)
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);  // 返回 true/false
}
```

### 3.2 JWT 令牌
JWT (JSON Web Token) 用于验证用户身份：

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key';  // 生产环境应使用环境变量

// 创建令牌 (登录成功后)
export function createToken(userId) {
    return jwt.sign(
        { userId },           // 载荷数据
        JWT_SECRET,           // 密钥
        { expiresIn: '7d' }   // 7天后过期
    );
}

// 验证令牌 (每次请求时)
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);  // 返回解码后的数据
    } catch {
        return null;  // 无效或过期
    }
}
```

### 3.3 登录流程图
```
用户输入账号密码
       ↓
POST /api/auth/login
       ↓
查询数据库获取用户
       ↓
bcrypt.compare() 验证密码
       ↓
jwt.sign() 生成Token
       ↓
设置 HttpOnly Cookie
       ↓
返回成功，跳转到 /dashboard
```

---

## 4. 数据库操作 (`lib/db.js`)

### 4.1 SQLite 简介
SQLite 是一个**轻量级嵌入式数据库**，数据存储在单个文件中 (`data/lyric-sync.db`)。

### 4.2 数据库初始化
```javascript
import Database from 'better-sqlite3';

// 创建/连接数据库
const db = new Database('data/lyric-sync.db');

// 创建表 (如果不存在)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 自增主键
    username TEXT UNIQUE NOT NULL,         -- 唯一用户名
    password_hash TEXT NOT NULL,           -- 加密后的密码
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
```

### 4.3 CRUD 操作示例
```javascript
// 创建 (Create)
export function createUser(username, passwordHash) {
    const stmt = db.prepare(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    );
    const result = stmt.run(username, passwordHash);
    return { id: result.lastInsertRowid, username };
}

// 读取 (Read)
export function getUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);  // 返回单条记录或 undefined
}

// 更新 (Update)
export function updateSongLyrics(id, lyricsContent) {
    const stmt = db.prepare('UPDATE songs SET lyrics_content = ? WHERE id = ?');
    return stmt.run(lyricsContent, id);
}

// 删除 (Delete)
export function deleteSong(id, userId) {
    const stmt = db.prepare('DELETE FROM songs WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
}
```

---

## 5. API 路由编写 (`app/api/`)

### 5.1 基本结构
```javascript
// app/api/auth/login/route.js
import { NextResponse } from 'next/server';

// POST 请求处理函数
export async function POST(request) {
    try {
        // 1. 解析请求体
        const { username, password } = await request.json();

        // 2. 验证输入
        if (!username || !password) {
            return NextResponse.json(
                { error: '用户名和密码不能为空' },
                { status: 400 }  // Bad Request
            );
        }

        // 3. 业务逻辑处理...

        // 4. 返回成功响应
        return NextResponse.json({
            message: '登录成功',
            user: { id: 1, username: 'test' }
        });
    } catch (error) {
        // 5. 错误处理
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
```

### 5.2 HTTP 状态码速查
| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 客户端请求参数错误 |
| 401 | Unauthorized | 未登录/Token无效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如用户名已存在） |
| 500 | Server Error | 服务器内部错误 |

---

## 6. 歌词解析器 (`lib/lyrics-parser.js`)

### 6.1 支持的格式

**LRC 格式** (最常见):
```
[00:12.34]第一句歌词
[00:18.50]第二句歌词
```

**SRT/VTT 格式** (字幕文件):
```
1
00:00:12,340 --> 00:00:18,500
第一句歌词

2
00:00:18,500 --> 00:00:25,000
第二句歌词
```

### 6.2 解析逻辑
```javascript
export function parseLyrics(content) {
    const lyrics = [];

    // 检测格式类型
    if (content.includes('-->')) {
        // SRT/VTT 格式解析
        // 提取时间和文本...
    }

    // LRC 格式解析
    const lrcRegex = /\[(\d{2}):(\d{2})[.:](\\d{2,3})\]/;
    // 匹配 [分:秒.毫秒] 格式...

    // 返回格式: [{ time: 12.34, text: "歌词内容" }, ...]
    return lyrics.sort((a, b) => a.time - b.time);
}
```

---

## 7. React 组件模式

### 7.1 状态管理
```javascript
'use client';
import { useState, useEffect } from 'react';

export default function Player() {
    // 状态声明
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // 副作用 (组件挂载时执行)
    useEffect(() => {
        // 设置定时器、事件监听等
        const timer = setInterval(() => {
            // 更新播放时间
        }, 100);

        // 清理函数 (组件卸载时执行)
        return () => clearInterval(timer);
    }, []);  // 空依赖数组 = 只在挂载时执行

    return (
        <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '暂停' : '播放'}
        </button>
    );
}
```

### 7.2 条件渲染
```javascript
return (
    <div>
        {/* 条件 && 内容 */}
        {isLoading && <Spinner />}

        {/* 三元表达式 */}
        {isLoggedIn ? <Dashboard /> : <LoginPage />}

        {/* 多条件 */}
        {status === 'loading' && <Loading />}
        {status === 'error' && <Error />}
        {status === 'success' && <Content />}
    </div>
);
```

---

## 8. CSS 设计系统 (`styles/globals.css`)

### 8.1 CSS 变量
```css
:root {
    /* 颜色定义 */
    --bg-primary: #050505;        /* 主背景色 */
    --text-primary: #ffffff;      /* 主文字色 */
    --text-muted: rgba(255, 255, 255, 0.3);  /* 弱化文字 */

    /* 间距 */
    --spacing-sm: 1rem;   /* 16px */
    --spacing-md: 1.5rem; /* 24px */
    --spacing-lg: 2rem;   /* 32px */

    /* 圆角 */
    --radius-md: 1rem;
    --radius-lg: 1.5rem;
}
```

### 8.2 使用变量
```css
.card {
    background: var(--bg-secondary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-xl);
}
```

### 8.3 响应式设计
```css
/* 移动优先 */
.song-grid {
    grid-template-columns: repeat(2, 1fr);  /* 手机: 2列 */
}

/* 平板 (≥640px) */
@media (min-width: 640px) {
    .song-grid {
        grid-template-columns: repeat(3, 1fr);  /* 平板: 3列 */
    }
}

/* 桌面 (≥1024px) */
@media (min-width: 1024px) {
    .song-grid {
        grid-template-columns: repeat(4, 1fr);  /* 桌面: 4列 */
    }
}
```

---

## 9. 常见问题排查

### 9.1 "Module not found" 错误
```bash
# 解决方法: 重新安装依赖
rm -rf node_modules
npm install
```

### 9.2 数据库锁定错误
```bash
# 确保没有其他进程访问数据库
# 删除锁定文件后重启
rm data/lyric-sync.db-wal
rm data/lyric-sync.db-shm
npm run dev
```

### 9.3 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 或使用其他端口
npm run dev -- -p 3001
```

---

## 10. 推荐学习资源

| 主题 | 资源 |
|------|------|
| React 基础 | [React 官方教程](https://react.dev/learn) |
| Next.js | [Next.js 官方文档](https://nextjs.org/docs) |
| JavaScript | [MDN Web Docs](https://developer.mozilla.org/zh-CN/) |
| CSS | [CSS Tricks](https://css-tricks.com/) |
| SQL 基础 | [SQLite 教程](https://www.runoob.com/sqlite/sqlite-tutorial.html) |

---




如果以后需要更新代码，记得用这几条命令：
---
```bash
git add .
git commit -m "你的修改说明"
git push
```