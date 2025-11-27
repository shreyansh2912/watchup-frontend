"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from '@/context/AuthContext';
import { Search, Upload, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChannelSwitcher from './ChannelSwitcher';
import NotificationBell from './NotificationBell';

export default function Navbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user, logout, activeChannel } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className={`font-bold text-xl flex-shrink-0 ${isMobileSearchOpen ? 'hidden sm:block' : 'block'}`}>
            Stremers
            </Link>
        </div>

        {/* Center Section: Desktop Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden sm:flex items-center px-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-9 rounded-full bg-muted/50 border-border focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Search Bar (Overlay) */}
        {isMobileSearchOpen ? (
            <form onSubmit={handleSearch} className="absolute inset-x-4 top-2 z-50 flex sm:hidden items-center space-x-2 bg-background p-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 rounded-full bg-muted/50 border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsMobileSearchOpen(false)}>
                    Cancel
                </Button>
            </form>
        ) : null}

        {/* Right Section: Actions */}
        <div className={`flex items-center gap-2 flex-shrink-0 ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
           <div className="sm:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(true)}>
                    <Search className="h-5 w-5" />
                </Button>
            </div>

          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationBell />
              <div className="hidden md:block">
                <ChannelSwitcher />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Upload">
                    <Upload className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/upload">Upload Video</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/shorts/upload">Upload Short</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                    {activeChannel?.avatarUrl ? (
                        <img src={activeChannel.avatarUrl} alt={activeChannel.name} className="w-full h-full object-cover" />
                    ) : user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span>{activeChannel?.name || user.username}</span>
                        <span className="text-xs text-muted-foreground">{activeChannel?.handle || user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="md:hidden p-2">
                     <ChannelSwitcher />
                  </div>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={activeChannel ? `/channel/${activeChannel.id}` : '#'}>My Channel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/studio">Creator Studio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/history">Watch History</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/playlists">My Playlists</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
