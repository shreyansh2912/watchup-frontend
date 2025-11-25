"use client";

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string; // The HLS (.m3u8) URL or standard video URL
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({ src, poster, className, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHlsSupported, setIsHlsSupported] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      setIsHlsSupported(true);
    } 
    // Check if HLS.js is supported
    else if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true, // Auto-adjust quality based on player size
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
            video.play().catch(e => console.log("Autoplay blocked", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error encountered", data);
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error encountered", data);
                    hls.recoverMediaError();
                    break;
                default:
                    console.error("Unrecoverable error", data);
                    hls.destroy();
                    break;
            }
        }
      });

      setIsHlsSupported(true);

      return () => {
        hls.destroy();
      };
    } else {
        // Fallback for browsers with no HLS support (very rare now for modern ones, but good to have)
        // If the src is a .m3u8 and no HLS support, this will fail. 
        // Ideally, we should provide a .mp4 fallback here if possible, 
        // but for this implementation we assume HLS or native support.
        console.warn("HLS is not supported in this browser.");
        video.src = src; // Try direct load just in case
    }
  }, [src, autoPlay]);

  return (
    <div className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg", className)}>
      <video
        ref={videoRef}
        poster={poster}
        controls
        className="w-full h-full"
        playsInline
      />
    </div>
  );
}
