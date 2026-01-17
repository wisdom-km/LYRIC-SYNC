'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        fetch('/api/songs')
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
