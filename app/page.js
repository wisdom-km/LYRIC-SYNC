'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 首页组件，负责根据登录状态重定向
export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // 检查用户登录状态
        fetch('/api/songs') // 尝试获取歌曲列表作为验证手段
            .then(res => {
                if (res.ok) {
                    router.replace('/dashboard');
                } else {
                    router.replace('/login');
                }
            })
            .catch(() => {
                router.replace('/login');
            });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="spinner mx-auto mb-md"></div>
                <p className="text-muted text-sm">加载中...</p>
            </div>
        </div>
    );
}
