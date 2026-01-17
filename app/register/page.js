'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Music, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

// 注册页面组件
export default function RegisterPage() {
    const router = useRouter();
    // 表单状态
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 处理注册表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 验证两次密码是否一致
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '注册失败');
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
            {/* Background */}
            {/* Background */}
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
                    <p className="text-muted text-sm">创建新账户</p>
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
                                placeholder="3-20 个字符"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                minLength={3}
                                maxLength={20}
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
                                placeholder="至少 6 个字符"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">确认密码</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="password"
                                className="input"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="再次输入密码"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                注册中...
                            </>
                        ) : (
                            <>
                                创建账户
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-lg">
                    <p className="text-muted text-sm">
                        已有账户？{' '}
                        <Link href="/login" className="text-white font-semibold hover:underline">
                            立即登录
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
