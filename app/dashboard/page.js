'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import SongCardSkeleton from '@/components/SongCardSkeleton';
import {
    Music, Plus, LogOut, Play, Trash2, FileText, Upload,
    Loader2, X, CheckCircle2, MoreVertical, Search, ArrowUpDown, ArrowUpAZ, ArrowDownZA
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [songs, setSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'asc' | 'desc'
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Upload form state
    const [audioFile, setAudioFile] = useState(null);
    const [audioPath, setAudioPath] = useState('');
    const [lyricsFile, setLyricsFile] = useState(null);
    const [lyricsContent, setLyricsContent] = useState('');
    const [songTitle, setSongTitle] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchSongs();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

    const fetchSongs = async () => {
        try {
            const res = await fetch('/api/songs');
            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch songs');
            }
            const data = await res.json();
            setSongs(data.songs || []);
        } catch (err) {
            console.error('Error fetching songs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleAudioUpload = async (e) => {
        e.preventDefault();
        if (dragActive) setDragActive(false);

        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        if (!file) return;

        setAudioFile(file);
        setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
        setUploadError('');

        const formData = new FormData();
        formData.append('audio', file);

        try {
            const res = await fetch('/api/upload/audio', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error);
                setAudioFile(null);
                return;
            }

            setAudioPath(data.path);
        } catch (err) {
            setUploadError('音频上传失败');
            setAudioFile(null);
        }
    };

    const handleLyricsUpload = async (e) => {
        e.preventDefault();

        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        if (!file) return;

        setLyricsFile(file);
        setUploadError('');

        const formData = new FormData();
        formData.append('lyrics', file);

        try {
            const res = await fetch('/api/upload/lyrics', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error);
                setLyricsFile(null);
                return;
            }

            setLyricsContent(data.content);
        } catch (err) {
            setUploadError('歌词解析失败');
            setLyricsFile(null);
        }
    };

    const handleCreateSong = async () => {
        if (!audioPath || !songTitle) {
            setUploadError('请先上传音频文件');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const res = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: songTitle,
                    audioPath,
                    lyricsContent: lyricsContent || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error);
                return;
            }

            // Reset form and refresh
            setShowUploadModal(false);
            resetUploadForm();
            resetUploadForm();
            fetchSongs();
            setToast({ message: '歌曲添加成功！', type: 'success' });
        } catch (err) {
            setUploadError('创建失败，请稍后重试');
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setAudioFile(null);
        setAudioPath('');
        setLyricsFile(null);
        setLyricsContent('');
        setSongTitle('');
        setUploadError('');
    };

    const handleDeleteSong = async (id) => {
        if (!confirm('确定要删除这首歌吗？')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSongs(songs.filter(s => s.id !== id));
                setToast({ message: '歌曲已删除', type: 'success' });
            }
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="page">
                <header className="header">
                    <div className="flex items-center gap-sm">
                        <Music size={20} className="text-muted" />
                        <span className="header-brand">LYRIC SYNC</span>
                    </div>
                    <div className="flex-1" />
                </header>
                <main className="flex-1 container p-lg">
                    <h2 className="mb-lg">我的音乐库</h2>
                    <div className="song-grid">
                        {[...Array(10)].map((_, i) => (
                            <SongCardSkeleton key={i} />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    const filteredSongs = songs
        .filter(song => song.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'default') return 0;
            const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
            const comparison = collator.compare(a.title, b.title);
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleToggleSort = () => {
        setSortOrder(prev => {
            if (prev === 'default') return 'asc';
            if (prev === 'asc') return 'desc';
            return 'default';
        });
    };

    const getSortIcon = () => {
        if (sortOrder === 'asc') return <ArrowUpAZ size={18} />;
        if (sortOrder === 'desc') return <ArrowDownZA size={18} />;
        return <ArrowUpDown size={18} />;
    };

    return (
        <div className="page">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* Header */}
            <header className="header">
                <div className="flex items-center gap-sm">
                    <Music size={20} className="text-muted" />
                    <span className="header-brand">LYRIC SYNC</span>
                </div>
                <div className="flex items-center gap-xs">
                    <button
                        onClick={handleToggleSort}
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        data-tooltip={sortOrder === 'default' ? '排序' : sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    >
                        {getSortIcon()}
                    </button>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        data-tooltip="搜索"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        data-tooltip="添加歌曲"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        data-tooltip="退出登录"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Search Dropdown */}
            {showSearch && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSearch(false)}
                    />
                    <div className="absolute top-full right-lg mt-2 w-72 z-50 animate-fadeIn">
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(255,255,255,0.4)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}
                            />
                            <input
                                type="text"
                                placeholder=""
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 12px 8px 36px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.12)';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.08)';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 container p-lg">
                <h2 className="mb-lg">我的音乐库</h2>

                {filteredSongs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-md">
                            {searchTerm ? <Search size={32} className="text-muted" /> : <Music size={32} className="text-muted" />}
                        </div>
                        <h3 className="text-lg font-medium text-secondary mb-sm">
                            {searchTerm ? '没有找到相关歌曲' : '暂无歌曲'}
                        </h3>
                        <p className="text-muted max-w-md mx-auto mb-lg">
                            {searchTerm ? `未找到包含 "${searchTerm}" 的歌曲` : '上传您的第一首歌曲，开始体验沉浸式歌词同步播放的功能。'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary"
                            >
                                <Plus size={18} />
                                开始上传
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="song-grid">
                        {filteredSongs.map(song => (
                            <Link
                                key={song.id}
                                href={`/player/${song.id}`}
                                className="song-card group"
                            >
                                <img
                                    src={song.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60'}
                                    alt={song.title}
                                    className="song-card-image"
                                />

                                {/* Title at top */}
                                <div className="song-card-header">
                                    <div className="song-card-title">{song.title}</div>
                                </div>

                                {/* Bottom bar with meta and menu */}
                                <div className="song-card-bottom">
                                    <div className="song-card-meta">
                                        <span>{formatDate(song.created_at)}</span>
                                        {song.lyrics_content && (
                                            <span className="song-card-badge">
                                                <FileText size={10} />
                                                歌词
                                            </span>
                                        )}
                                    </div>

                                    {/* Menu Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === song.id ? null : song.id);
                                        }}
                                        className="song-card-menu-btn"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                {/* Dropdown Menu */}
                                {openMenuId === song.id && (
                                    <div
                                        className="song-card-dropdown"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setOpenMenuId(null);
                                                handleDeleteSong(song.id);
                                            }}
                                            disabled={deletingId === song.id}
                                            className="song-card-dropdown-item delete"
                                        >
                                            {deletingId === song.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                            删除歌曲
                                        </button>
                                    </div>
                                )}

                                {/* Hover Play Overlay */}
                                <div className="song-card-play-overlay">
                                    <div className="song-card-play-btn">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => { setShowUploadModal(false); resetUploadForm(); }}>
                    <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                            className="absolute top-6 right-6 btn btn-ghost btn-icon btn-icon-sm"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-black mb-lg">添加新歌曲</h3>

                        <div className="flex flex-col gap-md">
                            {uploadError && (
                                <div className="alert alert-error animate-shake">{uploadError}</div>
                            )}

                            {/* Song Title */}
                            <div className="form-group">
                                <label className="form-label">歌曲名称</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="输入歌曲名称"
                                    value={songTitle}
                                    onChange={(e) => setSongTitle(e.target.value)}
                                />
                            </div>

                            {/* Audio Upload */}
                            <label
                                className={`upload-zone ${audioPath ? 'success' : ''} ${dragActive ? 'border-primary bg-primary/10' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleAudioUpload}
                            >
                                <div className="flex items-center gap-sm">
                                    <div className={`upload-icon p-sm rounded-lg ${audioPath ? '' : 'bg-white/5'}`}>
                                        {audioPath ? <CheckCircle2 size={20} /> : <Music size={20} />}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold text-sm truncate">
                                            {audioFile ? audioFile.name : '选择音频文件'}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {audioFile ? '点击更换' : '点击或拖拽文件到这里'}
                                        </span>
                                    </div>
                                </div>
                                <Upload size={18} className="text-muted" />
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleAudioUpload}
                                />
                            </label>

                            {/* Lyrics Upload */}
                            <label className={`upload-zone ${lyricsContent ? 'success' : ''}`}>
                                <div className="flex items-center gap-sm">
                                    <div className={`upload-icon p-sm rounded-lg ${lyricsContent ? '' : 'bg-white/5'}`}>
                                        {lyricsContent ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                                    </div>
                                    <span className="font-semibold text-sm truncate">
                                        {lyricsFile ? lyricsFile.name : '选择歌词文件（可选）'}
                                    </span>
                                </div>
                                <Upload size={18} className="text-muted" />
                                <input
                                    type="file"
                                    accept=".lrc,.srt,.vtt,.txt,*"
                                    className="hidden"
                                    onChange={handleLyricsUpload}
                                />
                            </label>

                            <button
                                onClick={handleCreateSong}
                                className="btn btn-primary btn-lg w-full mt-sm"
                                disabled={uploading || !audioPath}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        保存中...
                                    </>
                                ) : (
                                    '保存歌曲'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
