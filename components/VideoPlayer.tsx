"use client";

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';

import { Pen as PenIcon, Maximize, Minimize, Sparkles, Volume2, VolumeX } from 'lucide-react';
import CanvasOverlay from './CanvasOverlay';
import AIChatSidebar, { Message } from './AIChatSidebar';

interface VideoPlayerProps {
  src: string; // The HLS (.m3u8) URL or standard video URL
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  chatProps?: {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
  };
}

export default function VideoPlayer({ src, poster, className, autoPlay = false, chatProps }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHlsSupported, setIsHlsSupported] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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



  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVolumeChange = () => {
      setIsMuted(video.muted);
    };

    video.addEventListener('volumechange', handleVolumeChange);
    
    // Set initial state
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg group", className)}>
      <video
        ref={videoRef}
        poster={poster}
        controls
        controlsList="nofullscreen"
        className="w-full h-full"
        playsInline
      />

      {/* Controls Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Canvas Toggle */}
        <button
            onClick={() => setIsCanvasOpen(true)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
            title="Open Canvas"
        >
            <PenIcon className="w-5 h-5" />
        </button>

        {/* AI Chat Toggle - Only in Fullscreen */}
        {chatProps && isFullscreen && (
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
                title="AI Assistant"
            >
                <Sparkles className="w-5 h-5 text-yellow-400" />
            </button>
        )}

        {/* Volume Toggle */}
        <button
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Custom Fullscreen Toggle (Ensures overlays stay visible) */}
        <button
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Interactive Fullscreen"}
        >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Canvas Overlay */}
      {isCanvasOpen && (
        <CanvasOverlay onClose={() => setIsCanvasOpen(false)} />
      )}

      {/* AI Chat Overlay */}
      {chatProps && (
        <AIChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatProps.messages}
            onSendMessage={chatProps.onSendMessage}
            isLoading={chatProps.isLoading}
            variant="overlay"
        />
      )}
    </div>
  );
}
