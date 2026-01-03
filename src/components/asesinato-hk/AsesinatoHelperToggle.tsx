'use client';

import { motion } from 'framer-motion';

interface AsesinatoHelperToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function AsesinatoHelperToggle({
  isEnabled,
  onToggle,
}: AsesinatoHelperToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        isEnabled
          ? 'bg-red-800/50 hover:bg-red-700/50 text-red-300'
          : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isEnabled ? 'Desactivar ayuda' : 'Activar ayuda'}
      aria-label={isEnabled ? 'Desactivar ayuda' : 'Activar ayuda'}
    >
      <span className="text-base">{isEnabled ? '💡' : '❓'}</span>
    </motion.button>
  );
}
