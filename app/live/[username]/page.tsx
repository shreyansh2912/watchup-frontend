'use client';

import { useState, useEffect, use, useRef } from 'react';
import api from '@/lib/api';
import LivePlayer from '@/components/LivePlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, Heart, Share2, Users, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import SubscribeButton from '@/components/SubscribeButton';

interface LivePageProps {
    params: Promise<{ username: string }>;
}

export default function LivePage({ params }: LivePageProps) {
    const resolvedParams = use(params);
    const username = resolvedParams.username;
    const { user: currentUser } = useAuth();
    
    const [streamData, setStreamData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewerCount, setViewerCount] = useState(0);
    const streamIdRef = useRef<number | null>(null);
    const hasJoinedRef = useRef(false);

    useEffect(() => {
        fetchStreamData();
        
        return () => {
            // Leave stream when component unmounts
            if (streamIdRef.current && hasJoinedRef.current) {
                leaveStream(streamIdRef.current);
            }
        };
    }, [username]);

    useEffect(() => {
        if (streamData?.stream && streamData.stream.status === 'live') {
            // Join stream for viewer count
            if (!hasJoinedRef.current) {
                joinStream(streamData.stream.id);
                hasJoinedRef.current = true;
            }

            // Poll for viewer updates
            const interval = setInterval(() => {
                fetchStreamData(true); // Silent refresh
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [streamData?.stream?.id]);

    const fetchStreamData = async (silent = false) => {
        try {
            // Get channel info by username
            // We need an endpoint to get user/channel by username
            const res = await api.get(`/channels/username/${username}`);
            const channelData = res.data.data || res.data;
            
            // Find active stream for this user
            let streamInfo = null;
            if (channelData.user?.isLive) {
                // Fetch live streams and find this user's stream
                const streamsRes = await api.get('/stream/live');
                const liveStreams = streamsRes.data.data || [];
                streamInfo = liveStreams.find((s: any) => s.user.username === username);
            }

            setStreamData({
                channel: channelData,
                user: channelData.user || channelData,
                isLive: channelData.user?.isLive || channelData.isLive,
                stream: streamInfo,
            });
            
            if (streamInfo) {
                setViewerCount(streamInfo.viewerCount || 0);
                streamIdRef.current = streamInfo.id;
            }
        } catch (error) {
            console.error('Error fetching stream data:', error);
            if (!silent) {
                toast.error('Failed to load stream');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const joinStream = async (streamId: number) => {
        try {
            await api.post(`/stream/${streamId}/join`);
        } catch (error) {
            console.error('Error joining stream:', error);
        }
    };

    const leaveStream = async (streamId: number) => {
        try {
            await api.post(`/stream/${streamId}/leave`);
        } catch (error) {
            console.error('Error leaving stream:', error);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Stream link copied to clipboard');
    };

    if (isLoading) {
        return <div className=\"flex items-center justify-center h-screen\">Loading...</div>;
    }

    if (!streamData || !streamData.user) {
        return <div className=\"flex items-center justify-center h-screen\">User not found</div>;
    }

    const { user, channel, isLive, stream } = streamData;
    const streamKey = user.streamKey;
    const hlsUrl = streamKey && isLive
        ? `${process.env.NEXT_PUBLIC_HLS_URL || 'http://localhost:8000'}/live/${streamKey}/index.m3u8`
        : '';

    return (
        <div className=\"container mx-auto p-4 lg:p-6 space-y-6\">
            <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
                {/* Main Content */}
                <div className=\"lg:col-span-2 space-y-6\">
                    {/* Player */}
                    <div className=\"w-full bg-black rounded-xl overflow-hidden shadow-2xl\">
                        {isLive && streamKey ? (
                            <LivePlayer src={hlsUrl} poster={user.avatar} />
                        ) : (
                            <div className=\"aspect-video flex flex-col items-center justify-center bg-muted text-muted-foreground\">
                                <User className=\"h-16 w-16 mb-4 opacity-50\" />
                                <h2 className=\"text-2xl font-bold\">Offline</h2>
                                <p>This user is not currently live.</p>
                            </div>
                        )}
                    </div>

                    {/* Stream Info */}
                    <div className=\"space-y-4\">
                        <div className=\"flex justify-between items-start gap-4\">
                            <div className=\"flex gap-4 flex-1 min-w-0\">
                                <Avatar className=\"h-12 w-12 border-2 border-background flex-shrink-0\">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className=\"flex-1 min-w-0\">
                                    <h1 className=\"text-2xl font-bold truncate\">
                                        {stream?.title || `${user.username}'s Stream`}
                                    </h1>
                                    <div className=\"flex items-center gap-2 flex-wrap\">
                                        <p className=\"text-muted-foreground\">{user.username}</p>
                                        {stream?.category && (
                                            <Badge variant=\"secondary\">{stream.category}</Badge>
                                        )}
                                        {isLive && (
                                            <Badge className=\"bg-red-500 text-white animate-pulse\">
                                                🔴 LIVE
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className=\"flex gap-2 flex-shrink-0\">
                                {channel && currentUser && channel.id !== currentUser.id && (
                                    <SubscribeButton channelId={channel.id} />
                                )}
                                <Button variant=\"outline\" size=\"sm\" onClick={handleShare}>
                                    <Share2 className=\"mr-2 h-4 w-4\" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        {isLive && (
                            <Card className=\"p-4\">
                                <div className=\"flex gap-6 text-sm\">
                                    <div className=\"flex items-center gap-2\">
                                        <Users className=\"h-4 w-4 text-muted-foreground\" />
                                        <span className=\"font-semibold\">{viewerCount}</span>
                                        <span className=\"text-muted-foreground\">watching now</span>
                                    </div>
                                    {stream?.startedAt && (
                                        <div className=\"flex items-center gap-2\">
                                            <Clock className=\"h-4 w-4 text-muted-foreground\" />
                                            <span className=\"text-muted-foreground\">
                                                Started {formatDistanceToNow(new Date(stream.startedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    )}
                                    {stream?.totalViews > 0 && (
                                        <div className=\"flex items-center gap-2\">
                                            <Eye className=\"h-4 w-4 text-muted-foreground\" />
                                            <span className=\"text-muted-foreground\">
                                                {stream.totalViews} total views
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Description */}
                        {stream?.description && (
                            <Card className=\"p-4\">
                                <h3 className=\"font-semibold mb-2\">About this stream</h3>
                                <p className=\"text-sm text-muted-foreground whitespace-pre-wrap\">
                                    {stream.description}
                                </p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Chat Sidebar */}
                <div className=\"lg:col-span-1 h-[600px] flex flex-col\">
                    <Card className=\"flex-1 flex flex-col h-full\">
                        <div className=\"p-4 border-b font-semibold flex items-center gap-2\">
                            <MessageSquare className=\"h-4 w-4\" />
                            Live Chat
                        </div>
                        <div className=\"flex-1 p-4 flex items-center justify-center text-muted-foreground bg-muted/50\">
                            {stream?.chatEnabled !== false ? (
                                <p className=\"text-sm\">Chat coming soon...</p>
                            ) : (
                                <p className=\"text-sm\">Chat is disabled for this stream</p>
                            )}
                        </div>
                        {stream?.chatEnabled !== false && (
                            <div className=\"p-4 border-t\">
                                <Button className=\"w-full\" disabled>
                                    Send a message
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
