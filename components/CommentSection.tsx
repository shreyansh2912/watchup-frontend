"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  channel: {
    name: string;
    handle: string;
    avatarUrl: string | null;
  };
  channelId: number;
}

import { formatTimeAgo } from "@/lib/utils";

export default function CommentSection({ videoId }: { videoId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCommentElementRef = useRef<HTMLDivElement | null>(null);
  const { user, activeChannel } = useAuth();

  const fetchComments = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/comments/${videoId}?page=${pageNum}&limit=30`);
      if (res.data.success) {
        setComments((prev) => {
             const newComments = res.data.data.filter((c: Comment) => !prev.some(p => p.id === c.id));
             return [...prev, ...newComments];
        });
        setHasMore(res.data.data.length === 30);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(page);
  }, [videoId, page]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastCommentElementRef.current) {
      observer.current.observe(lastCommentElementRef.current);
    }
  }, [loading, hasMore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeChannel) return;

    try {
      const res = await api.post(`/comments/${videoId}`, { content: newComment });
      if (res.data.success) {
        // Map the response to match the comment structure if needed, 
        // but backend addComment returns { ...newComment, user: channel } 
        // We should probably update backend to return 'channel' key or map it here.
        // Let's assume backend returns 'user' key for compatibility or we map it.
        // Actually, let's check backend addComment again. It returns `user: channel`.
        // So for new comments, we might need to map `user` to `channel` or just handle it.
        // Ideally backend should return `channel`.
        // For now, let's map it manually to avoid backend changes if possible, 
        // OR just use the returned data if we fix the backend to return `channel`.
        // Let's assume we fixed backend or we map it here.
        // Wait, I didn't change addComment return key. It returns `user: channel`.
        // So `res.data.data.user` holds the channel info.
        const newCommentData = {
            ...res.data.data,
            channel: res.data.data.user || res.data.data.channel // Handle both cases
        };
        setComments([newCommentData, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold text-lg mb-4">{comments.length} Comments</h3>

      {activeChannel ? (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
             {activeChannel.avatarUrl ? (
                <img src={activeChannel.avatarUrl} alt={activeChannel.name} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                    {activeChannel.name[0].toUpperCase()}
                </div>
             )}
          </div>
          <div className="flex-1">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim()} size="sm">
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 text-sm text-gray-500">
          Please login and select a channel to comment.
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment, index) => {
            const isLast = comments.length === index + 1;
            return (
              <div 
                key={comment.id} 
                className="flex gap-4"
                ref={isLast ? lastCommentElementRef : null}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {comment.channel?.avatarUrl ? (
                        <img src={comment.channel.avatarUrl} alt={comment.channel.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 text-xs">
                            {comment.channel?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.channel?.name || 'Unknown'}</span>

                    <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                </div>
                {activeChannel && activeChannel.id === comment.channelId && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500" onClick={() => handleDelete(comment.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
              </div>
            );
        })}

        {loading && (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
