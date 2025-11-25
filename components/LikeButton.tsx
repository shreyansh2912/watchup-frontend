"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LikeStatus {
  likes: number;
  dislikes: number;
  userStatus: 'LIKE' | 'DISLIKE' | null;
}

export default function LikeButton({ videoId }: { videoId: number }) {
  const [status, setStatus] = useState<LikeStatus>({ likes: 0, dislikes: 0, userStatus: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get(`/likes/${videoId}/status`);
        if (res.data.success) {
          setStatus(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };
    fetchStatus();
  }, [videoId]);

  const handleToggle = async (type: 'LIKE' | 'DISLIKE') => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const prevStatus = { ...status };
    let newStatus = { ...status };

    if (status.userStatus === type) {
      // Toggle off
      newStatus.userStatus = null;
      if (type === 'LIKE') newStatus.likes--;
      else newStatus.dislikes--;
    } else {
      // Toggle on or switch
      if (status.userStatus === 'LIKE') newStatus.likes--;
      if (status.userStatus === 'DISLIKE') newStatus.dislikes--;

      newStatus.userStatus = type;
      if (type === 'LIKE') newStatus.likes++;
      else newStatus.dislikes++;
    }

    setStatus(newStatus);

    try {
      await api.post(`/likes/${videoId}`, { type });
    } catch (error) {
      console.error("Error toggling like:", error);
      setStatus(prevStatus); // Revert on error
    }
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-l-full px-4 gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 ${status.userStatus === 'LIKE' ? 'text-blue-600' : ''}`}
        onClick={() => handleToggle('LIKE')}
      >
        <ThumbsUp className={`h-4 w-4 ${status.userStatus === 'LIKE' ? 'fill-current' : ''}`} />
        <span>{status.likes}</span>
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-r-full px-4 gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 ${status.userStatus === 'DISLIKE' ? 'text-red-600' : ''}`}
        onClick={() => handleToggle('DISLIKE')}
      >
        <ThumbsDown className={`h-4 w-4 ${status.userStatus === 'DISLIKE' ? 'fill-current' : ''}`} />
        {status.dislikes > 0 && <span>{status.dislikes}</span>}
      </Button>
    </div>
  );
}
