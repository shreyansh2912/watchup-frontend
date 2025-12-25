'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, RefreshCw, Copy, Check, Radio, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STREAM_CATEGORIES, POLLING_INTERVALS, STREAM_SETTINGS } from '@/lib/constants';
import { getRtmpUrl, getPlaybackUrl, handleClipboardCopy, extractApiData } from '@/lib/stream-utils';
import type { Stream } from '@/types';

export default function GoLivePage() {
    const { user } = useAuth();
    const router = useRouter();
    
    // Stream credentials
    const [streamKey, setStreamKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Stream metadata
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Just Chatting');
    const [chatEnabled, setChatEnabled] = useState(true);
    const [recordStream, setRecordStream] = useState(true);
    
    // Stream status
    const [isLive, setIsLive] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [currentStream, setCurrentStream] = useState<any>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchStreamData();
            const interval = setInterval(checkLiveStatus, POLLING_INTERVALS.STREAM_STATUS);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchStreamData = async () => {
        try {
            // Fetch stream key
            const keyRes = await api.get('/stream/key');
            setStreamKey(keyRes.data.streamKey);

            // Fetch current stream setup
            const streamRes = await api.get('/stream/current');
            const stream = extractApiData<Stream>(streamRes);
            
            if (stream) {
                setCurrentStream(stream);
                setTitle(stream.title || '');
                setDescription(stream.description || '');
                setCategory(stream.category || 'Just Chatting');
                setChatEnabled(stream.chatEnabled !== false);
                setRecordStream(stream.recordStream !== false);
                setIsLive(stream.status === 'live');
                setViewerCount(stream.viewerCount || 0);
            }
        } catch (error: any) {
            console.error('Error fetching stream data:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to load stream data');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const checkLiveStatus = async () => {
        try {
            const res = await api.get('/stream/current');
            const stream = extractApiData<Stream>(res);
            
            if (stream) {
                setIsLive(stream.status === 'live');
                setViewerCount(stream.viewerCount || 0);
                setCurrentStream(stream);
            }
        } catch (error) {
            // Silent fail for status check
        }
    };

    const setupStream = async () => {
        if (!title.trim()) {
            toast.error('Please enter a stream title');
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.post('/stream/setup', {
                title,
                description,
                category,
                chatEnabled,
                recordStream,
            });
            setCurrentStream(extractApiData<Stream>(res));
            toast.success('Stream setup saved! Start streaming in your software.');
        } catch (error) {
            console.error('Error setting up stream:', error);
            toast.error('Failed to setup stream');
        } finally {
            setIsSaving(false);
        }
    };

    const endStreamManually = async () => {
        if (!currentStream) return;
        
        if (!confirm('Are you sure you want to end this stream?')) return;

        try {
            await api.post(`/stream/${currentStream.id}/end`);
            setIsLive(false);
            setViewerCount(0);
            toast.success('Stream ended');
            fetchStreamData();
        } catch (error) {
            console.error('Error ending stream:', error);
            toast.error('Failed to end stream');
        }
    };

    const resetStreamKey = async () => {
        if (!confirm('This will disconnect any current streams. Continue?')) return;
        
        try {
            const res = await api.post('/stream/key/reset');
            setStreamKey(res.data.streamKey);
            toast.success('Stream key reset successfully');
        } catch (error) {
            console.error('Error resetting stream key:', error);
            toast.error('Failed to reset stream key');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        handleClipboardCopy(text, label, toast, setCopied);
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const serverUrl = getRtmpUrl();
    const playbackUrl = getPlaybackUrl(user?.username);

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Go Live</h1>
                    <p className="text-muted-foreground">Setup and manage your live stream</p>
                </div>
                {isLive && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg animate-pulse">
                            <Radio className="h-5 w-5" />
                            <span className="font-bold">LIVE</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                            <Users className="h-5 w-5" />
                            <span className="font-semibold">{viewerCount}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Stream Setup */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stream Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stream Information</CardTitle>
                            <CardDescription>
                                Configure your stream before going live
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input 
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's happening today?"
                                    maxLength={STREAM_SETTINGS.TITLE_MAX_LENGTH}
                                    disabled={isLive}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell viewers what this stream is about..."
                                    rows={3}
                                    disabled={isLive}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    disabled={isLive}
                                >
                                    {STREAM_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={chatEnabled}
                                        onChange={(e) => setChatEnabled(e.target.checked)}
                                        className="rounded"
                                        disabled={isLive}
                                    />
                                    <span className="text-sm">Enable chat</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={recordStream}
                                        onChange={(e) => setRecordStream(e.target.checked)}
                                        className="rounded"
                                        disabled={isLive}
                                    />
                                    <span className="text-sm">Save as VOD</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button 
                                    onClick={setupStream} 
                                    disabled={isSaving || isLive}
                                    className="flex-1"
                                >
                                    {isSaving ? 'Saving...' : 'Save Setup'}
                                </Button>
                                {isLive && (
                                    <>
                                        <Button 
                                            variant="destructive"
                                            onClick={endStreamManually}
                                        >
                                            End Stream
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(playbackUrl)}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Stream
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Streaming Software Setup */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Streaming Software Setup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="obs" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="obs">OBS Studio</TabsTrigger>
                                    <TabsTrigger value="streamlabs">Streamlabs</TabsTrigger>
                                    <TabsTrigger value="other">Other</TabsTrigger>
                                </TabsList>
                                <TabsContent value="obs" className="space-y-4 mt-4">
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Open <strong>OBS Studio</strong></li>
                                        <li>Go to <strong>Settings → Stream</strong></li>
                                        <li>Set <strong>Service</strong> to "Custom"</li>
                                        <li>Enter the Server URL and Stream Key from the right panel</li>
                                        <li>Click <strong>Apply</strong> then <strong>OK</strong></li>
                                        <li>Click <strong>Start Streaming</strong> in OBS</li>
                                    </ol>
                                </TabsContent>
                                <TabsContent value="streamlabs" className="space-y-4 mt-4">
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Open <strong>Streamlabs OBS</strong></li>
                                        <li>Go to <strong>Settings → Stream</strong></li>
                                        <li>Select <strong>Custom Streaming Server</strong></li>
                                        <li>Enter the Server URL and Stream Key</li>
                                        <li>Click <strong>Done</strong></li>
                                        <li>Click <strong>Go Live</strong></li>
                                    </ol>
                                </TabsContent>
                                <TabsContent value="other" className="space-y-4 mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Most streaming software supports custom RTMP servers. Look for:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Custom Stream/Server settings</li>
                                        <li>RTMP URL field (use the Server URL)</li>
                                        <li>Stream Key field</li>
                                    </ul>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <p className="font-semibold mb-2 text-sm">Recommended Settings:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                    <li>Resolution: 1920x1080 or 1280x720</li>
                                    <li>Bitrate: 4000-6000 Kbps (1080p) or 2500-4000 Kbps (720p)</li>
                                    <li>Encoder: x264 or Hardware (NVENC/AMD)</li>
                                    <li>Keyframe Interval: 2 seconds</li>
                                    <li>Audio Bitrate: 128-160 Kbps</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stream Credentials */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stream Credentials</CardTitle>
                            <CardDescription>
                                Use these in your streaming software
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>RTMP Server URL</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        readOnly 
                                        value={serverUrl}
                                        className="bg-muted text-xs"
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => copyToClipboard(serverUrl, 'Server URL')}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Stream Key</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input 
                                            type={showKey ? "text" : "password"} 
                                            readOnly 
                                            value={streamKey} 
                                            className="pr-10 text-xs"
                                        />
                                        <button 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowKey(!showKey)}
                                        >
                                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => copyToClipboard(streamKey, 'Stream key')}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-red-500 font-medium">
                                    ⚠️ Never share your stream key
                                </p>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={resetStreamKey}
                                    className="w-full mt-2"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset Stream Key
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {currentStream && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Stream Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`font-semibold ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {isLive ? '🔴 Live' : '⚪ Offline'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Viewers</span>
                                    <span className="font-semibold">{viewerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Peak Viewers</span>
                                    <span className="font-semibold">{currentStream.peakViewers || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Views</span>
                                    <span className="font-semibold">{currentStream.totalViews || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
