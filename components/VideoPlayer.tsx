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
  const [isCanvasMinimized, setIsCanvasMinimized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('error', (e) => {
         setError("Error loading video. You might need to join the channel to watch this.");
      });
      setIsHlsSupported(true);
    } 
    // Check if HLS.js is supported
    else if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true, // Auto-adjust quality based on player size
        xhrSetup: function(xhr, url) {
            xhr.withCredentials = true; // Send cookies/auth headers
        }
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
            video.play().catch(e => console.log("Autoplay blocked", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.response && (data.response.code === 403 || data.response.code === 401)) {
            setError("Access Denied. This video is for members only.");
            hls.destroy();
            return;
        }

        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error encountered", data);
                    if (data.response && data.response.code === 403) {
                         setError("Access Denied. Members Only.");
                         hls.destroy();
                    } else {
                        hls.startLoad();
                    }
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
        // Fallback
        console.warn("HLS is not supported in this browser.");
        video.src = src;
        video.onerror = () => {
            setError("Error loading video.");
        };
    }
  }, [src, autoPlay]);

  if (error) {
      return (
          <div className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center text-white", className)}>
              <div className="text-center p-4">
                  <p className="text-xl font-bold mb-2">Video Unavailable</p>
                  <p>{error}</p>
              </div>
          </div>
      );
  }

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
            onClick={() => {
                setIsCanvasOpen(true);
                setIsCanvasMinimized(false);
            }}
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
        <CanvasOverlay 
            onClose={() => setIsCanvasOpen(false)} 
            onMinimize={() => setIsCanvasMinimized(true)}
            className={isCanvasMinimized ? "hidden" : ""}
        />
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
