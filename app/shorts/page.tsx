"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import ShortsPlayer from '@/components/ShortsPlayer';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ShortVideo {
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
    slug?: string;
    channel: {
        id: number;
        name: string;
        avatarUrl: string | null;
        handle: string;
    };
    views: number;
}

export default function ShortsPage() {
    const [shorts, setShorts] = useState<ShortVideo[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchShorts();
    }, []);

    const fetchShorts = async () => {
        try {
            const res = await api.get('/shorts/feed');
            if (res.data.success) {
                setShorts(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch shorts", error);
        }
    };

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, clientHeight } = containerRef.current;
            const index = Math.round(scrollTop / clientHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        }
    };

    return (
        <div className="h-screen bg-black flex flex-col overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center pointer-events-none">
                 <div className="pointer-events-auto w-full">
                    <Navbar />
                 </div>
            </div>
            
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide mt-14"
                onScroll={handleScroll}
            >
                {shorts.map((short, index) => (
                    <div key={short.id} className="h-full w-full snap-start">
                        <ShortsPlayer 
                            video={short} 
                            isActive={index === activeIndex} 
                        />
                    </div>
                ))}
                
                {shorts.length === 0 && (
                    <div className="h-full flex items-center justify-center text-white">
                        <p>No shorts available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
