import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/flac',
    'audio/aac',
];

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('audio');

        if (!file) {
            return NextResponse.json(
                { error: '请选择音频文件' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)) {
            return NextResponse.json(
                { error: '不支持的音频格式，请上传 MP3, WAV, OGG, M4A, FLAC 或 AAC 文件' },
                { status: 400 }
            );
        }



        // Create user upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(user.id));
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name) || '.mp3';
        const safeName = file.name.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5.-]/g, '_').replace(ext, '');
        const filename = `${timestamp}-${safeName}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return relative path for database storage
        const relativePath = `/uploads/${user.id}/${filename}`;

        return NextResponse.json({
            message: '上传成功',
            path: relativePath,
            filename: file.name,
        });
    } catch (error) {
        console.error('Upload audio error:', error);
        return NextResponse.json(
            { error: '上传失败，请稍后重试' },
            { status: 500 }
        );
    }
}
