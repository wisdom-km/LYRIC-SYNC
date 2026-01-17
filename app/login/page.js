'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Music, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

// 登录页面组件
export default function LoginPage() {
    const router = useRouter();
    // 表单状态
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // 加载状态，防止重复提交
    const [loading, setLoading] = useState(false);

    // 处理登录表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 调用登录 API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '登录失败');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch (err) {
            setError('网络错误，请稍后重试');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-md">
            {/* 动态背景组件 */}
            <AnimatedBackground />

            <div className="card w-full max-w-md relative z-10 animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-lg">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-md animate-pulse">
                        <Music size={40} className="text-white/80" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent drop-shadow-lg mb-xs">
                        LYRIC SYNC
                    </h1>
                    <p className="text-muted text-sm">登录您的账户</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    {error && (
                        <div className="alert alert-error animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">用户名</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                className="input"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="请输入用户名"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">密码</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="password"
                                className="input"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="请输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full mt-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                登录中...
                            </>
                        ) : (
                            <>
                                登录
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-lg">
                    <p className="text-muted text-sm">
                        还没有账户？{' '}
                        <Link href="/register" className="text-white font-semibold hover:underline">
                            立即注册
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
