# 🎵 LYRIC SYNC

<p align="center">
  <strong>A Modern Lyrics Synchronization Player</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18.3-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/SQLite-3-blue?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<p align="center">
  <a href="README.md">中文</a> | <strong>English</strong>
</p>

---

## ✨ Features

- 🎤 **Real-time Lyrics Sync** - Lyrics auto-scroll and highlight with the music
- 🌙 **Immersive Mode** - Full-screen lyrics display for focused listening
- 📝 **Multi-format Support** - Supports LRC, SRT, VTT subtitle formats
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Dark theme with glassmorphism design
- 🔐 **User System** - Register, login, and manage your personal music library
- 📋 **Playback Queue** - Manage your upcoming songs

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/wisdom-km/LYRIC-SYNC.git
cd LYRIC-SYNC

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## 📁 Project Structure

```
lyric-sync-web/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── auth/           # Authentication
│   │   ├── songs/          # Song Management
│   │   └── upload/         # File Upload
│   ├── dashboard/          # Music Library Page
│   ├── login/              # Login Page
│   └── player/[id]/        # Player Page
├── components/             # Shared Components
├── lib/                    # Utilities
│   ├── auth.js             # JWT Authentication
│   ├── db.js               # Database Operations
│   └── lyrics-parser.js    # Lyrics Parser
├── styles/                 # Global Styles
└── project_doc/            # Documentation
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS + CSS Variables |
| Icons | Lucide React |
| Database | SQLite (better-sqlite3) |
| Authentication | JWT + bcryptjs |

## 📖 Usage Guide

1. **Register/Login** - Create an account or sign in
2. **Upload Music** - Click "+" to upload audio and lyrics files
3. **Play Music** - Click a song card to open the player
4. **Immersive Mode** - Click the lyrics area for full-screen lyrics
5. **Manage Queue** - Click the queue icon to manage your playlist

## 🎼 Supported Lyrics Formats

### LRC Format
```
[00:12.34]This is the first line
[00:18.50]This is the second line
```

### SRT Format (Recommended ⭐)
This project **perfectly supports SRT subtitle files** - use video subtitles directly as lyrics!

```
1
00:00:12,340 --> 00:00:18,500
This is the first line

2
00:00:18,500 --> 00:00:25,000
This is the second line
```

> 💡 **Tip**: If you have SRT subtitle files from videos, you can upload them directly without any conversion!

### VTT Format
```
WEBVTT

00:00:12.340 --> 00:00:18.500
This is the first line
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/wisdom-km">wisdom-km</a> & <a href="https://deepmind.google/">Antigravity AI</a>
</p>
