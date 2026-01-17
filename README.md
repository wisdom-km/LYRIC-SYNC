# 🎵 LYRIC SYNC

<p align="center">
  <strong>现代化的歌词同步播放器 | A Modern Lyrics Synchronization Player</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18.3-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/SQLite-3-blue?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## ✨ 功能特性

- 🎤 **实时歌词同步** - 歌词随音乐自动滚动高亮
- 🌙 **沉浸模式** - 全屏歌词显示，专注聆听体验
- 📝 **多格式支持** - 支持 LRC、SRT、VTT 歌词格式
- 📱 **响应式设计** - 完美适配手机、平板、桌面
- 🎨 **现代化 UI** - 暗色主题 + 玻璃拟态设计
- 🔐 **用户系统** - 注册登录，个人音乐库管理
- 📋 **播放队列** - 管理即将播放的歌曲列表

## 🖼️ 预览

| 登录页面 | 音乐库 | 播放器 |
|:---:|:---:|:---:|
| 简洁登录界面 | 网格化歌曲展示 | 实时歌词同步 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/wisdom-km/LYRIC-SYNC.git
cd LYRIC-SYNC

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:3000
```

## 📁 项目结构

```
lyric-sync-web/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── auth/           # 认证接口
│   │   ├── songs/          # 歌曲管理
│   │   └── upload/         # 文件上传
│   ├── dashboard/          # 音乐库页面
│   ├── login/              # 登录页面
│   └── player/[id]/        # 播放器页面
├── components/             # 共享组件
├── lib/                    # 工具函数
│   ├── auth.js             # JWT 认证
│   ├── db.js               # 数据库操作
│   └── lyrics-parser.js    # 歌词解析器
├── styles/                 # 全局样式
└── project_doc/            # 项目文档
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| UI 库 | React 18 |
| 样式 | Tailwind CSS + CSS Variables |
| 图标 | Lucide React |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT + bcryptjs |

## 📖 使用指南

1. **注册/登录** - 创建账户或登录已有账户
2. **上传音乐** - 点击 "+" 按钮上传音频和歌词文件
3. **播放音乐** - 点击歌曲卡片进入播放器
4. **沉浸模式** - 点击歌词区域进入全屏歌词模式
5. **管理队列** - 点击队列图标管理播放列表

## 🎼 支持的歌词格式

### LRC 格式
```
[00:12.34]这是第一句歌词
[00:18.50]这是第二句歌词
```

### SRT/VTT 格式
```
1
00:00:12,340 --> 00:00:18,500
这是第一句歌词
```

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/wisdom-km">wisdom-km</a>
</p>
