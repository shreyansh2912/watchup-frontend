"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Lock, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox"

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Create Playlist State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/playlists/my-playlists');
      if (res.data.success) {
        setPlaylists(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
        return;
    }

    if (user) {
        fetchPlaylists();
    }
  }, [user, authLoading, router]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
        const res = await api.post('/playlists', {
            name: newPlaylistName,
            isPrivate
        });
        if (res.data.success) {
            setNewPlaylistName('');
            setIsPrivate(false);
            setIsCreateOpen(false);
            fetchPlaylists(); // Refresh list
        }
    } catch (error) {
        console.error("Error creating playlist:", error);
    } finally {
        setCreating(false);
    }
  };

  if (loading || authLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Playlists</h1>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Playlist
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePlaylist} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={newPlaylistName} 
                                onChange={(e) => setNewPlaylistName(e.target.value)} 
                                required 
                                placeholder="Enter playlist name"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="private" 
                                checked={isPrivate} 
                                onCheckedChange={(checked) => setIsPrivate(checked as boolean)} 
                            />
                            <Label htmlFor="private">Private playlist</Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={creating}>
                            {creating ? 'Creating...' : 'Create'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((playlist: any) => (
            <Link href={`/playlists/${playlist.id}`} key={playlist.id}>
                <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center relative">
                        {/* Placeholder for playlist thumbnail (could be first video thumbnail) */}
                        <div className="text-4xl font-bold text-gray-400">
                            {playlist.name[0].toUpperCase()}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                             {playlist.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                             {playlist.isPrivate ? 'Private' : 'Public'}
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle className="line-clamp-1">{playlist.name}</CardTitle>
                        <p className="text-sm text-gray-500">{new Date(playlist.createdAt).toLocaleDateString()}</p>
                    </CardHeader>
                </Card>
            </Link>
        ))}
        </div>
        {playlists.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
                You haven't created any playlists yet.
            </div>
        )}
      </main>
    </div>
  );
}
