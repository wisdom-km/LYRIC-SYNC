import { NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

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

        if (username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: '用户名长度需要在 3-20 个字符之间' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: '密码长度至少 6 个字符' },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUser = getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json(
                { error: '用户名已存在' },
                { status: 409 }
            );
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const user = createUser(username, passwordHash);

        if (!user) {
            return NextResponse.json(
                { error: '注册失败，请稍后重试' },
                { status: 500 }
            );
        }

        // Create and set token
        const token = createToken(user.id);
        await setAuthCookie(token);

        return NextResponse.json({
            message: '注册成功',
            user: { id: user.id, username: user.username },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
