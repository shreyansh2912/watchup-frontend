import { DEFAULT_URLS } from './constants';

/**
 * Generates the HLS URL for a stream
 */
export function getHlsUrl(streamKey: string | undefined, isLive: boolean): string {
    if (!streamKey || !isLive) return '';

    const baseUrl = process.env.NEXT_PUBLIC_HLS_URL || DEFAULT_URLS.HLS;
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
}

/**
 * Generates the RTMP server URL
 */
export function getRtmpUrl(): string {
    return process.env.NEXT_PUBLIC_RTMP_URL || DEFAULT_URLS.RTMP;
}

/**
 * Generates the playback URL for a user's stream
 */
export function getPlaybackUrl(username: string | undefined): string {
    if (!username) return '';
    return `/live/${username}`;
}

/**
 * Copies text to clipboard and returns success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Handles clipboard copy with toast notification
 */
export function handleClipboardCopy(
    text: string,
    label: string,
    toast: any,
    setCopied?: (value: boolean) => void
): void {
    copyToClipboard(text).then((success) => {
        if (success) {
            toast.success(`${label} copied`);
            if (setCopied) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } else {
            toast.error('Failed to copy to clipboard');
        }
    });
}

/**
 * Extracts and normalizes API response data
 */
export function extractApiData<T>(response: any): T {
    return response.data?.data || response.data || response;
}
