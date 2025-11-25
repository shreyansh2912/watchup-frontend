import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Video } from '@/types';

import { cn, formatTimeAgo } from "@/lib/utils"

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="h-full group hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all duration-300 cursor-pointer border border-white/5 bg-white/5 backdrop-blur-sm hover:border-primary/50">
        <div className="relative aspect-video rounded-t-xl overflow-hidden bg-gray-900">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3 pt-4 flex gap-3">
          <div className="flex-shrink-0">
             <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                {video.channel.avatarUrl ? (
                    <img src={video.channel.avatarUrl} alt={video.channel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        {video.channel.name[0].toUpperCase()}
                    </div>
                )}
             </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base line-clamp-2 leading-tight text-gray-100 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1 hover:text-white transition-colors">
              {video.channel.name}
            </p>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <span>{video.views} views</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
