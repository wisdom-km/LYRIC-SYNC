import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'lyric-sync-secret-key-change-in-production';
const COOKIE_NAME = 'lyric-sync-auth';

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export function createToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function setAuthCookie(token) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = getUserById(decoded.userId);
    return user || null;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}
