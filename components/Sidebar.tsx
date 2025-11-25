"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  Home, 
  Compass, 
  Clock, 
  ThumbsUp, 
  PlaySquare, 
  User, 
  History,
  Menu,
  LayoutGrid
} from 'lucide-react';

interface SubscribedChannel {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string | null;
}

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscribedChannel[]>([]);

  useEffect(() => {
    if (user) {
      api.get('/subscriptions/user')
        .then(res => {
          if (res.data.success) {
            setSubscriptions(res.data.data);
          }
        })
        .catch(err => console.error("Failed to fetch subscriptions", err));
    }
  }, [user]);

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Explore', icon: Compass },
    { href: '/history', label: 'History', icon: History },
    { href: '/playlists', label: 'Playlists', icon: PlaySquare },
  ];

  if (user) {
      // Add user specific links if needed, though most are covered
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] transition-transform duration-300 ease-in-out border-r border-white/10 bg-background/95 backdrop-blur-xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-64"
        )}
      >
        <ScrollArea className="h-full py-4">
          <div className="px-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 font-normal hover:bg-white/10",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {user && (
            <>
              <div className="my-4 border-t border-white/10" />
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Subscriptions</h3>
                <div className="space-y-1">
                  {subscriptions.map((sub) => (
                    <Link key={sub.id} href={`/channel/${sub.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 font-normal hover:bg-white/10 px-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                          {sub.avatarUrl ? (
                            <img src={sub.avatarUrl} alt={sub.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {sub.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="truncate">{sub.name}</span>
                      </Button>
                    </Link>
                  ))}
                  {subscriptions.length === 0 && (
                     <p className="text-xs text-muted-foreground px-2">No subscriptions yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="my-4 border-t border-white/10" />
          
          {user && (
             <div className="px-3 space-y-1">
                 <Link href="/studio">
                    <Button variant="ghost" className="w-full justify-start gap-3 font-normal hover:bg-white/10 text-muted-foreground hover:text-foreground">
                        <LayoutGrid className="h-5 w-5" />
                        Creator Studio
                    </Button>
                 </Link>
             </div>
          )}

        </ScrollArea>
      </aside>
    </>
  );
}
