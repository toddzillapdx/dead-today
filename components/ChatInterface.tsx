'use client';

import { useState, useRef, useEffect } from 'react';
import { Show } from '@/lib/types';
import { ChatMessage } from '@/components/ChatMessage';
import { ContextBanner } from '@/components/ContextBanner';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { MessageLimitBar } from '@/components/MessageLimitBar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  show: Show;
}

export function ChatInterface({ show }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSendMessage = messageCount < 20;
  const maxReached = messageCount >= 20;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Load message count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('chatCount');
    const storedDate = localStorage.getItem('chatCountDate');

    if (storedDate === today && stored) {
      setMessageCount(parseInt(stored, 10));
    } else {
      // Reset for new day
      localStorage.setItem('chatCountDate', today);
      localStorage.setItem('chatCount', '0');
      setMessageCount(0);
    }
  }, []);

  const updateMessageCount = (newCount: number) => {
    setMessageCount(newCount);
    localStorage.setItem('chatCount', newCount.toString());
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !canSendMessage) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    updateMessageCount(messageCount + 1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: show.identifier,
          showContext: {
            date: show.date,
            venue: show.venue,
            location: show.city,
            era: show.era,
            rating: show.avgRating,
          },
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let aiMessageId = `msg-${Date.now()}-ai`;

      // Create placeholder AI message
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: 'assistant', content: '' },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.delta) {
                fullResponse += json.delta;
                // Update the AI message in real-time
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: fullResponse }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      setIsStreaming(false);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: 'Sorry, I could not process your request. Please try again.',
        },
      ]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <ContextBanner show={show} />

      {messages.length === 0 && (
        <div>
          <p className="text-dt-bone text-sm mb-4">
            Ask anything about this concert. Powered by Claude.
          </p>
          <SuggestedPrompts
            venue={show.venue}
            era={show.era}
            onPromptSelect={handlePromptSelect}
          />
        </div>
      )}

      <div className="bg-dt-text-subtle bg-opacity-5 rounded-lg p-6 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-dt-text-subtle text-sm text-center py-8">
            Start a conversation
          </p>
        ) : (
          <div>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && msg.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageLimitBar count={messageCount} />

      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading || maxReached}
          placeholder={maxReached ? 'Daily limit reached' : 'Type your question...'}
          className="flex-1 px-4 py-3 rounded-lg bg-dt-text-subtle bg-opacity-10 text-dt-bone placeholder-dt-text-subtle focus:outline-none focus:ring-2 focus:ring-dt-red disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !canSendMessage || !input.trim()}
          className="px-6 py-3 rounded-lg bg-dt-red text-dt-black font-medium hover:opacity-90 disabled:opacity-50 transition uppercase text-sm"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
