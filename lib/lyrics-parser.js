/**
 * 万能歌词解析器 (不依赖后缀)
 * 支持识别 LRC, SRT, STR, VTT 格式内容
 */
export function parseLyrics(content) {
    if (!content || content.trim().length === 0) return [];

    const lyrics = [];
    const normalizedContent = content.replace(/\r\n/g, '\n');

    // 尝试匹配 SRT/STR/VTT 格式 (带有 --> 时间轴)
    if (normalizedContent.includes('-->')) {
        const blocks = normalizedContent.split(/\n\s*\n/);
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l);
            const timeLine = lines.find(l => l.includes('-->'));
            if (timeLine) {
                const timeIndex = lines.indexOf(timeLine);
                const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
                if (timeMatch && lines[timeIndex + 1]) {
                    const time = parseInt(timeMatch[1]) * 3600 +
                        parseInt(timeMatch[2]) * 60 +
                        parseInt(timeMatch[3]) +
                        parseInt(timeMatch[4]) / 1000;
                    const text = lines.slice(timeIndex + 1).join(' ');
                    lyrics.push({ time, text });
                }
            }
        });
    }

    // 同时尝试匹配标准 LRC 格式
    const lrcLines = normalizedContent.split('\n');
    const lrcRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/;
    lrcLines.forEach(line => {
        const match = lrcRegex.exec(line);
        if (match) {
            const m = parseInt(match[1]);
            const s = parseInt(match[2]);
            const msStr = match[3];
            const msVal = msStr.length === 3 ? parseInt(msStr) / 1000 : parseInt(msStr) / 100;
            const time = m * 60 + s + msVal;
            const text = line.replace(lrcRegex, '').trim();
            if (text) lyrics.push({ time, text });
        }
    });

    // 去重并按时间排序
    const uniqueLyrics = Array.from(
        new Map(lyrics.map(item => [item.time.toFixed(3), item])).values()
    );
    return uniqueLyrics.sort((a, b) => a.time - b.time);
}

// 验证歌词内容有效性
export function validateLyrics(content) {
    const parsed = parseLyrics(content);
    return {
        valid: parsed.length > 0,
        lineCount: parsed.length,
        lyrics: parsed,
    };
}
