"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    username: string;
    avatar: string | null;
  };
  userId: number;
}

import { formatTimeAgo } from "@/lib/utils";

export default function CommentSection({ videoId }: { videoId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/${videoId}`);
        if (res.data.success) {
          setComments(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const res = await api.post(`/comments/${videoId}`, { content: newComment });
      if (res.data.success) {
        setComments([res.data.data, ...comments]);
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

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
             {/* Current user avatar placeholder */}
             <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                {user.username[0].toUpperCase()}
             </div>
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
          Please login to comment.
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.username} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 text-xs">
                        {comment.user.username[0].toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.user.username}</span>

                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
            </div>
            {user && user.id === comment.userId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500" onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
