"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import VideoCard from '@/components/VideoCard';

import { Video } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query) {
            const res = await api.get(`/videos/search?query=${encodeURIComponent(query)}`);
            if (res.data.success) {
            setVideos(res.data.data);
            }
        }
      } catch (error) {
        console.error("Error searching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
        
        {loading ? (
            <div>Loading...</div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                ))}
                </div>
                {videos.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No videos found matching your query.
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}
