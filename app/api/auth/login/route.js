import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

// 处理用户登录请求
export async function POST(request) {
    try {
        const { username, password } = await request.json();

        // 验证请求参数
        if (!username || !password) {
            return NextResponse.json(
                { error: '用户名和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找用户
        const user = getUserByUsername(username);
        if (!user) {
            return NextResponse.json(
                { error: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // 验证密码
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // 创建令牌并设置 Cookie
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
