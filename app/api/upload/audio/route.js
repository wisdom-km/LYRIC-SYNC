import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// 允许的音频文件类型
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

// POST /api/upload/audio - 处理音频文件上传
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

        // 验证文件类型
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)) {
            return NextResponse.json(
                { error: '不支持的音频格式，请上传 MP3, WAV, OGG, M4A, FLAC 或 AAC 文件' },
                { status: 400 }
            );
        }



        // 创建用户上传目录
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(user.id));
        await mkdir(uploadDir, { recursive: true });

        // 生成唯一文件名 (时间戳 + 安全文件名)
        const timestamp = Date.now();
        const ext = path.extname(file.name) || '.mp3';
        const safeName = file.name.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5.-]/g, '_').replace(ext, '');
        const filename = `${timestamp}-${safeName}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // 写入文件
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // 返回相对路径用于数据库存储
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
