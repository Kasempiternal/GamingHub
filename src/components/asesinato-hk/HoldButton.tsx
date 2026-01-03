'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HoldButtonProps {
  onHoldStart: () => void;
  onHoldEnd: () => void;
  isHolding: boolean;
  disabled?: boolean;
  isFake?: boolean;
  label?: string;
}

export function HoldButton({
  onHoldStart,
  onHoldEnd,
  isHolding,
  disabled = false,
  isFake = false,
  label = 'MANTENER PRESIONADO',
}: HoldButtonProps) {
  const isHoldingRef = useRef(false);

  const handleStart = useCallback(() => {
    if (disabled) return;
    if (isFake) {
      // Fake button does nothing but looks like it's working
      return;
    }
    if (!isHoldingRef.current) {
      isHoldingRef.current = true;
      onHoldStart();
    }
  }, [disabled, isFake, onHoldStart]);

  const handleEnd = useCallback(() => {
    if (isFake) return;
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      onHoldEnd();
    }
  }, [isFake, onHoldEnd]);

  // Prevent context menu on long press
  const handleContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return (
    <motion.button
      className={`
        w-full aspect-square max-w-xs mx-auto rounded-3xl
        flex flex-col items-center justify-center gap-4
        text-white font-bold text-xl
        select-none touch-none
        transition-colors duration-200
        ${disabled
          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          : isHolding || isFake
            ? 'bg-red-700 border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : 'bg-slate-800 border-4 border-slate-600 hover:border-slate-500'
        }
      `}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onContextMenu={handleContextMenu}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.98 }}
      animate={isHolding || isFake ? {
        boxShadow: [
          '0 0 20px rgba(239,68,68,0.3)',
          '0 0 40px rgba(239,68,68,0.5)',
          '0 0 20px rgba(239,68,68,0.3)',
        ],
      } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Moon icon */}
      <motion.span
        className="text-6xl"
        animate={isHolding || isFake ? {
          scale: [1, 1.1, 1],
          opacity: [1, 0.8, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌙
      </motion.span>

      {/* Label */}
      <span className="text-center px-4">
        {label}
      </span>

      {/* Pulsing ring when holding */}
      {(isHolding || isFake) && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-red-400"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-red-400"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.button>
  );
}
