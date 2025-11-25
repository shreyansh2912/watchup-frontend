"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function Navbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user, logout } = useAuth();
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
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Menu Toggle (Mobile/Desktop) */}
        <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden lg:flex mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className={`font-bold text-xl flex-shrink-0 ${isMobileSearchOpen ? 'hidden sm:block' : 'block'}`}>
          Stremers
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-9 rounded-full bg-white/5 border-white/10 focus:bg-white/10 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Search Bar (Overlay) */}
        {isMobileSearchOpen ? (
            <form onSubmit={handleSearch} className="flex-1 flex sm:hidden items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 rounded-full bg-white/5 border-white/10 focus:bg-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsMobileSearchOpen(false)}>
                    Cancel
                </Button>
            </form>
        ) : (
            <div className="flex items-center gap-2 flex-shrink-0 sm:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(true)}>
                    <Search className="h-5 w-5" />
                </Button>
            </div>
        )}

        {/* User Actions */}
        <div className={`flex items-center gap-2 flex-shrink-0 ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
          {user ? (
            <>
              <Link href="/upload">
                <Button variant="ghost" size="icon" title="Upload Video">
                  <Upload className="h-5 w-5" />
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-white/10">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-xl border-white/10 text-gray-200">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <Link href={`/channel/${user.id}`}>My Channel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <Link href="/studio">Creator Studio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                     <Link href="/history">Watch History</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                     <Link href="/playlists">My Playlists</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
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
