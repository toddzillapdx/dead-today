'use client';

interface SuggestedPromptsProps {
  venue?: string;
  era?: string;
  onPromptSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ venue, era, onPromptSelect }: SuggestedPromptsProps) {
  const prompts = [
    'What was the setlist for this show?',
    venue ? `Tell me about the ${venue}.` : 'Tell me about this venue.',
    era ? `What makes the ${era} special for the Dead?` : 'What era was this concert?',
    'What are the most notable moments from this show?',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {prompts.slice(0, 4).map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onPromptSelect(prompt)}
          className="text-left text-sm px-4 py-3 rounded-lg bg-dt-text-subtle bg-opacity-10 text-dt-bone hover:bg-opacity-20 hover:border-dt-red border border-transparent transition"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
