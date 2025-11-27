"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function UploadShortsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'video') {
        // Validate duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            setError('Video duration must be less than 60 seconds for Shorts.');
            setVideoFile(null);
            // Reset input value
            if (e.target) e.target.value = '';
          } else {
            setError('');
            setVideoFile(file);
          }
        }
        video.src = URL.createObjectURL(file);
      } else {
        setThumbnail(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbnail) {
      setError('Please select both a video and a thumbnail');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);

    try {
      const res = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        // Check if it was actually detected as a short
        if (res.data.data.isShort) {
            router.push('/shorts');
        } else {
            setError('Video was uploaded but is longer than 60 seconds. It will appear as a regular video.');
            // router.push('/'); // Optional: redirect to main page
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <Navbar />
            <div className="container py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Please login to upload Shorts</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload YouTube Short</CardTitle>
            <CardDescription>
                Upload a vertical video (9:16) less than 60 seconds long.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short Title"
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
                  placeholder="Short Description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Video File (Vertical, &lt; 60s)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Uploading Short...' : 'Upload Short'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
