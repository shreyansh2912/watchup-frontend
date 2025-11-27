export interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
    hasPassword?: boolean;
}

export interface Channel {
    name: string;
    avatarUrl: string | null;
    handle?: string;
}

export interface Video {
    id: number;
    title: string;
    description?: string;
    url?: string;
    publicId?: string;
    thumbnailUrl?: string;
    views: number;
    channelId: number;
    createdAt: string;
    duration: number;
    isShort: boolean;
    slug?: string;
    channel: {
        id: number;
        name: string;
        avatarUrl: string | null;
        handle: string;
    };
}

export interface ChannelDetails {
    id: number;
    name: string;
    handle: string;
    description: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    subscriberCount: number;
    isSubscribed: boolean;
    userId: number;
    videos: Video[];
}

export interface Playlist {
    id: number;
    name: string;
    description: string;
    userId: number;
    isPrivate: boolean;
    user: {
        username: string;
    };
    videos: Video[];
}
