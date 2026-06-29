import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type ChatFrom = 'bot' | 'user';

interface ChatBubbleProps {
  from: ChatFrom;
  text: string;
  time?: string;
}

export function ChatBubble({ from, text, time }: ChatBubbleProps) {
  const isUser = from === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug text-[#e9edef] shadow-sm',
          isUser ? 'rounded-br-sm' : 'rounded-bl-sm',
        )}
        style={{ backgroundColor: isUser ? '#005c4b' : '#202c33' }}
      >
        <span className="whitespace-pre-wrap">{text}</span>
        {time && (
          <span className="ml-2 inline-flex items-center gap-0.5 align-bottom text-[10px] text-white/50">
            {time}
            {isUser && (
              <svg width="14" height="10" viewBox="0 0 16 11" fill="none" className="text-sky-300">
                <path d="M1 5.5 4 8.5 9.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 8.5 11.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-bl-sm px-3 py-3" style={{ backgroundColor: '#202c33' }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
