"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface AIChatSidebarProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  variant?: "sidebar" | "overlay";
}

export default function AIChatSidebar({
  messages,
  onSendMessage,
  isLoading = false,
  isOpen = true,
  onClose,
  className,
  variant = "sidebar"
}: AIChatSidebarProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  if (!isOpen && variant === "overlay") return null;

  return (
    <div 
      className={cn(
        "flex flex-col bg-card border border-border overflow-hidden transition-all duration-300",
        variant === "sidebar" ? "h-[calc(100vh-6rem)] sticky top-20 w-full" : "fixed top-0 right-0 h-full w-80 z-50 shadow-2xl border-l",
        !isOpen && variant === "overlay" ? "translate-x-full" : "translate-x-0",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {variant === "overlay" ? <Sparkles className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-primary" />}
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ask me anything about the video!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3 text-sm max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 bg-muted flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
               </div>
               <div className="bg-muted p-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
