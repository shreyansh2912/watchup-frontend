"use client";

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, Volume2, VolumeX, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Video {
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
    slug?: string;
    channel: {
        id: number;
        name: string;
        avatarUrl: string | null;
        handle: string;
    };
    views: number;
}

interface ShortsPlayerProps {
    video: Video;
    isActive: boolean;
}

export default function ShortsPlayer({ video, isActive }: ShortsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useAuth();

    // Interaction State
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => {
                setIsPlaying(false);
            });
            setIsPlaying(true);
            fetchInteractionStatus();
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    const fetchInteractionStatus = async () => {
        try {
            // Fetch Like Status
            const likeRes = await api.get(`/likes/${video.id}/status`);
            if (likeRes.data.success) {
                setLikeCount(likeRes.data.data.likes);
                setIsLiked(likeRes.data.data.userStatus === 'LIKE');
                setIsDisliked(likeRes.data.data.userStatus === 'DISLIKE');
            }

            // Fetch Subscription Status
            if (user && video.channel.id) {
                const subRes = await api.get(`/subscriptions/${video.channel.id}/status`);
                if (subRes.data.success) {
                    setIsSubscribed(subRes.data.data.isSubscribed);
                }
            }
        } catch (error) {
            console.error("Failed to fetch interaction status", error);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return; 
        
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        if (newIsLiked) {
            setLikeCount(prev => prev + 1);
            if (isDisliked) setIsDisliked(false);
        } else {
            setLikeCount(prev => prev - 1);
        }

        try {
            await api.post(`/likes/${video.id}`, { type: 'LIKE' });
        } catch (error) {
            console.error("Like failed", error);
            // Revert on error
            setIsLiked(!newIsLiked);
            if (newIsLiked) setLikeCount(prev => prev - 1);
            else setLikeCount(prev => prev + 1);
        }
    };

    const handleDislike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;

        const newIsDisliked = !isDisliked;
        setIsDisliked(newIsDisliked);
        if (newIsDisliked && isLiked) {
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
        }

        try {
            await api.post(`/likes/${video.id}`, { type: 'DISLIKE' });
        } catch (error) {
            console.error("Dislike failed", error);
            setIsDisliked(!newIsDisliked);
        }
    };

    const handleSubscribe = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;

        const newIsSubscribed = !isSubscribed;
        setIsSubscribed(newIsSubscribed);

        try {
            await api.post('/subscriptions', { channelId: video.channel.id });
        } catch (error) {
            console.error("Subscribe failed", error);
            setIsSubscribed(!newIsSubscribed);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/watch/${video.slug || video.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="relative w-full h-full snap-start flex justify-center bg-black">
            <div className="relative w-full max-w-[450px] h-full bg-black aspect-[9/16]">
                {/* Video */}
                <video
                    ref={videoRef}
                    src={video.url}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                />

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/40 z-20">
                    <div 
                        className="h-full bg-red-600 transition-all duration-100" 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
                        <Play className="w-16 h-16 text-white/80 fill-white/80" />
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                    {/* Top Controls */}
                    <div className="flex justify-between items-start pointer-events-auto mt-14">
                        <div /> 
                        <Button variant="ghost" size="icon" className="text-white hover:bg-black/20" onClick={toggleMute}>
                            {isMuted ? <VolumeX /> : <Volume2 />}
                        </Button>
                    </div>

                    {/* Bottom Area */}
                    <div className="flex items-end justify-between mb-4">
                        {/* Left: Info */}
                        <div className="flex-1 mr-4 pointer-events-auto text-white space-y-4 pb-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Link href={`/channel/${video.channel.id}`} className="flex items-center gap-2 group">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                            {video.channel.avatarUrl ? (
                                                <img src={video.channel.avatarUrl} alt={video.channel.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                                                    {video.channel.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-semibold text-base group-hover:underline shadow-black drop-shadow-md">@{video.channel.handle}</span>
                                    </Link>
                                    <Button 
                                        variant={isSubscribed ? "secondary" : "default"} 
                                        size="sm" 
                                        className={cn(
                                            "h-8 px-4 text-xs font-semibold rounded-full transition-colors",
                                            isSubscribed 
                                                ? "bg-white/20 text-white hover:bg-white/30" 
                                                : "bg-white text-black hover:bg-gray-200"
                                        )}
                                        onClick={handleSubscribe}
                                    >
                                        {isSubscribed ? "Subscribed" : "Subscribe"}
                                    </Button>
                                </div>
                                <p className="text-sm line-clamp-2 drop-shadow-md">{video.title}</p>
                            </div>
                        </div>

                        {/* Right: Actions Column */}
                        <div className="flex flex-col gap-6 pointer-events-auto items-center pb-2">
                            <div className="flex flex-col items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={cn(
                                        "rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 transition-colors",
                                        isLiked ? "text-red-500" : "text-white"
                                    )} 
                                    onClick={handleLike}
                                >
                                    <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
                                </Button>
                                <span className="text-xs font-medium text-white drop-shadow-md">{likeCount}</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={cn(
                                        "rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 transition-colors",
                                        isDisliked ? "text-white fill-white" : "text-white"
                                    )} 
                                    onClick={handleDislike}
                                >
                                    <ThumbsDown className={cn("w-7 h-7", isDisliked && "fill-white text-black")} />
                                </Button>
                                <span className="text-xs font-medium text-white drop-shadow-md">Dislike</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1">
                                <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 text-white">
                                    <MessageCircle className="w-7 h-7" />
                                </Button>
                                <span className="text-xs font-medium text-white drop-shadow-md">0</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 text-white" onClick={handleShare}>
                                    <Share2 className="w-7 h-7" />
                                </Button>
                                <span className="text-xs font-medium text-white drop-shadow-md">Share</span>
                            </div>

                             <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 text-white">
                                <MoreVertical className="w-7 h-7" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
