import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Video } from '@/types';
import { formatTimeAgo, formatDuration } from "@/lib/utils"

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="h-full group hover:shadow-lg transition-all duration-300 cursor-pointer border-transparent bg-transparent hover:bg-accent p-0 gap-0 overflow-hidden">
        <div className="relative h-48 w-full bg-muted group-hover:ring-2 group-hover:ring-primary transition-all duration-300">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Thumbnail
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium">
            {formatDuration(video.duration)}
          </div>
        </div>
        
        <CardContent className="p-3 pt-4 flex gap-3">
          <div className="flex-shrink-0">
             <div className="w-9 h-9 rounded-full bg-muted overflow-hidden border border-border">
                {video.channel.avatarUrl ? (
                    <img src={video.channel.avatarUrl} alt={video.channel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {video.channel.name[0].toUpperCase()}
                    </div>
                )}
             </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors">
              {video.channel.name}
            </p>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
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
