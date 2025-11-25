"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function EditChannelPage() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        // 1. Get My Channel ID
        const myChannelRes = await api.get('/channels/my-channel');
        if (!myChannelRes.data.success) {
            throw new Error("Could not find your channel");
        }
        const channelId = myChannelRes.data.data.id;

        // 2. Get Channel Details
        const res = await api.get(`/channels/${channelId}`);
        if (res.data.success) {
          const data = res.data.data;
          setName(data.name);
          setHandle(data.handle);
          setDescription(data.description || '');
        }
      } catch (error) {
        console.error("Error fetching channel:", error);
        setError("Failed to load channel details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChannel();
    } else {
        setLoading(false);
        router.push('/login');
    }
  }, [user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'avatar') setAvatar(e.target.files[0]);
      else setBanner(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('handle', handle);
    formData.append('description', description);
    if (avatar) formData.append('avatar', avatar);
    if (banner) formData.append('banner', banner);

    try {
      const res = await api.put('/channels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        // Redirect to channel page
        router.push(`/channel/${res.data.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating channel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Customize Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
              <p className="text-xs text-gray-500">Leave empty to keep current</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner">Channel Banner</Label>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'banner')}
              />
              <p className="text-xs text-gray-500">Leave empty to keep current</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
