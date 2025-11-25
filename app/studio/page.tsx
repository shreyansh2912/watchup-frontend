"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"; // Assuming you might need to create this or use standard table
import { Eye, ThumbsUp, Users, Video, Edit, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function StudioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
      totalViews: 0,
      totalSubscribers: 0,
      totalVideos: 0,
      totalLikes: 0
  });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
        return;
    }

    const fetchData = async () => {
        try {
            const [statsRes, videosRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/videos')
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (videosRes.data.success) setVideos(videosRes.data.data);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        fetchData();
    }
  }, [user, authLoading, router]);

  const handleDeleteVideo = async (videoId: number) => {
      if (!confirm("Are you sure you want to delete this video?")) return;
      try {
          await api.delete(`/videos/${videoId}`);
          setVideos(videos.filter((v: any) => v.id !== videoId));
          // Update stats locally or refetch
          setStats(prev => ({ ...prev, totalVideos: prev.totalVideos - 1 }));
      } catch (error) {
          console.error("Error deleting video:", error);
      }
  };

  if (loading || authLoading) return <div className="p-8 text-center">Loading Studio...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      <main className="container py-6">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Creator Studio</h1>
            <Link href="/upload">
                <Button>Upload New Video</Button>
            </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Videos</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVideos}</div>
                </CardContent>
            </Card>
        </div>

        {/* Videos Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Your Videos</h2>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-white/5 border-white/10">
                        <TableHead className="w-[400px]">Video</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.map((video: any) => (
                        <TableRow key={video.id} className="hover:bg-white/5 border-white/10">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="max-w-xs">
                                        <Link href={`/watch/${video.id}`} className="font-medium hover:text-primary hover:underline line-clamp-2 transition-colors">
                                            {video.title}
                                        </Link>
                                        <p className="text-xs text-gray-400 line-clamp-1">{video.description}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-400">
                                {new Date(video.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {video.views}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
                                        <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer">
                                            <Link href={`/watch/${video.id}`}>
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" onClick={() => handleDeleteVideo(video.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {videos.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                You haven't uploaded any videos yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </main>
    </div>
  );
}
