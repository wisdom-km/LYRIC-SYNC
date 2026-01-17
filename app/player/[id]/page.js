'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Play, Pause, ChevronDown,
    Volume, Volume1, Volume2, VolumeX,
    Quote, Repeat, Repeat1, RotateCcw, RotateCw,
    Music, Upload, FileText, X, Settings, ListMusic, Maximize2, Minimize2,
    ArrowUpDown, ArrowUpAZ, ArrowDownZA, Search
} from 'lucide-react';
import { parseLyrics } from '@/lib/lyrics-parser';

// 播放器页面组件
export default function PlayerPage() {
    const params = useParams();
    const router = useRouter();
    // 歌曲数据状态
    const [song, setSong] = useState(null);
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 播放器状态 (Player state)
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showLyrics, setShowLyrics] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // off, one (单曲循环)
    const [playbackRate, setPlaybackRate] = useState(1);

    // 歌词状态 (Lyrics state)
    const [lyrics, setLyrics] = useState([]);
    const [showLyricsUpload, setShowLyricsUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // UI 和交互状态 (UI state)
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [queueSortOrder, setQueueSortOrder] = useState('default'); // 'default' | 'asc' | 'desc'
    const [queueSearchTerm, setQueueSearchTerm] = useState('');
    const [isImmersive, setIsImmersive] = useState(false);

    // 引用 (Refs)
    const audioRef = useRef(null);
    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);
    const immersiveLyricRefs = useRef([]);
    const progressRef = useRef(null);

    // 加载保存的偏好设置
    useEffect(() => {
        const savedVolume = localStorage.getItem('playerVolume');
        const savedRate = localStorage.getItem('playbackRate');
        if (savedVolume) setVolume(parseFloat(savedVolume));
        if (savedRate) setPlaybackRate(parseFloat(savedRate));
    }, []);

    // Save volume preference
    useEffect(() => {
        localStorage.setItem('playerVolume', volume.toString());
    }, [volume]);

    // Save playback rate preference
    useEffect(() => {
        localStorage.setItem('playbackRate', playbackRate.toString());
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (params.id) {
            fetchSong();
            fetchAllSongs();
        }
    }, [params.id]);

    const fetchAllSongs = async () => {
        try {
            const res = await fetch('/api/songs');
            if (res.ok) {
                const data = await res.json();
                setAllSongs(data.songs || []);
            }
        } catch (err) {
            console.error('Failed to fetch songs:', err);
        }
    };

    const fetchSong = async () => {
        try {
            const res = await fetch(`/api/songs/${params.id}`);
            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Song not found');
            }
            const data = await res.json();
            setSong(data.song);

            if (data.song.lyrics_content) {
                const parsed = parseLyrics(data.song.lyrics_content);
                setLyrics(parsed);
            }
        } catch (err) {
            setError('无法加载歌曲');
        } finally {
            setLoading(false);
        }
    };

    // 更新当前活跃的歌词索引
    useEffect(() => {
        if (lyrics.length === 0) return;
        const index = lyrics.findLastIndex(item => item.time <= currentTime);
        if (index !== activeIndex) setActiveIndex(index);
    }, [currentTime, lyrics, activeIndex]);

    // 滚动到当前活跃歌词
    useEffect(() => {
        if (activeIndex !== -1) {
            if (showLyrics && lyricRefs.current[activeIndex]) {
                lyricRefs.current[activeIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            if (isImmersive && immersiveLyricRefs.current[activeIndex]) {
                immersiveLyricRefs.current[activeIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [activeIndex, showLyrics, isImmersive]);

    // 音量同步到 Audio 元素
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // 键盘快捷键支持
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skipBackward();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skipForward();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(v => Math.min(1, v + 0.1));
                    setIsMuted(false);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(v => Math.max(0, v - 0.1));
                    break;
                case 'KeyM':
                    e.preventDefault();
                    setIsMuted(m => !m);
                    break;
                case 'KeyL':
                    e.preventDefault();
                    setShowLyrics(l => !l);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const togglePlay = useCallback((e) => {
        e?.stopPropagation();
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    }, [isPlaying]);

    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
    };

    const skipForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = percent * duration;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleProgressMouseDown = (e) => {
        setIsDragging(true);
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragTime(percent * duration);
    };

    const handleProgressMouseMove = useCallback((e) => {
        if (!isDragging || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragTime(percent * duration);
    }, [isDragging, duration]);

    const handleProgressMouseUp = useCallback((e) => {
        if (!isDragging) return;
        setIsDragging(false);
        if (progressRef.current && audioRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const time = percent * duration;
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, [isDragging, duration]);

    // Touch support for progress bar
    const handleProgressTouchStart = (e) => {
        const touch = e.touches[0];
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        setIsDragging(true);
        setDragTime(percent * duration);
    };

    const handleProgressTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        setDragTime(percent * duration);
    };

    const handleProgressTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (audioRef.current) {
            audioRef.current.currentTime = dragTime;
            setCurrentTime(dragTime);
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleProgressMouseMove);
            document.addEventListener('mouseup', handleProgressMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleProgressMouseMove);
            document.removeEventListener('mouseup', handleProgressMouseUp);
        };
    }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

    const handleLyricsUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('lyrics', file);

        try {
            const uploadRes = await fetch('/api/upload/lyrics', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
                alert(uploadData.error || '上传失败');
                return;
            }

            const updateRes = await fetch(`/api/songs/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lyricsContent: uploadData.content }),
            });

            if (updateRes.ok) {
                setLyrics(uploadData.parsed);
                setShowLyricsUpload(false);
                setShowLyrics(true);
            }
        } catch (err) {
            alert('歌词上传失败，请重试');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleRepeatMode = () => {
        setRepeatMode(mode => mode === 'off' ? 'one' : 'off');
    };

    const handleEnded = () => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX size={18} />;
        if (volume < 0.3) return <Volume size={18} />;
        if (volume < 0.7) return <Volume1 size={18} />;
        return <Volume2 size={18} />;
    };

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    if (loading) {
        return (
            <div className="am-loading">
                <div className="am-spinner"></div>
                <p>加载中...</p>
            </div>
        );
    }

    if (error || !song) {
        return (
            <div className="am-error">
                <Music size={64} strokeWidth={1} />
                <p>{error || '歌曲不存在'}</p>
                <Link href="/dashboard" className="am-btn-back">返回音乐库</Link>
            </div>
        );
    }

    const coverUrl = song.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80';
    const progress = duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0;

    return (
        <div className={`am-player ${showLyrics ? 'am-lyrics-mode' : ''}`}>
            {/* Dynamic Background */}
            <div className="am-bg">
                <div className="am-bg-image" style={{ backgroundImage: `url(${coverUrl})` }} />
                <div className="am-bg-gradient" />
            </div>

            {/* Header */}
            <header className="am-header">
                <button onClick={() => router.push('/dashboard')} className="am-header-btn" title="返回">
                    <ChevronDown size={28} />
                </button>
                <div className="am-header-center">
                    <span className="am-header-label">正在播放</span>
                </div>
                <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className={`am-header-btn am-speed-btn ${playbackRate !== 1 ? 'active' : ''}`}
                    title="播放速度"
                >
                    {playbackRate !== 1 ? `${playbackRate}x` : <Settings size={20} />}
                </button>
            </header>

            {/* Speed Menu */}
            {showSpeedMenu && (
                <div className="am-speed-menu" onClick={() => setShowSpeedMenu(false)}>
                    <div className="am-speed-menu-content" onClick={e => e.stopPropagation()}>
                        <h4>播放速度</h4>
                        <div className="am-speed-options">
                            {speedOptions.map(rate => (
                                <button
                                    key={rate}
                                    className={`am-speed-option ${playbackRate === rate ? 'active' : ''}`}
                                    onClick={() => {
                                        setPlaybackRate(rate);
                                        setShowSpeedMenu(false);
                                    }}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="am-main">
                {!showLyrics ? (
                    /* Artwork View */
                    <div className="am-artwork-view">
                        <div
                            className={`am-artwork ${isPlaying ? 'playing' : ''}`}
                            onClick={togglePlay}
                        >
                            <img src={coverUrl} alt={song.title} draggable={false} />
                            <div className="am-artwork-shine" />
                            <div className="am-artwork-play-overlay">
                                {isPlaying ? <Pause size={64} /> : <Play size={64} />}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Lyrics View */
                    <div className="am-lyrics-view">
                        {lyrics.length > 0 ? (
                            <div ref={lyricsContainerRef} className="am-lyrics-scroll">
                                <div className="am-lyrics-spacer" />
                                {lyrics.map((line, index) => {
                                    const isActive = index === activeIndex;
                                    const distance = Math.abs(index - activeIndex);
                                    let opacityClass = '';
                                    if (distance === 1) opacityClass = 'near';
                                    else if (distance === 2) opacityClass = 'far';
                                    else if (distance > 2) opacityClass = 'distant';

                                    return (
                                        <div
                                            key={index}
                                            ref={el => lyricRefs.current[index] = el}
                                            onClick={() => {
                                                if (audioRef.current) {
                                                    audioRef.current.currentTime = line.time;
                                                    if (!isPlaying) {
                                                        audioRef.current.play();
                                                    }
                                                }
                                            }}
                                            className={`am-lyric-line ${isActive ? 'active' : ''} ${opacityClass}`}
                                        >
                                            {line.text}
                                        </div>
                                    );
                                })}
                                <div className="am-lyrics-spacer" />
                            </div>
                        ) : (
                            <div className="am-lyrics-empty">
                                <Music size={64} strokeWidth={1} />
                                <p>暂无歌词</p>
                                <button onClick={() => setShowLyricsUpload(true)} className="am-btn-upload">
                                    <Upload size={18} />
                                    上传歌词
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Controls Footer */}
            <footer className="am-controls">
                <div className="am-controls-inner">
                    {/* Song Info */}
                    <div className="am-song-info">
                        <h1 className="am-song-title">{song.title}</h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="am-progress-container">
                        <div
                            ref={progressRef}
                            className={`am-progress-bar ${isDragging ? 'dragging' : ''}`}
                            onClick={handleSeek}
                            onMouseDown={handleProgressMouseDown}
                            onTouchStart={handleProgressTouchStart}
                            onTouchMove={handleProgressTouchMove}
                            onTouchEnd={handleProgressTouchEnd}
                        >
                            <div className="am-progress-track">
                                <div className="am-progress-fill" style={{ width: `${progress}%` }} />
                                <div
                                    className="am-progress-thumb"
                                    style={{ left: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="am-progress-times">
                            <span>{formatTime(isDragging ? dragTime : currentTime)}</span>
                            <span>-{formatTime(duration - (isDragging ? dragTime : currentTime))}</span>
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="am-playback">
                        <button onClick={skipBackward} className="am-ctrl-btn" title="后退10秒">
                            <RotateCcw size={24} />
                            <span className="am-skip-label">10</span>
                        </button>
                        <button onClick={togglePlay} className="am-play-btn">
                            {isPlaying
                                ? <Pause size={36} fill="currentColor" strokeWidth={0} />
                                : <Play size={36} fill="currentColor" strokeWidth={0} style={{ marginLeft: '3px' }} />
                            }
                        </button>
                        <button onClick={skipForward} className="am-ctrl-btn" title="快进10秒">
                            <RotateCw size={24} />
                            <span className="am-skip-label">10</span>
                        </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="am-bottom-row">
                        {/* Volume */}
                        <div className="am-volume-group">
                            <button onClick={() => setIsMuted(!isMuted)} className="am-vol-btn" title={isMuted ? '取消静音' : '静音'}>
                                {getVolumeIcon()}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    setIsMuted(false);
                                }}
                                className="am-volume-slider"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="am-action-group">
                            <button
                                onClick={toggleRepeatMode}
                                className={`am-action-btn ${repeatMode === 'one' ? 'active' : ''}`}
                                title={repeatMode === 'one' ? '关闭循环' : '单曲循环'}
                            >
                                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                            </button>
                            <button
                                onClick={() => {
                                    if (lyrics.length === 0) {
                                        setShowLyricsUpload(true);
                                    } else {
                                        setShowLyrics(!showLyrics);
                                    }
                                }}
                                className={`am-action-btn ${showLyrics ? 'active' : ''}`}
                                title={showLyrics ? '隐藏歌词' : '显示歌词'}
                            >
                                <Quote size={20} />
                            </button>
                            <button
                                onClick={() => lyrics.length > 0 && setIsImmersive(true)}
                                className={`am-action-btn ${lyrics.length === 0 ? 'disabled' : ''}`}
                                title="沉浸式歌词"
                            >
                                <Maximize2 size={20} />
                            </button>
                            <button
                                onClick={() => setShowQueue(!showQueue)}
                                className={`am-action-btn ${showQueue ? 'active' : ''}`}
                                title="播放队列"
                            >
                                <ListMusic size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Lyrics Upload Modal */}
            {showLyricsUpload && (
                <div className="am-modal-overlay" onClick={() => !isUploading && setShowLyricsUpload(false)}>
                    <div className="am-modal" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => !isUploading && setShowLyricsUpload(false)}
                            className="am-modal-close"
                            disabled={isUploading}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="am-modal-title">上传歌词</h3>
                        <label className={`am-upload-zone ${isUploading ? 'uploading' : ''}`}>
                            {isUploading ? (
                                <>
                                    <div className="am-spinner small"></div>
                                    <span className="am-upload-text">正在上传...</span>
                                </>
                            ) : (
                                <>
                                    <div className="am-upload-icon">
                                        <FileText size={28} />
                                    </div>
                                    <span className="am-upload-text">点击选择歌词文件</span>
                                    <span className="am-upload-hint">支持 LRC, SRT, VTT, TXT 格式</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".lrc,.srt,.vtt,.txt"
                                onChange={handleLyricsUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Queue Panel */}
            {showQueue && (
                <div className="am-queue-overlay" onClick={() => setShowQueue(false)}>
                    <div className="am-queue-panel" onClick={e => e.stopPropagation()}>
                        <div className="am-queue-header">
                            <h3>播放队列</h3>
                            <span className="am-queue-count">{allSongs.length} 首歌曲</span>
                            <button
                                onClick={() => {
                                    setQueueSortOrder(prev => {
                                        if (prev === 'default') return 'asc';
                                        if (prev === 'asc') return 'desc';
                                        return 'default';
                                    });
                                }}
                                className="am-queue-sort-btn"
                                title={queueSortOrder === 'default' ? '排序' : queueSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                            >
                                {queueSortOrder === 'asc' ? <ArrowUpAZ size={18} /> :
                                    queueSortOrder === 'desc' ? <ArrowDownZA size={18} /> :
                                        <ArrowUpDown size={18} />}
                            </button>
                            <button onClick={() => setShowQueue(false)} className="am-queue-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="am-queue-search">
                            <Search size={16} className="am-queue-search-icon" />
                            <input
                                type="text"
                                placeholder=""
                                value={queueSearchTerm}
                                onChange={(e) => setQueueSearchTerm(e.target.value)}
                                className="am-queue-search-input"
                            />
                        </div>
                        <div className="am-queue-list">
                            {allSongs.length === 0 ? (
                                <div className="am-queue-empty">
                                    <Music size={32} />
                                    <span>暂无歌曲</span>
                                </div>
                            ) : (
                                [...allSongs]
                                    .filter(song => song.title.toLowerCase().includes(queueSearchTerm.toLowerCase()))
                                    .sort((a, b) => {
                                        if (queueSortOrder === 'default') return 0;
                                        const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
                                        const comparison = collator.compare(a.title, b.title);
                                        return queueSortOrder === 'asc' ? comparison : -comparison;
                                    })
                                    .map((queueSong) => {
                                        const isCurrentSong = queueSong.id === song?.id;
                                        const songCover = queueSong.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60';

                                        return (
                                            <div
                                                key={queueSong.id}
                                                className={`am-queue-item ${isCurrentSong ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!isCurrentSong) {
                                                        router.push(`/player/${queueSong.id}`);
                                                        setShowQueue(false);
                                                    }
                                                }}
                                            >
                                                <img src={songCover} alt={queueSong.title} />
                                                <div className="am-queue-info">
                                                    <span className="am-queue-title">{queueSong.title}</span>
                                                    <span className="am-queue-artist">我的音乐</span>
                                                </div>
                                                {isCurrentSong && isPlaying && (
                                                    <div className="am-queue-playing">
                                                        <div className="am-queue-bar"></div>
                                                        <div className="am-queue-bar"></div>
                                                        <div className="am-queue-bar"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Immersive Lyrics Mode */}
            {isImmersive && lyrics.length > 0 && (
                <div className="am-immersive">
                    <div className="am-immersive-bg" style={{ backgroundImage: `url(${coverUrl})` }} />
                    <div className="am-immersive-gradient" />
                    <button onClick={() => setIsImmersive(false)} className="am-immersive-close">
                        <Minimize2 size={24} />
                    </button>
                    <div className="am-immersive-lyrics">
                        <div className="am-immersive-spacer" />
                        {lyrics.map((line, index) => {
                            const isActive = index === activeIndex;
                            const distance = Math.abs(index - activeIndex);
                            let opacityClass = '';
                            if (distance === 1) opacityClass = 'near';
                            else if (distance === 2) opacityClass = 'far';
                            else if (distance > 2) opacityClass = 'distant';

                            return (
                                <div
                                    key={index}
                                    ref={el => immersiveLyricRefs.current[index] = el}
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = line.time;
                                            if (!isPlaying) audioRef.current.play();
                                        }
                                    }}
                                    className={`am-immersive-line ${isActive ? 'active' : ''} ${opacityClass}`}
                                >
                                    {line.text}
                                </div>
                            );
                        })}
                        <div className="am-immersive-spacer" />
                    </div>
                    <div className="am-immersive-controls">
                        <button onClick={togglePlay} className="am-immersive-play">
                            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={song.audio_path}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => {
                    setDuration(audioRef.current?.duration || 0);
                    if (audioRef.current) {
                        audioRef.current.playbackRate = playbackRate;
                    }
                }}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setError('音频加载失败')}
            />

            <style jsx global>{`
                /* Apple Music Player - Polished */
                .am-player {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    background: #000;
                    color: #fff;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                    user-select: none;
                }

                /* Dynamic Background */
                .am-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                .am-bg-image {
                    position: absolute;
                    inset: -100px;
                    background-size: cover;
                    background-position: center;
                    filter: blur(100px) saturate(1.8) brightness(0.5);
                    transform: scale(1.3);
                    animation: amBgFloat 25s ease-in-out infinite alternate;
                }

                @keyframes amBgFloat {
                    0% { transform: scale(1.3) translate(0, 0); }
                    50% { transform: scale(1.35) translate(-2%, 2%); }
                    100% { transform: scale(1.3) translate(2%, -1%); }
                }

                .am-bg-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(0,0,0,0.2) 0%,
                        rgba(0,0,0,0.1) 30%,
                        rgba(0,0,0,0.5) 70%,
                        rgba(0,0,0,0.9) 100%
                    );
                }

                /* Header */
                .am-header {
                    position: relative;
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    min-height: 56px;
                }

                .am-header-btn {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    transition: all 0.2s;
                    border-radius: 50%;
                    font-size: 13px;
                    font-weight: 600;
                }

                .am-header-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .am-header-btn:active {
                    transform: scale(0.9);
                }

                .am-header-btn.active,
                .am-speed-btn.active {
                    color: #FA2D48;
                }

                .am-header-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .am-header-label {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: rgba(255,255,255,0.6);
                }

                /* Speed Menu */
                .am-speed-menu {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }

                .am-speed-menu-content {
                    background: rgba(40,40,40,0.95);
                    border-radius: 16px;
                    padding: 20px;
                    min-width: 200px;
                }

                .am-speed-menu-content h4 {
                    text-align: center;
                    margin-bottom: 16px;
                    font-size: 15px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                }

                .am-speed-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .am-speed-option {
                    padding: 12px;
                    background: rgba(255,255,255,0.08);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .am-speed-option:hover {
                    background: rgba(255,255,255,0.15);
                }

                .am-speed-option.active {
                    background: #FA2D48;
                }

                /* Main Content */
                .am-main {
                    flex: 1;
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    padding: 0 24px;
                }

                /* Artwork View */
                .am-artwork-view {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }

                .am-artwork {
                    position: relative;
                    width: min(85vw, 360px);
                    aspect-ratio: 1;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }

                .am-artwork.playing {
                    transform: scale(1.02);
                    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
                }

                .am-artwork img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .am-artwork-shine {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        135deg,
                        rgba(255,255,255,0.15) 0%,
                        transparent 50%
                    );
                    pointer-events: none;
                }

                .am-artwork-play-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.3);
                    opacity: 0;
                    transition: opacity 0.2s;
                    color: #fff;
                }

                .am-artwork:hover .am-artwork-play-overlay {
                    opacity: 1;
                }

                /* Lyrics View */
                .am-lyrics-view {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .am-lyrics-scroll {
                    width: 100%;
                    max-width: 700px;
                    height: 100%;
                    overflow-y: auto;
                    padding: 0 16px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .am-lyrics-scroll::-webkit-scrollbar {
                    display: none;
                }

                .am-lyrics-spacer {
                    height: 40vh;
                }

                .am-lyric-line {
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
                    font-size: 22px;
                    font-weight: 600;
                    line-height: 1.4;
                    letter-spacing: -0.01em;
                    padding: 8px 0;
                    color: rgba(255,255,255,0.25);
                    cursor: pointer;
                    transition: color 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
                                text-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
                    text-align: center;
                    will-change: color;
                }

                .am-lyric-line:hover {
                    color: rgba(255,255,255,0.45);
                }

                /* Apple-style graduated opacity for karaoke effect */
                .am-lyric-line.near {
                    color: rgba(255,255,255,0.45);
                }

                .am-lyric-line.far {
                    color: rgba(255,255,255,0.20);
                }

                .am-lyric-line.distant {
                    color: rgba(255,255,255,0.10);
                }

                .am-lyric-line.active {
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 40px rgba(255,255,255,0.3),
                                 0 0 80px rgba(255,255,255,0.1);
                }

                .am-lyrics-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: rgba(255,255,255,0.4);
                    text-align: center;
                }

                .am-btn-upload {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 100px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .am-btn-upload:hover {
                    background: rgba(255,255,255,0.15);
                    border-color: rgba(255,255,255,0.3);
                }

                /* Controls Footer */
                .am-controls {
                    position: relative;
                    z-index: 20;
                    padding: 0 20px 32px;
                }

                .am-controls-inner {
                    max-width: 420px;
                    margin: 0 auto;
                }

                /* Song Info */
                .am-song-info {
                    text-align: center;
                    margin-bottom: 20px;
                    margin-top: 12px;
                }

                .am-song-title {
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    margin: 0 0 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .am-song-artist {
                    font-size: 18px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.55);
                    margin: 0;
                }

                /* Progress Bar */
                .am-progress-container {
                    margin-bottom: 16px;
                }

                .am-progress-bar {
                    position: relative;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    touch-action: none;
                }

                .am-progress-track {
                    position: relative;
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.25);
                    border-radius: 2px;
                    overflow: visible;
                    transition: height 0.15s;
                }

                .am-progress-bar:hover .am-progress-track,
                .am-progress-bar.dragging .am-progress-track {
                    height: 6px;
                }

                .am-progress-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: rgba(255,255,255,0.9);
                    border-radius: 2px;
                    transition: width 0.1s linear;
                }

                .am-progress-thumb {
                    position: absolute;
                    top: 50%;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: transform 0.15s;
                    pointer-events: none;
                }

                .am-progress-bar:hover .am-progress-thumb,
                .am-progress-bar.dragging .am-progress-thumb {
                    transform: translate(-50%, -50%) scale(1);
                }

                .am-progress-times {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.5);
                    font-variant-numeric: tabular-nums;
                }

                /* Playback Controls */
                .am-playback {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 40px;
                    margin-bottom: 24px;
                }

                .am-ctrl-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.9);
                    cursor: pointer;
                    transition: all 0.15s;
                    padding: 8px;
                }

                .am-ctrl-btn:hover {
                    transform: scale(1.1);
                }

                .am-ctrl-btn:active {
                    transform: scale(0.95);
                }

                .am-skip-label {
                    position: absolute;
                    font-size: 9px;
                    font-weight: 700;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    margin-top: 1px;
                }

                .am-play-btn {
                    width: 72px;
                    height: 72px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.95);
                    border: none;
                    border-radius: 50%;
                    color: #000;
                    cursor: pointer;
                    transition: all 0.15s;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }

                .am-play-btn:hover {
                    transform: scale(1.05);
                    background: #fff;
                }

                .am-play-btn:active {
                    transform: scale(0.95);
                }

                /* Bottom Row */
                .am-bottom-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .am-volume-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    max-width: 160px;
                }

                .am-vol-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    padding: 4px;
                    flex-shrink: 0;
                }

                .am-vol-btn:hover {
                    color: rgba(255,255,255,0.8);
                }

                .am-volume-slider {
                    flex: 1;
                    height: 4px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255,255,255,0.25);
                    border-radius: 2px;
                    cursor: pointer;
                }

                .am-volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }

                .am-volume-slider::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                }

                .am-action-group {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .am-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    padding: 8px;
                    transition: all 0.15s;
                    border-radius: 8px;
                }

                .am-action-btn:hover {
                    color: rgba(255,255,255,0.9);
                    background: rgba(255,255,255,0.1);
                }

                .am-action-btn.active {
                    color: #FA2D48;
                }

                /* Modal */
                .am-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .am-modal {
                    position: relative;
                    width: 100%;
                    max-width: 340px;
                    background: rgba(35,35,35,0.98);
                    border-radius: 20px;
                    padding: 28px 24px;
                    border: 1px solid rgba(255,255,255,0.08);
                }

                .am-modal-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .am-modal-close:hover {
                    background: rgba(255,255,255,0.15);
                    color: #fff;
                }

                .am-modal-close:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .am-modal-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .am-upload-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 32px 20px;
                    background: rgba(255,255,255,0.04);
                    border: 2px dashed rgba(255,255,255,0.15);
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .am-upload-zone:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.25);
                }

                .am-upload-zone.uploading {
                    pointer-events: none;
                    border-color: #FA2D48;
                }

                .am-upload-zone input {
                    display: none;
                }

                .am-upload-icon {
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.08);
                    border-radius: 50%;
                    color: rgba(255,255,255,0.7);
                }

                .am-upload-text {
                    font-size: 15px;
                    font-weight: 600;
                }

                .am-upload-hint {
                    font-size: 13px;
                    color: rgba(255,255,255,0.4);
                }

                /* Loading & Error */
                .am-loading,
                .am-error {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    background: #000;
                    color: rgba(255,255,255,0.5);
                }

                .am-spinner {
                    width: 32px;
                    height: 32px;
                    border: 2.5px solid rgba(255,255,255,0.1);
                    border-top-color: #FA2D48;
                    border-radius: 50%;
                    animation: amSpin 0.75s linear infinite;
                }

                .am-spinner.small {
                    width: 24px;
                    height: 24px;
                    border-width: 2px;
                }

                @keyframes amSpin {
                    to { transform: rotate(360deg); }
                }

                .am-btn-back {
                    padding: 12px 28px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 100px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none;
                    transition: all 0.15s;
                }

                .am-btn-back:hover {
                    background: rgba(255,255,255,0.15);
                }

                /* Responsive - Tablet */
                @media (min-width: 640px) {
                    .am-artwork {
                        width: min(65vw, 400px);
                        border-radius: 20px;
                    }

                    .am-lyric-line {
                        font-size: 28px;
                        padding: 10px 0;
                    }

                    .am-controls-inner {
                        max-width: 480px;
                    }
                }

                /* Responsive - Desktop */
                @media (min-width: 1024px) {
                    .am-player.am-lyrics-mode .am-main {
                        flex-direction: row;
                        gap: 48px;
                    }

                    .am-player.am-lyrics-mode .am-artwork-view {
                        width: 35%;
                        display: flex !important;
                    }

                    .am-player.am-lyrics-mode .am-lyrics-view {
                        width: 55%;
                    }

                    .am-artwork {
                        width: min(40vw, 440px);
                        border-radius: 24px;
                    }

                    .am-lyric-line {
                        font-size: 32px;
                        padding: 10px 0;
                    }

                    .am-controls-inner {
                        max-width: 540px;
                    }

                    .am-play-btn {
                        width: 80px;
                        height: 80px;
                    }

                    .am-immersive-line {
                        font-size: clamp(36px, 5vw, 56px);
                    }

                    .am-immersive-line.active {
                        font-size: clamp(44px, 6vw, 68px);
                    }
                }

                /* Queue Panel */
                .am-queue-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 200;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }

                .am-queue-panel {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    max-width: 500px;
                    height: 70vh;
                    background: rgba(28,28,30,0.98);
                    border-radius: 20px 20px 0 0;
                    overflow: hidden;
                }

                .am-queue-header {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 18px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .am-queue-header h3 {
                    font-size: 17px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .am-queue-count {
                    font-size: 13px;
                    color: rgba(255,255,255,0.4);
                    flex: 1;
                }

                .am-queue-close,
                .am-queue-sort-btn {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    padding: 4px;
                    transition: color 0.2s;
                }

                .am-queue-close:hover,
                .am-queue-sort-btn:hover {
                    color: rgba(255,255,255,0.9);
                }

                .am-queue-search {
                    flex-shrink: 0;
                    position: relative;
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .am-queue-search-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.4);
                    pointer-events: none;
                }

                .am-queue-search-input {
                    width: 100%;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 8px 12px 8px 36px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                }

                .am-queue-search-input::placeholder {
                    color: rgba(255,255,255,0.3);
                }

                .am-queue-search-input:focus {
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(255,255,255,0.2);
                }

                .am-queue-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    padding: 12px;
                    overflow-y: auto;
                    min-height: 0;
                }

                .am-queue-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 40px;
                    color: rgba(255,255,255,0.4);
                }

                .am-queue-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 12px;
                    transition: background 0.15s;
                    cursor: pointer;
                }

                .am-queue-item:not(.active):hover {
                    background: rgba(255,255,255,0.05);
                }

                .am-queue-item.active {
                    background: rgba(255,255,255,0.08);
                    cursor: default;
                }

                .am-queue-item img {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .am-queue-info {
                    flex: 1;
                    min-width: 0;
                }

                .am-queue-title {
                    display: block;
                    font-size: 15px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .am-queue-item.active .am-queue-title {
                    color: #FA2D48;
                }

                .am-queue-artist {
                    display: block;
                    font-size: 13px;
                    color: rgba(255,255,255,0.5);
                }

                .am-queue-playing {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 16px;
                }

                .am-queue-bar {
                    width: 3px;
                    background: #FA2D48;
                    border-radius: 2px;
                    animation: queueBars 0.6s ease-in-out infinite alternate;
                }

                .am-queue-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
                .am-queue-bar:nth-child(2) { height: 100%; animation-delay: 0.2s; }
                .am-queue-bar:nth-child(3) { height: 40%; animation-delay: 0.4s; }

                @keyframes queueBars {
                    to { height: 20%; }
                }

                /* Immersive Lyrics Mode */
                .am-immersive {
                    position: fixed;
                    inset: 0;
                    z-index: 300;
                    display: flex;
                    flex-direction: column;
                    background: #000;
                }

                .am-immersive-bg {
                    position: absolute;
                    inset: -100px;
                    background-size: cover;
                    background-position: center;
                    filter: blur(120px) saturate(2) brightness(0.4);
                    transform: scale(1.4);
                    animation: immersiveBg 30s ease-in-out infinite alternate;
                }

                @keyframes immersiveBg {
                    0% { transform: scale(1.4) translate(0, 0); }
                    50% { transform: scale(1.5) translate(-3%, 3%); }
                    100% { transform: scale(1.4) translate(3%, -2%); }
                }

                .am-immersive-gradient {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%);
                }

                .am-immersive-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 10;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.01);
                    backdrop-filter: blur(20px);
                    border: none;
                    border-radius: 50%;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .am-immersive-close:hover {
                    background: rgba(255,255,255,0.15);
                    color: rgba(255,255,255,1);
                    transform: scale(1.05);
                }

                .am-immersive-lyrics {
                    flex: 1;
                    position: relative;
                    z-index: 5;
                    overflow-y: auto;
                    padding: 0 clamp(20px, 8vw, 120px);
                    scrollbar-width: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .am-immersive-lyrics::-webkit-scrollbar {
                    display: none;
                }

                .am-immersive-spacer {
                    height: 45vh;
                    flex-shrink: 0;
                }

                .am-immersive-line {
                    width: 100%;
                    max-width: 1000px;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
                    font-size: clamp(22px, 4vw, 40px);
                    font-weight: 600;
                    line-height: 1.35;
                    letter-spacing: -0.015em;
                    padding: clamp(6px, 1vh, 12px) 0;
                    color: rgba(255,255,255,0.18);
                    cursor: pointer;
                    transition: color 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
                                text-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
                    text-align: center;
                    will-change: color;
                }

                .am-immersive-line:hover {
                    color: rgba(255,255,255,0.40);
                }

                /* Apple-style graduated karaoke opacity */
                .am-immersive-line.near {
                    color: rgba(255,255,255,0.40);
                }

                .am-immersive-line.far {
                    color: rgba(255,255,255,0.15);
                }

                .am-immersive-line.distant {
                    color: rgba(255,255,255,0.07);
                }

                .am-immersive-line.active {
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 50px rgba(255,255,255,0.35),
                                 0 0 100px rgba(255,255,255,0.15);
                }

                .am-immersive-controls {
                    position: absolute;
                    bottom: 40px;
                    right: 40px;
                    z-index: 10;
                }

                .am-immersive-play {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.01);
                    backdrop-filter: blur(20px);
                    border: none;
                    border-radius: 50%;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .am-immersive-play:hover {
                    background: rgba(255,255,255,0.15);
                    color: rgba(255,255,255,1);
                    transform: scale(1.05);
                }

                .am-action-btn.disabled {
                    opacity: 0.3;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
