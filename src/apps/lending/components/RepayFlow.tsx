import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, intentClasses } from '@/design-system';
import { cn } from '@/lib/cn';
import type { FlowContent } from '../borrowerCopy';

export function RepayFlow({ content, onClose }: { content: FlowContent; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const c = intentClasses[content.tone];

  return (
    <div className="flex h-full flex-col p-5">
      <button onClick={onClose} className="self-start text-sm text-muted hover:text-ink">
        ← Back
      </button>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <motion.div
          key={done ? 'success' : 'confirm'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className={cn('flex h-20 w-20 items-center justify-center rounded-full', c.bgSoft, c.text)}
        >
          {done ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          )}
        </motion.div>

        <div>
          <h2 className="text-xl font-bold text-ink">{done ? content.successTitle : content.confirmTitle}</h2>
          <p className="mt-2 px-2 text-sm text-muted">{done ? content.successBody : content.confirmBody}</p>
        </div>
      </div>

      {done ? (
        <Button variant="secondary" block onClick={onClose}>
          Done
        </Button>
      ) : (
        <Button variant={content.tone === 'danger' ? 'danger' : content.tone === 'success' ? 'success' : 'primary'} block onClick={() => setDone(true)}>
          {content.confirmCta}
        </Button>
      )}
    </div>
  );
}
