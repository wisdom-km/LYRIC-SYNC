import '@/styles/globals.css';

export const metadata = {
    title: 'Lyric Sync - 歌词同步播放器',
    description: '上传音频和歌词，享受实时同步的歌词体验',
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

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
