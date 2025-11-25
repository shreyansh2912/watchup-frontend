"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/VideoCard';
import SubscribeButton from '@/components/SubscribeButton';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { ChannelDetails, Video } from '@/types';

export default function ChannelPage() {
  const { id } = useParams();
  const [channel, setChannel] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await api.get(`/channels/${id}`);
        if (res.data.success) {
          setChannel(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching channel:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChannel();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading channel...</div>;
  if (!channel) return <div className="p-8 text-center">Channel not found</div>;

  const isOwner = user && user.id === channel.userId;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">


      {/* Banner */}
      <div className="h-48 md:h-64 bg-gray-200 w-full relative">
        {channel.bannerUrl ? (
            <img src={channel.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Banner
            </div>
        )}
      </div>

      <main className="container py-6">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 border-4 border-white dark:border-gray-950 -mt-12 md:-mt-16 relative z-10 overflow-hidden">
                {channel.avatarUrl ? (
                    <img src={channel.avatarUrl} alt={channel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-600">
                        {channel.name[0].toUpperCase()}
                    </div>
                )}
            </div>
            
            <div className="flex-1">
                <h1 className="text-2xl font-bold">{channel.name}</h1>
                <p className="text-gray-500 text-sm">{channel.handle} • {channel.subscriberCount} subscribers</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm max-w-2xl">{channel.description}</p>
            </div>

            <div>
                {isOwner ? (
                    <Link href="/channel/edit">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Customize Channel
                        </Button>
                    </Link>
                ) : (
                    <SubscribeButton channelId={channel.id} channelName={channel.name} />
                )}
            </div>
        </div>

        <hr className="mb-8" />

        {/* Videos Grid */}
        <h2 className="text-xl font-bold mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {channel.videos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        {channel.videos.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
                This channel has no videos yet.
            </div>
        )}
      </main>
    </div>
  );
}
