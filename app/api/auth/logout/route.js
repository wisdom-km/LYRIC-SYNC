import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

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
