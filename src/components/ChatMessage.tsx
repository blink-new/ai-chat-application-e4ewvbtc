
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 p-4',
        isAI ? 'bg-secondary/50' : 'bg-background'
      )}
    >
      <div className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md',
        isAI ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground'
      )}>
        {isAI ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
};