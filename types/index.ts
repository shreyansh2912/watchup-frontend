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


export interface StreamUser {
    id: number;
    username: string;
    avatar: string | null;
}

export interface LiveStream {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    viewerCount: number;
    startedAt: string;
    user: StreamUser;
}

export interface Stream {
    id: number;
    title: string;
    description: string;
    category: string;
    chatEnabled: boolean;
    recordStream: boolean;
    status: 'live' | 'offline' | 'ended';
    viewerCount: number;
    peakViewers: number;
    totalViews: number;
    startedAt: string | null;
    thumbnailUrl: string | null;
}

export interface StreamData {
    channel: ChannelDetails;
    user: User & { streamKey?: string; isLive?: boolean };
    isLive: boolean;
    stream: Stream | null;
}

export interface StreamStats {
    status: 'live' | 'offline';
    viewerCount: number;
    peakViewers: number;
    totalViews: number;
}
