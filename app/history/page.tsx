"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import VideoCard from '@/components/VideoCard';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Video } from '@/types';

export default function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
        return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        if (res.data.success) {
          setVideos(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchHistory();
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Watch History</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
        ))}
        </div>
        {videos.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
                You haven't watched any videos yet.
            </div>
        )}
      </main>
    </div>
  );
}
