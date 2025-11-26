"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface Notification {
    id: number;
    type: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        name: string;
        handle: string;
        avatarUrl: string | null;
    };
    video?: {
        title: string;
        thumbnailUrl: string;
    };
    videoId?: number;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { activeChannel } = useAuth();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=10');
            setNotifications(res.data.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (activeChannel) {
            fetchUnreadCount();
            // Poll for unread count every minute
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [activeChannel]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification.id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        if (notification.type === 'VIDEO_UPLOAD' && notification.videoId) {
            router.push(`/watch/${notification.videoId}`);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!activeChannel) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-accent/50' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex gap-3 w-full">
                                <div className="flex-shrink-0">
                                    {notification.sender.avatarUrl ? (
                                        <img src={notification.sender.avatarUrl} alt={notification.sender.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                            {notification.sender.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm leading-none">
                                        <span className="font-semibold">{notification.sender.name}</span>
                                        {notification.type === 'VIDEO_UPLOAD' && ' uploaded: '}
                                        {notification.type === 'SUBSCRIBE' && ' subscribed to you'}
                                        {notification.type === 'LIKE' && ' liked your video'}
                                        {notification.type === 'COMMENT' && ' commented on your video'}
                                    </p>
                                    {notification.video && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {notification.video.title}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {notification.video?.thumbnailUrl && (
                                    <div className="flex-shrink-0 w-16 h-9 rounded overflow-hidden">
                                        <img src={notification.video.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            {!notification.isRead && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
