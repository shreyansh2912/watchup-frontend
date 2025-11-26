"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Twitter, Facebook, Linkedin } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  videoId: string;
  title: string;
}

export default function ShareModal({ videoId, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Construct the full URL (assuming client-side execution)
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/watch/${videoId}`
    : `https://stremers.com/watch/${videoId}`; // Fallback

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(`Check out this video: ${title}`);
    const link = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text} ${link}`;
        break;
    }

    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
            {/* Social Icons */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-white/10 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all" onClick={() => shareToSocial('twitter')} title="Share on Twitter">
                    <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-white/10 hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/50 transition-all" onClick={() => shareToSocial('facebook')} title="Share on Facebook">
                    <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-white/10 hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-all" onClick={() => shareToSocial('linkedin')} title="Share on LinkedIn">
                    <Linkedin className="w-5 h-5" />
                </Button>
                 <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-white/10 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all" onClick={() => shareToSocial('whatsapp')} title="Share on WhatsApp">
                    {/* Simple WhatsApp Icon SVG since Lucide might not have it or it's named differently */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                </Button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Input 
                    value={shareUrl} 
                    readOnly 
                    className="bg-transparent border-none focus-visible:ring-0 text-gray-300 h-9"
                />
                <Button size="sm" onClick={handleCopy} className={copied ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-white/10 hover:bg-white/20"}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
