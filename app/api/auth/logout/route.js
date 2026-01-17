import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

// 处理用户登出请求
export async function POST() {
    try {
        await removeAuthCookie();
        return NextResponse.json({ message: '已退出登录' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
