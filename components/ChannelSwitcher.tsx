"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export default function ChannelSwitcher() {
  const { channels, activeChannel, switchChannel } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeChannel) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
          {activeChannel.avatarUrl ? (
            <img src={activeChannel.avatarUrl} alt={activeChannel.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
              {activeChannel.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activeChannel.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{activeChannel.handle}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Switch Channel</p>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  switchChannel(channel.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  activeChannel.id === channel.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {channel.avatarUrl ? (
                      <img src={channel.avatarUrl} alt={channel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                        {channel.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{channel.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{channel.handle}</p>
                  </div>
                </div>
                {activeChannel.id === channel.id && <Check className="w-4 h-4 text-purple-600" />}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 p-2">
            <Link
              href="/channels/create"
              className="flex items-center space-x-2 px-2 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="w-4 h-4" />
              <span>Create new channel</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
