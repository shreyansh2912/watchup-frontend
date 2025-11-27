"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import SubscribeButton from '@/components/SubscribeButton';

import SaveToPlaylist from '@/components/SaveToPlaylist';
import { Video } from '@/types';

import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/utils";
import VideoPlayer from '@/components/VideoPlayer';
import ShareModal from '@/components/ShareModal';
import Navbar from '@/components/Navbar';
import AIChatSidebar, { Message } from '@/components/AIChatSidebar';
import { Flag } from 'lucide-react';
import ReportModal from '@/components/ReportModal';

export default function WatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hello! I'm your AI assistant. Ask me anything about the video!" },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const userMsg: Message = { id: Date.now(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    // Mock response
    setTimeout(() => {
      const botMsg: Message = { 
        id: Date.now() + 1, 
        role: "assistant", 
        content: "That's an interesting point! Tell me more about what you think." 
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsChatLoading(false);
    }, 1500);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${id}`);
        if (res.data.success) {
          setVideo(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  useEffect(() => {
    if (video && user) {
        api.post('/history', { videoId: video.id }).catch(err => console.error("Failed to record history", err));
    }
  }, [video, user]);

  if (loading) return (
      <div className="min-h-screen bg-white dark:bg-gray-950">

        <main className="container py-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                             <div key={i} className="flex gap-2">
                                <Skeleton className="h-20 w-36 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
      </div>
  );
  if (!video) return <div className="p-8 text-center">Video not found</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
       <Navbar />

      <main className="container py-6 max-w-[1800px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 space-y-4">
            <VideoPlayer 
                src={video.publicId && video.url ? 
                    video.url.replace('/upload/', '/upload/f_m3u8/').replace(/\.[^/.]+$/, ".m3u8") : 
                    (video.url || '')
                }
                poster={video.thumbnailUrl}
                autoPlay
                chatProps={{
                    messages,
                    onSendMessage: handleSendMessage,
                    isLoading: isChatLoading
                }}
            />
            <div>
              <h1 className="text-2xl font-bold line-clamp-2">{video.title}</h1>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                       {video.channel.avatarUrl ? (
                           <img src={video.channel.avatarUrl} alt={video.channel.name} className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                               {video.channel.name[0].toUpperCase()}
                           </div>
                       )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{video.channel.name}</p>
                      <p className="text-xs">{video.channel.handle}</p>
                    </div>
                  </div>
                  <SubscribeButton channelId={video.channelId} channelName={video.channel.name} />
                </div>
                
                <div className="flex items-center gap-2">
                   <ShareModal videoId={video.slug || video.id.toString()} title={video.title} />
                   <LikeButton videoId={video.id} />
                   <SaveToPlaylist videoId={video.id} />
                   <Button variant="ghost" size="icon" onClick={() => setIsReportOpen(true)} title="Report Video">
                      <Flag className="w-5 h-5" />
                   </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl text-sm whitespace-pre-wrap">

               <div className="font-semibold mb-2">
                  {video.views} views • {formatTimeAgo(video.createdAt)}
               </div>
               <p>{video.description}</p>
            </div>

            {/* Comments */}
            <CommentSection videoId={video.id} />
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-3">
             <AIChatSidebar 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
             />
          </div>
        </div>
      </main>
      
      <ReportModal 
        videoId={video.id} 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </div>
  );
}
