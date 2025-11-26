"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import { User, ChannelDetails } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  channels: ChannelDetails[];
  activeChannel: ChannelDetails | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchChannel: (channelId: number) => void;
  isLoading: boolean;
  refreshChannels: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelDetails[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchChannels = useCallback(async () => {
    try {
      const response = await api.get('/channels');
      const userChannels = response.data.data;
      setChannels(userChannels);

      // Set active channel if not set or if invalid
      const storedActiveChannelId = localStorage.getItem('activeChannelId');
      if (storedActiveChannelId) {
        const found = userChannels.find((c: ChannelDetails) => c.id === parseInt(storedActiveChannelId));
        if (found) {
          setActiveChannel(found);
        } else if (userChannels.length > 0) {
          setActiveChannel(userChannels[0]);
          localStorage.setItem('activeChannelId', userChannels[0].id.toString());
        }
      } else if (userChannels.length > 0) {
        setActiveChannel(userChannels[0]);
        localStorage.setItem('activeChannelId', userChannels[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch channels", error);
    }
  }, []);

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // We need to set the token in api default headers or interceptor will handle it
      // But we need to wait for interceptor to work? No, interceptor reads from localStorage.
      // So we can just fetch channels.
      // However, fetchChannels depends on api working.
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
        fetchChannels();
    }
  }, [token, fetchChannels]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Channels will be fetched by the useEffect above
    router.push('/'); // Redirect to home after login
  }, [router]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setChannels([]);
    setActiveChannel(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeChannelId');
    router.push('/login');
  }, [router]);

  const switchChannel = useCallback((channelId: number) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setActiveChannel(channel);
      localStorage.setItem('activeChannelId', channel.id.toString());
      window.location.reload(); // Reload to ensure all components/queries refresh with new channel context
    }
  }, [channels]);

  return (
    <AuthContext.Provider value={{ user, token, channels, activeChannel, login, logout, switchChannel, isLoading, refreshChannels: fetchChannels }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
