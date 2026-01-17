# 🏢 Lyric Sync 商业级架构设计文档

> **版本**: v2.0 Enterprise Edition  
> **适用场景**: 百万级用户、高并发、分布式部署

---

## 📋 目录

1. [技术栈架构图](#-技术栈架构图)
2. [项目目录结构](#-项目目录结构)
3. [核心业务流程图](#-核心业务流程图)
4. [数据库设计](#-数据库设计)
5. [安全架构](#-安全架构)
6. [部署架构](#-部署架构)

---

## 🧱 技术栈架构图

### 整体技术架构

```mermaid
graph TB
    subgraph Client ["🖥️ 客户端层 Client Layer"]
        WEB["Web App<br/>Next.js 14 + React 18"]
        IOS["iOS App<br/>Swift + SwiftUI"]
        ANDROID["Android App<br/>Kotlin + Jetpack Compose"]
        DESKTOP["Desktop App<br/>Electron / Tauri"]
    end

    subgraph Gateway ["🚪 网关层 Gateway Layer"]
        CDN["CDN<br/>CloudFlare / AWS CloudFront"]
        LB["负载均衡<br/>Nginx / AWS ALB"]
        AG["API Gateway<br/>Kong / AWS API Gateway"]
    end

    subgraph Services ["⚙️ 微服务层 Microservices"]
        AUTH["认证服务<br/>Auth Service"]
        USER["用户服务<br/>User Service"]
        MUSIC["音乐服务<br/>Music Service"]
        LYRICS["歌词服务<br/>Lyrics Service"]
        SEARCH["搜索服务<br/>Search Service"]
        RECOMMEND["推荐服务<br/>Recommendation"]
        NOTIFY["通知服务<br/>Notification"]
    end

    subgraph Data ["💾 数据层 Data Layer"]
        PG["PostgreSQL<br/>主数据库"]
        REDIS["Redis Cluster<br/>缓存 + 会话"]
        ES["Elasticsearch<br/>全文搜索"]
        S3["对象存储<br/>AWS S3 / MinIO"]
        KAFKA["Kafka<br/>消息队列"]
    end

    subgraph AI ["🤖 AI/ML 层"]
        ML["推荐引擎<br/>TensorFlow / PyTorch"]
        NLP["歌词分析<br/>NLP Pipeline"]
        SYNC["智能同步<br/>Audio-Text Alignment"]
    end

    Client --> CDN --> LB --> AG
    AG --> Services
    Services --> Data
    Services --> AI
```

### 技术选型详解

| 层级            | 技术                   | 选型理由                      | 替代方案                 |
| :-------------- | :--------------------- | :---------------------------- | :----------------------- |
| **前端框架**    | Next.js 14             | SSR/SSG、App Router、内置优化 | Nuxt.js, Remix           |
| **移动端**      | React Native / Flutter | 跨平台、代码复用率高          | 原生开发                 |
| **API Gateway** | Kong                   | 插件丰富、性能优秀            | AWS API Gateway, Traefik |
| **主数据库**    | PostgreSQL             | ACID、JSON支持、扩展性强      | MySQL, CockroachDB       |
| **缓存**        | Redis Cluster          | 高性能、数据结构丰富          | Memcached, KeyDB         |
| **搜索引擎**    | Elasticsearch          | 全文搜索、分析能力强          | Meilisearch, Algolia     |
| **对象存储**    | AWS S3                 | 无限扩展、高可用              | MinIO, Cloudflare R2     |
| **消息队列**    | Kafka                  | 高吞吐、持久化                | RabbitMQ, Pulsar         |
| **容器编排**    | Kubernetes             | 自动扩缩容、服务发现          | Docker Swarm, Nomad      |

### 前端技术栈详情

```mermaid
graph LR
    subgraph Frontend ["前端技术生态"]
        NEXT["Next.js 14"]
        REACT["React 18"]
        TS["TypeScript"]
        TAILWIND["Tailwind CSS"]
        ZUSTAND["Zustand<br/>状态管理"]
        RQ["TanStack Query<br/>数据请求"]
        FRAMER["Framer Motion<br/>动画"]
    end

    subgraph Tools ["开发工具链"]
        TURBO["Turborepo<br/>Monorepo"]
        VITE["Vite<br/>构建工具"]
        VITEST["Vitest<br/>单元测试"]
        PLAYWRIGHT["Playwright<br/>E2E测试"]
        STORYBOOK["Storybook<br/>组件文档"]
    end

    NEXT --> REACT --> TS
    NEXT --> TAILWIND
    REACT --> ZUSTAND
    REACT --> RQ
    REACT --> FRAMER
```

---

## 📁 项目目录结构

### Monorepo 架构

```
lyric-sync-enterprise/
├── 📂 apps/                          # 应用层
│   ├── 📂 web/                       # Web 应用 (Next.js)
│   │   ├── 📂 app/                   # App Router
│   │   │   ├── 📂 (auth)/            # 认证路由组
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── 📂 (dashboard)/       # 仪表盘路由组
│   │   │   │   ├── library/
│   │   │   │   ├── playlists/
│   │   │   │   └── settings/
│   │   │   ├── 📂 player/[id]/       # 播放器页面
│   │   │   ├── 📂 api/               # API 路由
│   │   │   │   ├── 📂 v1/            # API 版本控制
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── songs/
│   │   │   │   │   ├── playlists/
│   │   │   │   │   └── users/
│   │   │   │   └── 📂 webhooks/      # 第三方回调
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📂 components/            # 页面组件
│   │   ├── 📂 hooks/                 # 自定义 Hooks
│   │   ├── 📂 stores/                # 状态管理
│   │   └── 📂 styles/                # 样式文件
│   │
│   ├── 📂 mobile/                    # 移动应用 (React Native)
│   ├── 📂 desktop/                   # 桌面应用 (Electron)
│   └── 📂 admin/                     # 管理后台
│
├── 📂 packages/                      # 共享包
│   ├── 📂 ui/                        # UI 组件库
│   │   ├── 📂 components/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Player/
│   │   │   └── LyricsDisplay/
│   │   └── 📂 themes/
│   │
│   ├── 📂 core/                      # 核心业务逻辑
│   │   ├── 📂 lyrics-parser/         # 歌词解析引擎
│   │   ├── 📂 audio-sync/            # 音频同步算法
│   │   └── 📂 validators/            # 数据验证
│   │
│   ├── 📂 api-client/                # API 客户端 SDK
│   ├── 📂 database/                  # 数据库 Schema & Migrations
│   ├── 📂 config/                    # 共享配置
│   └── 📂 types/                     # TypeScript 类型定义
│
├── 📂 services/                      # 后端微服务
│   ├── 📂 auth-service/              # 认证服务 (Go/Rust)
│   ├── 📂 user-service/              # 用户服务 (Node.js)
│   ├── 📂 music-service/             # 音乐服务 (Node.js)
│   ├── 📂 lyrics-service/            # 歌词服务 (Python)
│   ├── 📂 search-service/            # 搜索服务 (Go)
│   ├── 📂 recommendation-service/    # 推荐服务 (Python)
│   └── 📂 notification-service/      # 通知服务 (Node.js)
│
├── 📂 infrastructure/                # 基础设施即代码
│   ├── 📂 terraform/                 # 云资源编排
│   ├── 📂 kubernetes/                # K8s 配置
│   │   ├── 📂 base/
│   │   ├── 📂 overlays/
│   │   │   ├── development/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── 📂 charts/                # Helm Charts
│   └── 📂 docker/                    # Docker 配置
│
├── 📂 docs/                          # 文档
│   ├── 📂 api/                       # API 文档 (OpenAPI)
│   ├── 📂 architecture/              # 架构文档
│   └── 📂 guides/                    # 开发指南
│
├── 📂 scripts/                       # 脚本工具
├── 📂 tests/                         # 集成测试 & E2E
├── turbo.json                        # Turborepo 配置
├── pnpm-workspace.yaml               # pnpm 工作空间
└── docker-compose.yml                # 本地开发环境
```

### 目录职责说明

```mermaid
graph TB
    subgraph Apps ["📂 apps/ - 应用层"]
        A1["web/ - 主站前端"]
        A2["mobile/ - 移动端"]
        A3["admin/ - 管理后台"]
    end

    subgraph Packages ["📂 packages/ - 共享层"]
        P1["ui/ - 组件库"]
        P2["core/ - 核心逻辑"]
        P3["api-client/ - SDK"]
        P4["types/ - 类型定义"]
    end

    subgraph Services ["📂 services/ - 服务层"]
        S1["auth-service"]
        S2["music-service"]
        S3["lyrics-service"]
        S4["recommendation-service"]
    end

    subgraph Infra ["📂 infrastructure/ - 基础设施"]
        I1["terraform/"]
        I2["kubernetes/"]
        I3["docker/"]
    end

    Apps --> Packages
    Apps --> Services
    Services --> Packages
    Infra --> Services
```

---

## 🔄 核心业务流程图

### 1. 用户认证流程 (OAuth 2.0 + JWT)

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 用户
    participant C as 🖥️ 客户端
    participant GW as 🚪 API Gateway
    participant AS as 🔐 Auth Service
    participant US as 👥 User Service
    participant RD as 📦 Redis
    participant DB as 🗄️ PostgreSQL

    Note over U,DB: 🔵 登录流程
    U->>C: 输入邮箱/密码
    C->>GW: POST /api/v1/auth/login
    GW->>GW: Rate Limiting 检查
    GW->>AS: 转发请求
    AS->>DB: 查询用户 (邮箱索引)
    DB-->>AS: 用户数据
    AS->>AS: Argon2id 验证密码
    AS->>AS: 生成 Access Token (15min)
    AS->>AS: 生成 Refresh Token (7d)
    AS->>RD: 存储 Session 信息
    AS-->>GW: 返回 Token 对
    GW-->>C: Set-Cookie (HttpOnly, Secure)
    C-->>U: 跳转仪表盘

    Note over U,DB: 🟢 Token 刷新流程
    C->>GW: POST /api/v1/auth/refresh
    GW->>AS: 转发请求
    AS->>RD: 验证 Refresh Token
    RD-->>AS: Session 有效
    AS->>AS: 生成新 Access Token
    AS->>RD: 更新 Session
    AS-->>C: 返回新 Token

    Note over U,DB: 🔴 登出流程
    U->>C: 点击登出
    C->>GW: POST /api/v1/auth/logout
    GW->>AS: 转发请求
    AS->>RD: 删除 Session
    AS->>RD: 加入 Token 黑名单
    AS-->>C: 清除 Cookie
```

### 2. 音乐上传与处理流程

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 用户
    participant C as 🖥️ 客户端
    participant GW as 🚪 Gateway
    participant MS as 🎵 Music Service
    participant LS as 📝 Lyrics Service
    participant S3 as ☁️ S3 Storage
    participant KF as 📨 Kafka
    participant WK as ⚙️ Worker
    participant DB as 🗄️ PostgreSQL
    participant ES as 🔍 Elasticsearch

    U->>C: 上传音频 + 歌词文件
    C->>C: 客户端预处理 (格式校验)
    C->>GW: POST /api/v1/songs/upload (multipart)
    GW->>MS: 转发请求
    
    par 并行处理
        MS->>S3: 上传原始音频
        S3-->>MS: 返回 Object Key
    and
        MS->>LS: 解析歌词内容
        LS->>LS: 多格式解析 (LRC/SRT/VTT)
        LS->>LS: 时间轴标准化
        LS-->>MS: 返回解析结果
    end

    MS->>DB: 创建歌曲记录 (状态: processing)
    MS->>KF: 发送处理任务消息
    MS-->>C: 返回上传成功 (song_id)

    Note over WK: 后台异步处理
    KF->>WK: 消费处理任务
    WK->>S3: 获取原始音频
    
    par 音频处理
        WK->>WK: 转码多码率 (128k/256k/320k)
        WK->>WK: 生成波形图数据
        WK->>WK: 提取音频指纹
    and
        WK->>WK: AI 歌词对齐校正
    end

    WK->>S3: 上传处理后文件
    WK->>DB: 更新歌曲记录 (状态: ready)
    WK->>ES: 索引歌曲元数据
    WK->>KF: 发送完成通知
    KF->>C: WebSocket 推送状态更新
    C-->>U: 显示上传完成
```

### 3. 歌词同步播放流程

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 用户
    participant P as 🎵 播放器组件
    participant A as 🔊 Web Audio API
    participant LM as 📝 歌词管理器
    participant S as 📊 状态管理
    participant WS as 🌐 WebSocket
    participant SV as ⚙️ 服务端

    Note over U,SV: 🎬 初始化
    U->>P: 选择歌曲播放
    P->>SV: GET /api/v1/songs/{id}
    SV-->>P: 返回歌曲数据 + 流媒体URL
    P->>LM: 初始化歌词 (预解析缓存)
    LM->>LM: 构建时间索引 (二分查找优化)
    P->>A: 初始化 AudioContext
    P->>WS: 建立实时连接 (同步播放状态)

    Note over U,SV: ▶️ 播放同步
    U->>P: 点击播放
    P->>A: audioContext.resume()
    P->>A: source.start()
    
    loop 每 16ms (requestAnimationFrame)
        A->>P: 当前时间戳 (高精度)
        P->>LM: 查询当前歌词 (二分查找)
        LM-->>P: 返回 {index, progress}
        P->>S: 更新状态
        S->>P: 触发重渲染
        P->>P: 更新高亮 + 滚动动画
    end

    Note over U,SV: 🔄 跨设备同步
    P->>WS: 发送播放状态 (位置/状态)
    WS->>SV: 广播到用户其他设备
    SV->>WS: 推送同步指令
    WS->>P: 接收同步状态
    P->>A: 校正播放位置
```

### 4. 完整数据流架构

```mermaid
flowchart TB
    subgraph Client ["🖥️ 客户端"]
        WEB["Web App"]
        MOBILE["Mobile App"]
        DESKTOP["Desktop App"]
    end

    subgraph Edge ["🌐 边缘层"]
        CDN["CDN<br/>(静态资源)"]
        WAF["WAF<br/>(安全防护)"]
    end

    subgraph Gateway ["🚪 网关层"]
        LB["负载均衡"]
        AG["API Gateway"]
        RL["Rate Limiter"]
    end

    subgraph Auth ["🔐 认证"]
        OAUTH["OAuth 2.0<br/>Server"]
        JWT["JWT<br/>验证"]
    end

    subgraph Core ["⚙️ 核心服务"]
        US["User<br/>Service"]
        MS["Music<br/>Service"]
        LS["Lyrics<br/>Service"]
        PS["Playlist<br/>Service"]
        SS["Search<br/>Service"]
        RS["Recommend<br/>Service"]
    end

    subgraph Async ["📨 异步处理"]
        KAFKA["Kafka"]
        WORKERS["Worker Pool"]
    end

    subgraph Storage ["💾 存储层"]
        PG[(PostgreSQL<br/>主数据)]
        PG_R[(PostgreSQL<br/>只读副本)]
        REDIS[(Redis<br/>缓存/会话)]
        ES[(Elasticsearch<br/>搜索索引)]
        S3[(S3/MinIO<br/>文件存储)]
    end

    subgraph Monitor ["📊 监控"]
        PROM["Prometheus"]
        GRAF["Grafana"]
        JAEGER["Jaeger<br/>链路追踪"]
        SENTRY["Sentry<br/>错误追踪"]
    end

    Client --> CDN --> WAF --> LB
    LB --> AG --> RL
    AG --> Auth
    Auth --> Core
    
    Core --> PG
    Core --> PG_R
    Core --> REDIS
    SS --> ES
    Core --> S3
    
    Core --> KAFKA --> WORKERS
    WORKERS --> PG
    WORKERS --> S3
    WORKERS --> ES

    Core --> PROM
    Core --> JAEGER
    Core --> SENTRY
    PROM --> GRAF
```

---

## 🗃️ 数据库设计

### 完整 ER 图

```mermaid
erDiagram
    USERS ||--o{ SONGS : "上传"
    USERS ||--o{ PLAYLISTS : "创建"
    USERS ||--o{ USER_SESSIONS : "拥有"
    USERS ||--o{ PLAY_HISTORY : "记录"
    USERS ||--o{ FOLLOWS : "关注"
    USERS ||--o{ FOLLOWS : "被关注"
    
    SONGS ||--o{ PLAYLIST_SONGS : "包含于"
    SONGS ||--o{ PLAY_HISTORY : "被播放"
    SONGS ||--o{ SONG_LIKES : "被喜欢"
    SONGS ||--|| LYRICS : "拥有"
    SONGS ||--o{ SONG_FILES : "拥有"
    
    PLAYLISTS ||--o{ PLAYLIST_SONGS : "包含"
    PLAYLISTS ||--o{ PLAYLIST_FOLLOWS : "被关注"

    USERS {
        uuid id PK "主键 UUID"
        string email UK "邮箱 (唯一)"
        string username UK "用户名 (唯一)"
        string password_hash "Argon2id 加密密码"
        string avatar_url "头像 URL"
        string display_name "显示名称"
        enum status "active/suspended/deleted"
        enum role "user/artist/admin"
        jsonb preferences "用户偏好设置"
        timestamp email_verified_at "邮箱验证时间"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    USER_SESSIONS {
        uuid id PK "主键"
        uuid user_id FK "用户ID"
        string refresh_token_hash "刷新令牌哈希"
        string device_info "设备信息"
        inet ip_address "IP地址"
        timestamp expires_at "过期时间"
        timestamp created_at "创建时间"
    }

    SONGS {
        uuid id PK "主键 UUID"
        uuid user_id FK "上传者ID"
        uuid artist_id FK "艺术家ID (可选)"
        string title "歌曲标题"
        string album "专辑名称"
        int duration_ms "时长 (毫秒)"
        string cover_url "封面URL"
        enum status "processing/ready/failed/deleted"
        int play_count "播放次数"
        int like_count "喜欢数"
        jsonb metadata "元数据 (流派/BPM等)"
        tsvector search_vector "全文搜索向量"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    SONG_FILES {
        uuid id PK "主键"
        uuid song_id FK "歌曲ID"
        enum quality "128k/256k/320k/lossless"
        string storage_key "存储路径"
        string content_type "MIME类型"
        bigint file_size "文件大小"
        string checksum "文件校验"
        timestamp created_at "创建时间"
    }

    LYRICS {
        uuid id PK "主键"
        uuid song_id FK "歌曲ID (唯一)"
        text original_content "原始歌词内容"
        jsonb parsed_lines "解析后的歌词行"
        enum format "lrc/srt/vtt/plain"
        string language "语言代码"
        boolean is_synced "是否有时间轴"
        jsonb ai_corrections "AI校正记录"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    PLAYLISTS {
        uuid id PK "主键"
        uuid user_id FK "创建者ID"
        string title "歌单标题"
        text description "歌单描述"
        string cover_url "封面URL"
        boolean is_public "是否公开"
        int song_count "歌曲数量"
        int follower_count "关注数"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    PLAYLIST_SONGS {
        uuid id PK "主键"
        uuid playlist_id FK "歌单ID"
        uuid song_id FK "歌曲ID"
        int position "排序位置"
        uuid added_by FK "添加者ID"
        timestamp added_at "添加时间"
    }

    PLAY_HISTORY {
        uuid id PK "主键"
        uuid user_id FK "用户ID"
        uuid song_id FK "歌曲ID"
        int played_duration_ms "播放时长"
        float completion_rate "完成率"
        string source "来源 (library/playlist/search)"
        jsonb context "播放上下文"
        timestamp played_at "播放时间"
    }

    SONG_LIKES {
        uuid user_id PK,FK "用户ID"
        uuid song_id PK,FK "歌曲ID"
        timestamp created_at "喜欢时间"
    }

    FOLLOWS {
        uuid follower_id PK,FK "关注者ID"
        uuid followed_id PK,FK "被关注者ID"
        timestamp created_at "关注时间"
    }

    PLAYLIST_FOLLOWS {
        uuid user_id PK,FK "用户ID"
        uuid playlist_id PK,FK "歌单ID"
        timestamp created_at "关注时间"
    }
```

### 核心索引设计

```sql
-- 用户表索引
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status) WHERE status != 'deleted';

-- 歌曲表索引
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX idx_songs_search ON songs USING GIN(search_vector);

-- 歌词表索引
CREATE UNIQUE INDEX idx_lyrics_song_id ON lyrics(song_id);

-- 播放历史索引 (时间分区)
CREATE INDEX idx_play_history_user_time ON play_history(user_id, played_at DESC);
CREATE INDEX idx_play_history_song_time ON play_history(song_id, played_at DESC);

-- 歌单歌曲索引
CREATE INDEX idx_playlist_songs_playlist ON playlist_songs(playlist_id, position);
CREATE UNIQUE INDEX idx_playlist_songs_unique ON playlist_songs(playlist_id, song_id);
```

### 分区策略

```sql
-- 播放历史表按月分区
CREATE TABLE play_history (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    song_id uuid NOT NULL,
    played_at timestamp NOT NULL
) PARTITION BY RANGE (played_at);

-- 创建月度分区
CREATE TABLE play_history_2026_01 PARTITION OF play_history
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE play_history_2026_02 PARTITION OF play_history
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 🔐 安全架构

```mermaid
graph TB
    subgraph Security ["安全防护体系"]
        subgraph Edge ["边缘防护"]
            WAF["WAF 防火墙<br/>SQL注入/XSS防护"]
            DDOS["DDoS 防护<br/>流量清洗"]
            BOT["Bot 检测<br/>异常流量识别"]
        end

        subgraph Auth ["认证授权"]
            OAUTH["OAuth 2.0<br/>PKCE Flow"]
            MFA["多因素认证<br/>TOTP/WebAuthn"]
            RBAC["RBAC 权限<br/>细粒度控制"]
        end

        subgraph Data ["数据安全"]
            ENC["数据加密<br/>AES-256-GCM"]
            HASH["密码存储<br/>Argon2id"]
            MASK["数据脱敏<br/>日志/导出"]
        end

        subgraph Monitor ["安全监控"]
            AUDIT["审计日志<br/>操作追踪"]
            ALERT["威胁告警<br/>异常检测"]
            SIEM["SIEM 集成<br/>安全分析"]
        end
    end
```

---

## 🚀 部署架构

```mermaid
graph TB
    subgraph Cloud ["☁️ 云基础设施 (AWS/GCP)"]
        subgraph Region1 ["区域 1 (主)"]
            subgraph AZ1 ["可用区 A"]
                K8S1["K8s Node Pool"]
                PG1[(PostgreSQL<br/>Primary)]
                REDIS1[(Redis<br/>Master)]
            end
            subgraph AZ2 ["可用区 B"]
                K8S2["K8s Node Pool"]
                PG2[(PostgreSQL<br/>Standby)]
                REDIS2[(Redis<br/>Replica)]
            end
        end

        subgraph Region2 ["区域 2 (灾备)"]
            K8S3["K8s Cluster"]
            PG3[(PostgreSQL<br/>Read Replica)]
        end

        subgraph Global ["全球服务"]
            CDN["CloudFront CDN"]
            R53["Route 53<br/>DNS"]
            S3["S3 存储<br/>(跨区域复制)"]
        end
    end

    CDN --> R53
    R53 --> Region1
    R53 --> Region2
    Region1 --> S3
    Region2 --> S3
    PG1 --> PG2
    PG1 --> PG3
```

---

## 📊 性能指标要求

| 指标               | 目标值   | 监控方式             |
| :----------------- | :------- | :------------------- |
| API 响应时间 (p99) | < 200ms  | Prometheus + Grafana |
| 页面加载时间 (LCP) | < 2.5s   | Web Vitals           |
| 可用性 (SLA)       | 99.95%   | StatusPage           |
| 并发用户数         | 100,000+ | Load Testing         |
| 音频流延迟         | < 100ms  | 实时监控             |
| 歌词同步精度       | ±50ms    | 用户反馈             |

---

> 📚 **相关文档**:
> - [API 设计规范](./API_SPECIFICATION.md)
> - [安全合规指南](./SECURITY_COMPLIANCE.md)
> - [运维手册](./OPERATIONS_GUIDE.md)
