// Stream Categories
export const STREAM_CATEGORIES = [
    'Gaming',
    'Music',
    'Just Chatting',
    'Education',
    'Sports',
    'Art',
    'Technology',
    'Cooking',
    'Other'
] as const;

// Categories with "All" option for filtering
export const FILTER_CATEGORIES = ['All', ...STREAM_CATEGORIES] as const;

// Stream status
export const STREAM_STATUS = {
    LIVE: 'live',
    OFFLINE: 'offline',
    ENDED: 'ended',
} as const;

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
    LIVE_STREAMS: 10000, // 10 seconds
    STREAM_STATUS: 5000, // 5 seconds
} as const;

// Default URLs
export const DEFAULT_URLS = {
    RTMP: 'rtmp://localhost:1935/live',
    HLS: 'http://localhost:8000',
} as const;

// Stream settings
export const STREAM_SETTINGS = {
    TITLE_MAX_LENGTH: 100,
} as const;
