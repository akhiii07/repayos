import { useEffect, useRef, useState } from 'react';
import { LogoMark } from '@/design-system';
import { timeOfDay } from '@/lib/formatters';
import { ConsumerSurface } from '@/shell/ConsumerSurface';
import type { Assessment } from '@/store/useAssessments';
import { ChatBubble, TypingIndicator, type ChatFrom } from './components/ChatBubble';
import { QuickReplies } from './components/QuickReplies';
import { whatsappFlow, type QuickReply } from './whatsappFlow';

interface Message {
  id: string;
  from: ChatFrom;
  text: string;
  time?: string;
}

export function WhatsappApp() {
  return (
    <ConsumerSurface caption="WhatsApp">
      {(assessment, asOf) => <Chat key={`${assessment.borrower.profile.id}-${asOf}`} assessment={assessment} />}
    </ConsumerSurface>
  );
}

function Chat({ assessment }: { assessment: Assessment }) {
  const { borrower, features, decision } = assessment;
  const firstName = borrower.profile.name.split(' ')[0];
  const flow = whatsappFlow(decision, features, firstName);

  const history: Message[] = borrower.notifications
    .slice(-3)
    .map((n, i) => ({ id: `h${i}`, from: 'bot', text: n.body, time: timeOfDay(n.date) }));

  const [messages, setMessages] = useState<Message[]>([...history, { id: 'live', from: 'bot', text: flow.message, time: '9:30 AM' }]);
  const [repliesUsed, setRepliesUsed] = useState(false);
  const [typing, setTyping] = useState(false);
  const counter = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handlePick = (reply: QuickReply) => {
    setMessages((m) => [...m, { id: `u${counter.current++}`, from: 'user', text: reply.reply, time: '9:31 AM' }]);
    setRepliesUsed(true);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: `b${counter.current++}`, from: 'bot', text: reply.confirm, time: '9:31 AM' }]);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0b141a' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3" style={{ backgroundColor: '#202c33' }}>
        <span className="text-lg text-[#aebac1]" aria-hidden>
          ←
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: '#0b141a' }}>
          <LogoMark size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#e9edef]">RepayOS</p>
          <p className="text-[11px] text-[#8696a0]">online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <div className="mb-2 flex justify-center">
          <span className="rounded-md px-2 py-0.5 text-[10px] text-[#8696a0]" style={{ backgroundColor: '#1d282f' }}>
            Adaptive repayment assistant
          </span>
        </div>
        {messages.map((m) => (
          <ChatBubble key={m.id} from={m.from} text={m.text} time={m.time} />
        ))}
        {typing && <TypingIndicator />}
        {!repliesUsed && <QuickReplies replies={flow.replies} onPick={handlePick} />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar (decorative) */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: '#202c33' }}>
        <div className="flex-1 rounded-full px-3 py-2 text-sm text-[#8696a0]" style={{ backgroundColor: '#2a3942' }}>
          Message
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: '#00a884' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
