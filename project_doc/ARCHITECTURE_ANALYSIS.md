# 🏗️ 架构分析报告 (Architecture Analysis)

**负责代理**: 🧠 Claude (架构分析师)
**项目名称**: Lyric Sync Web
**分析目标**: 为新手开发者提供宏观的项目架构视角，解释"它是什么"以及"它是如何组织的"。

---

## 1. 技术栈概览 (Tech Stack)

本项目是一个现代化的全栈 Web 应用，采用了轻量级但功能强大的技术组合：

| 领域 | 技术选择 | 选择理由 |
| :--- | :--- | :--- |
| **前端框架** | **Next.js 14 (App Router)** | 提供最新的 React 特性，内置路由和 API 支持，极其适合全栈开发。 |
| **UI 库** | **React 18** | 组件化开发的核心，生态丰富。 |
| **样式** | **Tailwind CSS** | 实用优先 (Utility-first) 的 CSS 框架，快速构建现代 UI，无需编写大量自定义 CSS。 |
| **图标库** | **Lucide React** | 一套统一、美观的 SVG 图标库。 |
| **数据库** | **SQLite (better-sqlite3)** | 嵌入式数据库，无需配置服务器，读写速度极快，非常适合单机应用或小型项目。 |
| **认证** | **JWT (JSON Web Tokens)** | 无状态认证机制，配合 HttpOnly Cookie 使用，安全且易于实现。 |

---

## 2. 项目目录结构 (Directory Structure)

项目遵循 Next.js App Router 的标准结构：

```
lyric-sync-web/
├── app/                    # 🚀 应用路由与页面 (核心目录)
│   ├── api/                # 🔌 后端 API 路由 (处理 HTTP 请求)
│   │   ├── auth/           # 认证相关 API (登录、注册、登出)
│   │   ├── songs/          # 歌曲 CRUD API
│   │   └── upload/         # 文件上传 API
│   ├── dashboard/          # 仪表盘页面 (受保护路由)
│   ├── login/              # 登录页面
│   ├── player/             # 播放器页面
│   ├── layout.js           # 全局根布局 (定义 HTML/Body 结构)
│   └── page.js             # 首页 (重定向逻辑)
├── components/             # 🧩 可复用 UI 组件
│   ├── Toast.js            # 消息提示组件
│   ├── AnimatedBackground.js # 背景动画组件
│   └── SongCardSkeleton.js # 加载骨架屏
├── lib/                    # 🛠️ 工具库与后端逻辑
│   ├── auth.js             # 认证工具 (JWT, Hash, Cookie)
│   ├── db.js               # 数据库连接与操作封装
│   └── lyrics-parser.js    # 歌词解析核心逻辑
├── public/                 # 📂 静态资源
│   └── uploads/            # 用户上传的音频文件存储位置
└── data/                   # 💾 数据库文件存储位置 (lyric-sync.db)
```

### 关键设计点：
*   **前后端同构**: `app/` 目录下既包含前端页面 (`page.js`)，也包含后端 API (`route.js`)。这意味着你不需要单独运行一个后端服务器，Next.js 处理了一切。
*   **模块化**: 业务逻辑被抽取到 `lib/` 目录，保持了页面代码的整洁。
*   **组件化**: UI 元素在 `components/` 中定义，可以在多个页面复用。

---

## 3. 数据流与架构图 (Data Flow)

### 3.1 核心流程
1.  **用户交互**: 用户在浏览器 (Client) 点击"播放"或"上传"。
2.  **API 请求**: 浏览器发送 `fetch` 请求到 `/api/...` (Server)。
3.  **数据处理**: API 路由接收请求，通过 `lib/db.js`操作 SQLite 数据库，或通过 `fs` 模块读写文件。
4.  **响应返回**: 服务器返回 JSON 数据。
5.  **UI 更新**: React 组件根据返回的数据更新状态 (`useState`)，重新渲染页面。

### 3.2 数据库模式 (Schema)
项目包含两个核心表，通过 `user_id` 关联：

*   **Users (用户表)**
    *   `id`: 主键
    *   `username`: 用户名 (唯一)
    *   `password_hash`: 加密后的密码
*   **Songs (歌曲表)**
    *   `id`: 主键
    *   `user_id`: 外键，关联到 Users 表
    *   `title`: 歌曲标题
    *   `audio_path`: 音频文件存储路径
    *   `lyrics_content`: 歌词文本内容
    *   `cover_url`: 封面图链接

---

## 4. 给新手的建议 (Architect's Advice)
1.  **从哪里开始看代码?**
    *   先看 `lib/db.js` 了解数据长什么样。
    *   再看 `app/dashboard/page.js` 了解数据怎么被展示。
2.  **如何调试?**
    *   前端逻辑用浏览器的 `console.log`。
    *   后端 API 逻辑 (API Routes) 的日志会输出在 VS Code 的终端里。
3.  **注意事项**:
    *   API 路由运行在服务器端，不能使用浏览器特有的 API (如 `window`, `document`)。
    *   页面组件 (`page.js`) 开头即使写了 `'use client'`，它在首次加载时仍然会在服务器端进行预渲染 (SSR)。
