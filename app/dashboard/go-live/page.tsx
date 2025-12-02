'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function GoLivePage() {
    const [streamKey, setStreamKey] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStreamKey();
    }, []);

    const fetchStreamKey = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stream/key`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStreamKey(response.data.streamKey);
        } catch (error) {
            console.error('Error fetching stream key:', error);
            toast.error('Failed to load stream key');
        } finally {
            setIsLoading(false);
        }
    };

    const resetStreamKey = async () => {
        if (!confirm('Are you sure? This will disconnect any current streams.')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stream/key/reset`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStreamKey(response.data.streamKey);
            toast.success('Stream key reset successfully');
        } catch (error) {
            console.error('Error resetting stream key:', error);
            toast.error('Failed to reset stream key');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(streamKey);
        setCopied(true);
        toast.success('Stream key copied');
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Go Live</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Stream Settings</CardTitle>
                        <CardDescription>
                            Use these settings in your streaming software (OBS, Streamlabs, etc.)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>RTMP Server URL</Label>
                            <div className="flex gap-2">
                                <Input 
                                    readOnly 
                                    value="rtmp://localhost:1935/live" 
                                    className="bg-muted"
                                />
                                <Button variant="outline" size="icon" onClick={() => {
                                    navigator.clipboard.writeText("rtmp://localhost:1935/live");
                                    toast.success("URL copied");
                                }}>
                                    <Copy className="h-4 w-4" />
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
                                        className="pr-10"
                                    />
                                    <button 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowKey(!showKey)}
                                    >
                                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="destructive" size="icon" onClick={resetStreamKey} title="Reset Key">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-red-500">
                                Never share your stream key with anyone.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Open your streaming software (e.g., OBS Studio).</li>
                            <li>Go to <strong>Settings &gt; Stream</strong>.</li>
                            <li>Set <strong>Service</strong> to "Custom".</li>
                            <li>Enter the <strong>Server</strong> URL provided.</li>
                            <li>Enter your <strong>Stream Key</strong>.</li>
                            <li>Click <strong>Apply</strong> and then <strong>Start Streaming</strong>.</li>
                        </ol>
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="font-semibold mb-2">Recommended Settings:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Resolution: 1920x1080 or 1280x720</li>
                                <li>Bitrate: 4000-6000 Kbps</li>
                                <li>Keyframe Interval: 2 seconds</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
