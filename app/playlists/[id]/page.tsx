"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

import VideoCard from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Trash2, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Playlist } from '@/types';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchPlaylist = async () => {
    try {
      const res = await api.get(`/playlists/${id}`);
      if (res.data.success) {
        setPlaylist(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("Remove this video from playlist?")) return;
    try {
        await api.delete(`/playlists/${id}/videos/${videoId}`);
        fetchPlaylist(); // Refresh
    } catch (error) {
        console.error("Error removing video:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
        await api.delete(`/playlists/${id}`);
        router.push('/playlists');
    } catch (error) {
        console.error("Error deleting playlist:", error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading playlist...</div>;
  if (!playlist) return <div className="p-8 text-center">Playlist not found</div>;

  const isOwner = user && user.id === playlist.userId;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      <main className="container py-6">
        <div className="flex flex-col md:flex-row gap-8">
            {/* Playlist Info Sidebar */}
            <div className="md:w-1/3 lg:w-1/4 space-y-4">
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl font-bold text-gray-400">
                     {playlist.videos.length > 0 && playlist.videos[0].thumbnailUrl ? (
                         <img src={playlist.videos[0].thumbnailUrl} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                     ) : (
                         playlist.name[0].toUpperCase()
                     )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{playlist.name}</h1>
                    <p className="text-gray-500 text-sm">by {playlist.user.username}</p>
                    <p className="text-gray-500 text-sm">{playlist.videos.length} videos</p>
                    {playlist.description && <p className="mt-2 text-sm">{playlist.description}</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                    {playlist.videos.length > 0 && (
                        <Link href={`/watch/${playlist.videos[0].id}`}>
                            <Button className="w-full gap-2">
                                <Play className="w-4 h-4" />
                                Play All
                            </Button>
                        </Link>
                    )}
                    
                    {isOwner && (
                        <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeletePlaylist}>
                            <Trash2 className="w-4 h-4" />
                            Delete Playlist
                        </Button>
                    )}
                </div>
            </div>

            {/* Videos List */}
            <div className="flex-1 space-y-4">
                {playlist.videos.map((video, index) => (
                    <div key={video.id} className="flex gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg group">
                        <div className="text-gray-400 font-medium w-6 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                        </div>
                        <Link href={`/watch/${video.id}`} className="flex-shrink-0 w-40 aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/watch/${video.id}`}>
                                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">{video.channel.name}</p>
                        </div>
                        {isOwner && (
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteVideo(video.id)}>
                                <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                            </Button>
                        )}
                    </div>
                ))}
                 {playlist.videos.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No videos in this playlist yet.
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
