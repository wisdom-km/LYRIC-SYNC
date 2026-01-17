import '@/styles/globals.css';

// 定义页面元数据 (SEO)
export const metadata = {
    title: 'Lyric Sync - 歌词同步播放器',
    description: '上传音频和歌词，享受实时同步的歌词体验',
};

// 定义视口配置
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

// 根布局组件，包含全局字体和样式
export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                {children}
            </body>
        </html>
    );
}
