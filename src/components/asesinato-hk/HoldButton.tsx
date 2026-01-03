'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initAudio } from '@/lib/audioUtils';

interface HoldButtonProps {
  onHoldStart: () => void;
  onHoldEnd: () => void;
  isHolding?: boolean; // Server state (kept for compatibility, not used for visuals)
  disabled?: boolean;
  isFake?: boolean;
  label?: string;
}

export function HoldButton({
  onHoldStart,
  onHoldEnd,
  disabled = false,
  isFake = false,
  label = 'MANTENER PRESIONADO',
}: HoldButtonProps) {
  // LOCAL state for instant visual feedback (like WordReveal)
  const [isLocallyHolding, setIsLocallyHolding] = useState(false);
  const maxHoldTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-release after 30 seconds (safety mechanism)
  useEffect(() => {
    if (isLocallyHolding && !isFake) {
      maxHoldTimeoutRef.current = setTimeout(() => {
        setIsLocallyHolding(false);
        onHoldEnd();
      }, 30000);
    }

    return () => {
      if (maxHoldTimeoutRef.current) {
        clearTimeout(maxHoldTimeoutRef.current);
      }
    };
  }, [isLocallyHolding, isFake, onHoldEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (maxHoldTimeoutRef.current) {
        clearTimeout(maxHoldTimeoutRef.current);
      }
    };
  }, []);

  // Pointer Events (unified for mouse + touch + pen)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (disabled) return;

    // Initialize audio on first interaction (critical for mobile!)
    initAudio();

    if (isFake) {
      // Fake button shows visuals but doesn't notify server
      setIsLocallyHolding(true);
      return;
    }

    setIsLocallyHolding(true); // Instant visual feedback
    onHoldStart();             // Notify server (async, don't wait)
  };

  const handlePointerUp = () => {
    if (disabled) return;

    setIsLocallyHolding(false); // Instant visual feedback

    if (maxHoldTimeoutRef.current) {
      clearTimeout(maxHoldTimeoutRef.current);
    }

    if (!isFake) {
      onHoldEnd(); // Notify server
    }
  };

  const handlePointerLeave = () => {
    if (disabled || !isLocallyHolding) return;

    setIsLocallyHolding(false);

    if (maxHoldTimeoutRef.current) {
      clearTimeout(maxHoldTimeoutRef.current);
    }

    if (!isFake) {
      onHoldEnd();
    }
  };

  const handlePointerCancel = () => {
    if (disabled) return;

    setIsLocallyHolding(false);

    if (maxHoldTimeoutRef.current) {
      clearTimeout(maxHoldTimeoutRef.current);
    }

    if (!isFake) {
      onHoldEnd();
    }
  };

  // Use LOCAL state for all visuals (instant feedback)
  const showHoldingState = isLocallyHolding || isFake;

  return (
    <motion.button
      className={`
        w-full aspect-square max-w-xs mx-auto rounded-3xl
        flex flex-col items-center justify-center gap-4
        text-white font-bold text-xl
        select-none cursor-pointer
        transition-colors duration-200
        ${disabled
          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          : showHoldingState
            ? 'bg-red-700 border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : 'bg-slate-800 border-4 border-slate-600 hover:border-slate-500'
        }
      `}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'none' }}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.98 }}
      animate={showHoldingState ? {
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
        animate={showHoldingState ? {
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
      {showHoldingState && (
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
