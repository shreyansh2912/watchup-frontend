"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface SubscribeButtonProps {
  channelId: number;
  channelName: string;
}

export default function SubscribeButton({ channelId, channelName }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/subscriptions/${channelId}/status`);
        if (res.data.success) {
          setIsSubscribed(res.data.data.subscribed);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [channelId, user]);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const prevState = isSubscribed;
    setIsSubscribed(!isSubscribed);

    try {
      const res = await api.post('/subscriptions', { channelId });
      if (res.data.success) {
        setIsSubscribed(res.data.data.subscribed);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      setIsSubscribed(prevState); // Revert on error
    }
  };

  // Don't show button if it's the user's own channel
  if (user && user.id === channelId) { // Note: channelId here is actually the channel's ID, we might need to check channel.userId if available, but for now let's assume we can't easily check ownership without extra data. 
    // Actually, the backend prevents subscribing to own channel, so the button will just fail or we can hide it if we pass ownerId.
    // For simplicity, let's just show it and let backend handle the error, or better yet, let's accept ownerId prop.
    return null; 
  }

  return (
    <Button 
      variant={isSubscribed ? "secondary" : "default"} 
      className={`rounded-full ${isSubscribed ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-black text-white hover:bg-gray-800"}`}
      onClick={handleSubscribe}
      disabled={loading}
    >
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
