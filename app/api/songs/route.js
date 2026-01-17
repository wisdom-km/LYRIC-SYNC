import { NextResponse } from 'next/server';
import { getSongsByUser, createSong } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/songs - 获取当前用户的所有歌曲
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const songs = getSongsByUser(user.id);
        return NextResponse.json({ songs });
    } catch (error) {
        console.error('Get songs error:', error);
        return NextResponse.json(
            { error: '获取歌曲列表失败' },
            { status: 500 }
        );
    }
}

// POST /api/songs - 创建新歌曲记录
export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const { title, audioPath, lyricsContent, coverUrl } = await request.json();

        if (!title || !audioPath) {
            return NextResponse.json(
                { error: '标题和音频路径不能为空' },
                { status: 400 }
            );
        }

        const song = createSong(user.id, title, audioPath, lyricsContent, coverUrl);
        return NextResponse.json({
            message: '歌曲添加成功',
            song,
        });
    } catch (error) {
        console.error('Create song error:', error);
        return NextResponse.json(
            { error: '添加歌曲失败' },
            { status: 500 }
        );
    }
}
