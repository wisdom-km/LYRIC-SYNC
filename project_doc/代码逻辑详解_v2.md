# 🧩 代码逻辑详解 (Code Logic Explainer)

**负责代理**: 💎 Gemini (逻辑讲解员)
**项目名称**: Lyric Sync Web
**分析目标**: 深入代码细节，解释关键功能"具体是怎么实现的"，适合想学习具体编码实现的新手。

---

## 1. 核心逻辑：歌词解析 (Lyrics Parsing)

**文件**: `lib/lyrics-parser.js`

### 💡 核心问题
我们需要将文本格式的歌词（如 `[00:12.34]Hello World`）转换成程序能处理的数组对象。

### 🔑 实现原理
1.  **正则匹配 (Regex Magic)**
    我们使用正则表达式来"捕获"时间信息：
    ```javascript
    const lrcRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/;
    ```
    *   `(\d{2})`: 捕获两个数字 (分钟)
    *   `(\d{2})`: 捕获两个数字 (秒)
    *   `(\d{2,3})`: 捕获两到三个数字 (毫秒)

2.  **时间标准化**
    将捕获到的 分、秒、毫秒 统一转换为 **总秒数** (Float)，方便后续与播放器进度对比：
    ```javascript
    const time = minute * 60 + second + (millisecond / 1000);
    // 结果示例: 12.345 (秒)
    ```

---

## 2. 核心逻辑：播放器同步 (Player Sync)

**文件**: `app/player/[id]/page.js`

### 💡 核心问题
当歌曲播放时，如何让界面上的歌词准确高亮，并自动滚动？

### 🔑 实现原理
1.  **监听时间更新**
    HTML5 `<audio>` 元素的 `onTimeUpdate` 事件会每秒触发多次。我们用它更新 React 状态：
    ```javascript
    <audio onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)} ... />
    ```

2.  **查找当前歌词 (The Find Algorithm)**
    在 `useEffect` 中，每次 `currentTime` 变化时，我们寻找**开始时间小于等于当前时间**的最后一句歌词：
    ```javascript
    // 找到最后一句 "开始时间 <= 当前时间" 的歌词
    const index = lyrics.findLastIndex(item => item.time <= currentTime);
    setActiveIndex(index);
    ```

3.  **自动滚动 (Auto Scroll)**
    利用 DOM API `scrollIntoView`，让高亮的那一行始终保持在屏幕中间：
    ```javascript
    if (activeIndex !== -1) {
        lyricRefs.current[activeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center' // 关键参数：居中
        });
    }
    ```

---

## 3. 核心逻辑：用户认证 (Authentication)

**文件**: `lib/auth.js`

### 💡 核心问题
如何识别用户身份，并保证安全性？

### 🔑 实现原理
1.  **密码加密 (Hashing)**
    永远不要直接存储密码！我们在注册时使用 `bcrypt` 库对密码进行**加盐哈希**：
    ```javascript
    // 原始密码 "123456" -> 数据库变成 "$2a$12$R9..."
    bcrypt.hash(password, 12);
    ```

2.  **JWT 令牌 (Token)**
    登录成功后，我们签发一个 JWT 字符串，里面藏着用户的 ID：
    ```javascript
    jwt.sign({ userId }, YOUR_SECRET_KEY, { expiresIn: '7d' });
    ```

3.  **HttpOnly Cookie**
    为了防止 XSS 攻击 (黑客用 JS 偷你的 Token)，我们将 Token 存入 **HttpOnly Cookie**。这种 Cookie 浏览器的 JavaScript **读不到**，但发请求时浏览器会**自动带上**，既安全又方便。

---

## 4. 核心逻辑：数据库防注入 (SQL Injection Prevention)

**文件**: `lib/db.js`

### 💡 核心问题
如何防止用户输入恶意代码破坏数据库？

### 🔑 实现原理
我们在项目中使用了 **预编译语句 (Prepared Statements)**，这是防止 SQL 注入的金标准。

**❌ 危险写法 (拼接字符串):**
```javascript
// if username is: "admin' --"
db.exec(`SELECT * FROM users WHERE username = '${username}'`);
```

**✅ 安全写法 (参数化查询):**
```javascript
// lib/db.js 中的写法
const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
stmt.run(username); // 即使 username 包含恶意代码，也只会被视为纯文本
```
在该项目中，所有数据库操作（`stmt.run`, `stmt.get`）都使用了这种安全模式。
