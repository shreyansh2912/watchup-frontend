"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import { Video } from '@/types';

import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const fetchVideos = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/videos?page=${pageNum}&limit=15`);
      if (res.data.success) {
        setVideos((prev) => {
            const newVideos = res.data.data.filter((v: Video) => !prev.some(p => p.id === v.id));
            return [...prev, ...newVideos];
        });
        setHasMore(res.data.data.length === 15);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastVideoElementRef.current) {
      observer.current.observe(lastVideoElementRef.current);
    }
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video, index) => {
            if (videos.length === index + 1) {
              return (
                <div ref={lastVideoElementRef} key={video.id}>
                  <VideoCard video={video} />
                </div>
              );
            } else {
              return <VideoCard key={video.id} video={video} />;
            }
          })}
          
          {loading && (
             <>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
             </>
          )}
        </div>

        {!loading && videos.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">
                No videos found. Be the first to upload!
            </div>
        )}
        
        {!hasMore && videos.length > 0 && (
            <div className="text-center text-muted-foreground mt-10 py-4">
                You've reached the end!
            </div>
        )}
      </main>
    </div>
  );
}
