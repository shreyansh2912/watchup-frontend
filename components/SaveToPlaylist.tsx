"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ListPlus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';

interface SaveToPlaylistProps {
  videoId: number;
}

export default function SaveToPlaylist({ videoId }: SaveToPlaylistProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/playlists/my-playlists');
      if (res.data.success) {
        // For each playlist, we ideally want to know if the video is already in it.
        // But our current API doesn't return that easily without fetching each playlist detail.
        // For simplicity, we'll just list them. A more robust implementation would check inclusion.
        setPlaylists(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchPlaylists();
    }
  }, [isOpen, user]);

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
        await api.post(`/playlists/${playlistId}/videos`, { videoId });
        alert("Added to playlist"); // Simple feedback for now
        setIsOpen(false);
    } catch (error: any) {
        alert(error.response?.data?.message || "Failed to add to playlist");
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
          // 1. Create Playlist
          const createRes = await api.post('/playlists', { name: newPlaylistName });
          if (createRes.data.success) {
              const newPlaylistId = createRes.data.data.id;
              // 2. Add Video
              await api.post(`/playlists/${newPlaylistId}/videos`, { videoId });
              alert("Playlist created and video added");
              setIsOpen(false);
              setNewPlaylistName('');
          }
      } catch (error) {
          console.error("Error creating playlist:", error);
      } finally {
          setCreating(false);
      }
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <ListPlus className="w-4 h-4" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
            <div className="max-h-60 overflow-y-auto space-y-2">
                {playlists.map(playlist => (
                    <div key={playlist.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" onClick={() => handleAddToPlaylist(playlist.id)}>
                        <ListPlus className="w-4 h-4 text-gray-500" />
                        <span>{playlist.name}</span>
                    </div>
                ))}
            </div>
            
            <div className="border-t pt-4">
                <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                    <Input 
                        placeholder="Create new playlist..." 
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={creating}>Create</Button>
                </form>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
