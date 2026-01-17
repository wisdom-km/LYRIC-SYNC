import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserById } from './db';

// JWT 密钥，生产环境应使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'lyric-sync-secret-key-change-in-production';
// Cookie 名称
const COOKIE_NAME = 'lyric-sync-auth';

// 对密码进行哈希加密
export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

// 验证密码是否匹配
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// 创建 JWT 令牌，有效期 7 天
export function createToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// 验证 JWT 令牌
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// 设置 HttpOnly Cookie 保存令牌
export async function setAuthCookie(token) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
    });
}

// 删除认证 Cookie (登出)
export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// 获取当前登录用户信息
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = getUserById(decoded.userId);
    return user || null;
}

// 强制要求登录，未登录则抛出错误
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}
