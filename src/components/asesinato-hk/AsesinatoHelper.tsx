'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { AsesinatoPhase, AsesinatoRole } from '@/types/game';
import { getHelperContent } from './helperContent';

interface AsesinatoHelperProps {
  phase: AsesinatoPhase;
  role: AsesinatoRole | null;
  isEnabled: boolean;
  onDismiss: () => void;
}

export function AsesinatoHelper({
  phase,
  role,
  isEnabled,
  onDismiss,
}: AsesinatoHelperProps) {
  const content = getHelperContent(phase, role);

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="bg-red-900/40 border border-red-700/50 rounded-xl p-4 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{content.emoji}</span>
              <h3 className="font-bold text-white text-sm">{content.title}</h3>
            </div>
            <button
              onClick={onDismiss}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-red-800/50 hover:bg-red-700/50 text-white/70 hover:text-white text-xs transition-colors"
              aria-label="Cerrar ayuda"
            >
              ✕
            </button>
          </div>

          {/* Tips */}
          <ul className="space-y-1.5">
            {content.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-white/80 text-xs"
              >
                <span className="text-red-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
