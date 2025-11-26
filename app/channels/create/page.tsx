"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function CreateChannelPage() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshChannels, switchChannel } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/channels', {
        name,
        handle,
        description
      });

      const newChannel = response.data.data;
      
      // Refresh channels list in context
      await refreshChannels();
      
      // Switch to new channel
      switchChannel(newChannel.id);
      
      // Redirect to studio or channel page
      // router.push(`/channel/${newChannel.id}`); // switchChannel already reloads/redirects potentially

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create a New Channel</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Channel Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Channel"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="handle">Handle (Unique ID)</Label>
          <div className="flex items-center">
            <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">@</span>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="myawesomechannel"
              className="rounded-l-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers what your channel is about..."
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
            </Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Channel'}
            </Button>
        </div>
      </form>
    </div>
  );
}
