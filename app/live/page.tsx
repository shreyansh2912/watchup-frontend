'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
    'All', 'Gaming', 'Music', 'Just Chatting', 'Education', 'Sports', 'Art', 'Technology', 'Cooking', 'Other'
];

interface LiveStream {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    viewerCount: number;
    startedAt: string;
    user: {
        id: number;
        username: string;
        avatar: string | null;
    };
}

export default function LiveStreamsPage() {
    const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLiveStreams();
        const interval = setInterval(fetchLiveStreams, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [selectedCategory]);

    const fetchLiveStreams = async () => {
        try {
            const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
            const res = await api.get('/stream/live', { params });
            setLiveStreams(res.data.data || []);
        } catch (error) {
            console.error('Error fetching live streams:', error);
            if (isLoading) {
                toast.error('Failed to load live streams');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading live streams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Live Now</h1>
                    <p className="text-muted-foreground">
                        {liveStreams.length} {liveStreams.length === 1 ? 'stream' : 'streams'} currently live
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === cat
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Live Streams Grid */}
            {liveStreams.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-muted-foreground space-y-2">
                        <p className="text-lg font-semibold">No live streams right now</p>
                        <p className="text-sm">Check back later or start your own stream!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {liveStreams.map((stream) => (
                        <Link
                            key={stream.id}
                            href={`/live/${stream.user.username}`}
                            className="group"
                        >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                                    {stream.thumbnailUrl ? (
                                        <img
                                            src={stream.thumbnailUrl}
                                            alt={stream.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-white text-6xl font-bold opacity-20">
                                            LIVE
                                        </div>
                                    )}
                                    
                                    {/* Live Badge */}
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                                        <span className="w-2 h-2 bg-white rounded-full"></span>
                                        LIVE
                                    </div>

                                    {/* Viewer Count */}
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {stream.viewerCount}
                                    </div>

                                    {/* Category Badge */}
                                    {stream.category && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-2 right-2"
                                        >
                                            {stream.category}
                                        </Badge>
                                    )}
                                </div>

                                <CardContent className="p-3 space-y-2">
                                    {/* Creator Info */}
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8 border-2 border-background">
                                            <AvatarImage src={stream.user.avatar || undefined} />
                                            <AvatarFallback>
                                                {stream.user.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{stream.user.username}</span>
                                    </div>

                                    {/* Stream Title */}
                                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                        {stream.title}
                                    </h3>

                                    {/* Live Duration */}
                                    {stream.startedAt && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            Started {formatDistanceToNow(new Date(stream.startedAt), { addSuffix: true })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
