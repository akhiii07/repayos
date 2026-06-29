import { motion } from 'framer-motion';
import type { QuickReply } from '../whatsappFlow';

export function QuickReplies({ replies, onPick }: { replies: QuickReply[]; onPick: (reply: QuickReply) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-end gap-2">
      {replies.map((r) => (
        <button
          key={r.label}
          onClick={() => onPick(r)}
          className="rounded-full border px-3 py-1.5 text-xs font-medium text-[#8696a0] transition-colors hover:text-[#e9edef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          style={{ borderColor: '#2a3942', backgroundColor: '#111b21' }}
        >
          {r.label}
        </button>
      ))}
    </motion.div>
  );
}
