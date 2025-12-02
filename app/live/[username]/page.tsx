'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import LivePlayer from '@/components/LivePlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, MessageSquare, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface LivePageProps {
    params: Promise<{ username: string }>;
}

export default function LivePage({ params }: LivePageProps) {
    const resolvedParams = use(params);
    const username = resolvedParams.username;
    
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [streamKey, setStreamKey] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // We need an endpoint to get user by username and their live status/stream key
                // For security, we shouldn't expose the stream key directly unless it's the public playback ID.
                // However, with Node Media Server, the HLS URL is usually /live/{streamKey}/index.m3u8
                // So we effectively need the stream key or a mapped alias.
                // For this MVP, we'll assume we can get the stream key if they are live, 
                // OR we might need to adjust the backend to return a playback URL.
                
                // Let's assume we add a public endpoint for this.
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/channels/username/${username}`);
                setUser(response.data);
                setIsLive(response.data.isLive);
                
                // If live, we need the stream key to construct the URL.
                // Ideally, the backend should return a 'playbackUrl' or similar.
                // For now, let's assume the backend returns 'streamKey' ONLY IF the request is authorized OR we change the design.
                // BETTER APPROACH: The HLS URL should be predictable or returned by the API.
                // Let's assume the API returns `streamKey` for now (not ideal for security if it's the same as the publish key, but common in simple setups).
                // If the publish key is secret, we should use an alias. But NMS uses the publish key by default.
                
                if (response.data.isLive && response.data.streamKey) {
                    setStreamKey(response.data.streamKey);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('User not found');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen">User not found</div>;
    }

    const hlsUrl = streamKey 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/live/${streamKey}/index.m3u8`
        : '';

    return (
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Player */}
                    <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
                        {isLive && streamKey ? (
                            <LivePlayer src={hlsUrl} poster={user.avatar} />
                        ) : (
                            <div className="aspect-video flex flex-col items-center justify-center bg-muted text-muted-foreground">
                                <User className="h-16 w-16 mb-4 opacity-50" />
                                <h2 className="text-2xl font-bold">Offline</h2>
                                <p>This user is not currently live.</p>
                            </div>
                        )}
                    </div>

                    {/* Stream Info */}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <Avatar className="h-12 w-12 border-2 border-background">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{user.username}'s Stream</h1>
                                <p className="text-muted-foreground">Streaming {user.category || 'Just Chatting'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Heart className="mr-2 h-4 w-4" />
                                Follow
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chat (Placeholder) */}
                <div className="lg:col-span-1 h-[600px] flex flex-col">
                    <Card className="flex-1 flex flex-col h-full">
                        <div className="p-4 border-b font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Live Chat
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground bg-muted/50">
                            Chat coming soon...
                        </div>
                        <div className="p-4 border-t">
                            <Button className="w-full" disabled>Send a message</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
