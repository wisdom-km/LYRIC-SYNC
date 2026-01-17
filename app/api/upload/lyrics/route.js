import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { validateLyrics } from '@/lib/lyrics-parser';

// POST /api/upload/lyrics - 处理歌词上传和解析
export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const contentType = request.headers.get('content-type') || '';
        let lyricsContent = '';

        if (contentType.includes('multipart/form-data')) {
            // 处理文件上传形式
            const formData = await request.formData();
            const file = formData.get('lyrics');

            if (!file) {
                return NextResponse.json(
                    { error: '请选择歌词文件' },
                    { status: 400 }
                );
            }

            lyricsContent = await file.text();
        } else {
            // 处理纯文本内容
            const body = await request.json();
            lyricsContent = body.content;
        }

        if (!lyricsContent || lyricsContent.trim().length === 0) {
            return NextResponse.json(
                { error: '歌词内容不能为空' },
                { status: 400 }
            );
        }

        // 验证并解析歌词内容
        const result = validateLyrics(lyricsContent);

        if (!result.valid) {
            return NextResponse.json(
                { error: '无法解析歌词内容，请确保文件包含有效的时间戳格式（LRC、SRT 或 VTT）' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: '歌词解析成功',
            lineCount: result.lineCount,
            content: lyricsContent,
            parsed: result.lyrics,
        });
    } catch (error) {
        console.error('Upload lyrics error:', error);
        return NextResponse.json(
            { error: '解析失败，请稍后重试' },
            { status: 500 }
        );
    }
}
