import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { error: '用户名和密码不能为空' },
                { status: 400 }
            );
        }

        // Find user
        const user = getUserByUsername(username);
        if (!user) {
            return NextResponse.json(
                { error: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // Create and set token
        const token = createToken(user.id);
        await setAuthCookie(token);

        return NextResponse.json({
            message: '登录成功',
            user: { id: user.id, username: user.username },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
