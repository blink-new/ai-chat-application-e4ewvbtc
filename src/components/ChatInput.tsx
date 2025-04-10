
import React, { useState, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] w-full resize-none"
        disabled={isLoading}
      />
      <Button 
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        size="icon"
      >
        <SendHorizontal size={18} />
      </Button>
    </div>
  );
};