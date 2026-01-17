import { NextResponse } from 'next/server';
import { getSongById, deleteSong, updateSongLyrics } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// GET /api/songs/[id] - 获取单首歌曲详情
export async function GET(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const song = getSongById(parseInt(id));

        if (!song) {
            return NextResponse.json(
                { error: '歌曲不存在' },
                { status: 404 }
            );
        }

        if (song.user_id !== user.id) {
            return NextResponse.json(
                { error: '无权访问该歌曲' },
                { status: 403 }
            );
        }

        return NextResponse.json({ song });
    } catch (error) {
        console.error('Get song error:', error);
        return NextResponse.json(
            { error: '获取歌曲失败' },
            { status: 500 }
        );
    }
}

// PATCH /api/songs/[id] - 更新歌曲歌词
export async function PATCH(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const song = getSongById(parseInt(id));

        if (!song || song.user_id !== user.id) {
            return NextResponse.json(
                { error: '歌曲不存在或无权访问' },
                { status: 404 }
            );
        }

        const { lyricsContent } = await request.json();
        updateSongLyrics(parseInt(id), lyricsContent);

        return NextResponse.json({ message: '歌词已更新' });
    } catch (error) {
        console.error('Update song error:', error);
        return NextResponse.json(
            { error: '更新失败' },
            { status: 500 }
        );
    }
}

// DELETE /api/songs/[id] - 删除歌曲
export async function DELETE(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const song = getSongById(parseInt(id));

        if (!song || song.user_id !== user.id) {
            return NextResponse.json(
                { error: '歌曲不存在或无权访问' },
                { status: 404 }
            );
        }

        // 删除音频文件
        const audioPath = path.join(process.cwd(), 'public', song.audio_path);
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }

        deleteSong(parseInt(id), user.id);

        return NextResponse.json({ message: '歌曲已删除' });
    } catch (error) {
        console.error('Delete song error:', error);
        return NextResponse.json(
            { error: '删除失败' },
            { status: 500 }
        );
    }
}
