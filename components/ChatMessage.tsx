'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-dt-red text-dt-black rounded-br-none'
            : 'bg-transparent text-dt-bone'
        }`}
      >
        <p className="text-sm break-words">{content}</p>
        {isStreaming && isUser === false && (
          <span className="inline-block ml-1 w-2 h-4 bg-dt-bone animate-pulse" />
        )}
      </div>
    </div>
  );
}
