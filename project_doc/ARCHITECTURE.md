# Lyric Sync Web - Architecture Documentation

## Project Overview

**Lyric Sync Web** is a modern, web-based music player application focused on providing a high-quality lyric synchronization experience. It features a responsive UI, immersive playback modes, and real-time lyric scrolling.

## Technology Stack

### Frontend
- **Framework**: [Next.js 14.2.0](https://nextjs.org/) (App Router)
- **Library**: [React 18.3.0](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Inter (via Google Fonts)

### Backend
- **Runtime**: Next.js API Routes (Serverless functions)
- **Database**: SQLite (via `better-sqlite3`)
- **Authentication**: Custom JWT-based auth (`jsonwebtoken`, `bcryptjs`)
- **File Parsing**: Custom logic for LRC/SRT/VTT formats

## Project Structure

```
lyric-sync-web/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes (Backend)
│   │   ├── auth/           # Authentication endpoints (login, register)
│   │   ├── songs/          # Song management (CRUD)
│   │   ├── upload/         # File upload handlers
│   ├── dashboard/          # Main user dashboard (Music Library)
│   ├── login/              # Login page
│   ├── player/[id]/        # Music Player Page (Dynamic Route)
│   │   └── page.js         # Core Player Logic (Playback, Lyrics, Queue)
│   ├── register/           # Registration page
│   ├── layout.js           # Root layout (Global styles, fonts)
│   └── page.js             # Landing/Redirect page
├── components/             # Shared UI Components
│   ├── AnimatedBackground.js
│   ├── SongCardSkeleton.js
│   └── Toast.js
├── lib/                    # Core Utilities & Business Logic
│   ├── auth.js             # Auth helpers (JWT handling)
│   ├── db.js               # Database connection & Schema definitions
│   └── lyrics-parser.js    # Lyric file parsing logic
├── public/                 # Static Assets (Images, Icons)
├── data/                   # SQLite Database storage
└── styles/                 # Global CSS
```

## Core Features & Modules

### 1. User Authentication
*   **Mechanism**: Custom JWT (JSON Web Token) implementation.
*   **Flow**:
    *   **Register**: `/api/auth/register` creates a user with hashed password.
    *   **Login**: `/api/auth/login` verifies credentials and issues a JWT.
    *   **Session**: Token stored in local state/cookies (implementation detail).

### 2. Dashboard (Music Library)
*   **Path**: `/dashboard`
*   **Functionality**:
    *   Displays grid of uploaded songs.
    *   Search/Filter functionality (Apple-style search bar).
    *   Music upload interface (Audio + Cover + Lyrics).
    *   Song management (Edit/Delete).

### 3. Music Player
*   **Path**: `/player/[id]`
*   **Core Logic**: Handles audio playback using HTML5 `Audio` API.
*   **Sub-features**:
    *   **Synced Lyrics**: Real-time scrolling lyrics based on current playback time.
    *   **Immersive Mode**: Full-screen, distraction-free lyric view with dynamic backgrounds.
    *   **Playback Queue**: Manage upcoming songs.
    *   **Responsive UI**: Adapts to mobile and desktop layouts.

### 4. Data Management (SQLite)
The application uses a local SQLite database (`data/lyric-sync.db`) managed via `better-sqlite3`.

**Schema:**
*   **`users`**:
    *   `id` (PK, Auto-inc)
    *   `username` (Unique)
    *   `password_hash`
    *   `created_at`
*   **`songs`**:
    *   `id` (PK, Auto-inc)
    *   `user_id` (FK -> users.id)
    *   `title`
    *   `audio_path` (Path to local file)
    *   `lyrics_content` (Text content of lyrics)
    *   `cover_url` (URL to cover image)
    *   `created_at`

### 5. API Endpoints
*   `POST /api/auth/register`: Create new account.
*   `POST /api/auth/login`: Authenticate user.
*   `POST /api/auth/logout`: End session.
*   `GET /api/songs`: List user's songs.
*   `POST /api/upload`: Handle file uploads.

## UI/UX Design System
*   **Theme**: Dark mode first, using deeply saturated blues and purples.
*   **Glassmorphism**: Extensive use of `backdrop-filter: blur()` and semi-transparent backgrounds (`rgba`).
*   **Typography**: Clean sans-serif (Inter) with careful hierarchy.
*   **Immersive Experience**: Emphasis on content (album art, lyrics) with controls fading away when not needed.

## Future Roadmap (Potential)
*   **Cloud Storage**: Move from local file storage to S3/Cloudinary.
*   **Social Features**: Share playlists or lyrics.
*   **Mobile App**: PWA or Native wrapper (Capacitor).

---

# Lyric Sync Web - 架构文档 (中文版)

## 项目概览

**Lyric Sync Web** 是一个现代化的基于Web的音乐播放器应用，专注于提供高质量的歌词同步体验。它具有响应式用户界面、沉浸式播放模式和实时歌词滚动功能。

## 技术栈

### 前端
- **框架**: [Next.js 14.2.0](https://nextjs.org/) (App Router)
- **库**: [React 18.3.0](https://react.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **字体**: Inter (via Google Fonts)

### 后端
- **运行时**: Next.js API Routes (Serverless functions)
- **数据库**: SQLite (via `better-sqlite3`)
- **认证**: 自定义 JWT 认证机制 (`jsonwebtoken`, `bcryptjs`)
- **文件解析**: 自定义 LRC/SRT/VTT 格式解析逻辑

## 项目结构

```
lyric-sync-web/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由 (后端)
│   │   ├── auth/           # 认证接口 (登录, 注册)
│   │   ├── songs/          # 歌曲管理 (增删改查)
│   │   └── upload/         # 文件上传处理
│   ├── dashboard/          # 主用户仪表盘 (音乐库)
│   ├── login/              # 登录页面
│   ├── player/[id]/        # 音乐播放器页面 (动态路由)
│   │   └── page.js         # 核心播放器逻辑 (播放, 歌词, 队列)
│   ├── register/           # 注册页面
│   ├── layout.js           # 根布局 (全局样式, 字体)
│   └── page.js             # 落地/重定向页面
├── components/             # 共享 UI 组件
│   ├── AnimatedBackground.js
│   ├── SongCardSkeleton.js
│   └── Toast.js
├── lib/                    # 核心工具 & 业务逻辑
│   ├── auth.js             # 认证助手 (JWT 处理)
│   ├── db.js               # 数据库连接 & 架构定义
│   └── lyrics-parser.js    # 歌词文件解析逻辑
├── public/                 # 静态资源 (图片, 图标)
├── data/                   # SQLite 数据库存储
└── styles/                 # 全局 CSS
```

## 核心功能 & 模块

### 1. 用户认证
*   **机制**: 自定义 JWT (JSON Web Token) 实现。
*   **流程**:
    *   **注册**: `/api/auth/register` 创建带有哈希密码的用户。
    *   **登录**: `/api/auth/login` 验证凭据并颁发 JWT。
    *   **会话**: Token 存储在本地状态/Cookie 中。

### 2. 仪表盘 (音乐库)
*   **路径**: `/dashboard`
*   **功能**:
    *   显示已上传歌曲的网格。
    *   搜索/过滤功能 (Apple 风格搜索栏)。
    *   音乐上传界面 (音频 + 封面 + 歌词)。
    *   歌曲管理 (编辑/删除)。

### 3. 音乐播放器
*   **路径**: `/player/[id]`
*   **核心逻辑**: 使用 HTML5 `Audio` API 处理音频播放。
*   **子功能**:
    *   **同步歌词**: 基于当前播放时间的实时滚动歌词。
    *   **沉浸模式**: 全屏、无干扰的带有动态背景的歌词视图。
    *   **播放队列**: 管理即将播放的歌曲。
    *   **响应式 UI**: 适配移动端和桌面端布局。

### 4. 数据管理 (SQLite)
应用使用通过 `better-sqlite3` 管理的本地 SQLite 数据库 (`data/lyric-sync.db`)。

**架构 (Schema):**
*   **`users`**:
    *   `id` (主键, 自增)
    *   `username` (唯一)
    *   `password_hash`
    *   `created_at`
*   **`songs`**:
    *   `id` (主键, 自增)
    *   `user_id` (外键 -> users.id)
    *   `title`
    *   `audio_path` (本地文件路径)
    *   `lyrics_content` (歌词文本内容)
    *   `cover_url` (封面图片 URL)
    *   `created_at`

### 5. API 端点
*   `POST /api/auth/register`: 创建新账户。
*   `POST /api/auth/login`: 用户认证。
*   `POST /api/auth/logout`: 结束会话。
*   `GET /api/songs`: 列出用户的歌曲。
*   `POST /api/upload`: 处理文件上传。

## UI/UX 设计系统
*   **主题**: 暗色模式优先，使用深度饱和的蓝色和紫色。
*   **玻璃拟态**: 大量使用 `backdrop-filter: blur()` 和半透明背景 (`rgba`)。
*   **排版**: 干净的无衬线字体 (Inter)，层次分明。
*   **沉浸体验**: 强调内容 (专辑封面, 歌词)，控件在不需要时淡出。

## 未来路线图 (潜在)
*   **云存储**: 从本地文件存储迁移到 S3/Cloudinary。
*   **社交功能**: 分享播放列表或歌词。
*   **移动应用**: PWA 或原生封装 (Capacitor)。

