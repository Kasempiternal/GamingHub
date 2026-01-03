'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

// Time-themed emojis for floating elements
const TIME_EMOJIS = ['⏱️', '⏰', '⌛', '⏳', '🕐', '🕑', '🕒', '🕓'];

// Times Up / Time pressure themed background
export function TimesUpBackground() {
  const [tick, setTick] = useState(false);

  // Create tick-tock effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate random positions for floating emojis (memoized to prevent re-renders)
  const floatingEmojis = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        emoji: TIME_EMOJIS[i % TIME_EMOJIS.length],
        initialX: 10 + Math.random() * 80,
        initialY: 10 + Math.random() * 80,
        delay: i * 0.8,
        duration: 5 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0d0a05]">
      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Clock tick grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 146, 60, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 146, 60, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial clock lines pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <div className="relative w-[800px] h-[800px]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent origin-center"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating time emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none select-none"
          style={{
            left: `${item.initialX}%`,
            top: `${item.initialY}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.15, 0.3, 0.15],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Pulsing center glow - tick tock effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: tick ? 1.1 : 1,
          opacity: tick ? 0.4 : 0.2,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Corner accent glows */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px]" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px]" />

      {/* Countdown ring pulses */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/20"
            initial={{ width: 0, height: 0, opacity: 0.4 }}
            animate={{
              width: [0, 600],
              height: [0, 600],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Sweeping second hand effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[2px] h-48 origin-top pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(251, 146, 60, 0.3), transparent)',
          transformOrigin: 'top center',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Urgency bars (top and bottom) */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Sand grain particles falling effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-300/30 rounded-full"
            style={{
              left: `${10 + (i * 6)}%`,
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{
              y: ['0%', '100%'],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(13,10,5,0.7) 100%)',
        }}
      />
    </div>
  );
}

// Countdown timer display component
export function CountdownDisplay({
  seconds,
  isUrgent = false,
}: {
  seconds: number;
  isUrgent?: boolean;
}) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <motion.div
      className={`font-mono text-6xl font-bold ${
        isUrgent ? 'text-red-500' : 'text-orange-400'
      }`}
      animate={
        isUrgent
          ? {
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(239,68,68,0.5)',
                '0 0 40px rgba(239,68,68,0.8)',
                '0 0 20px rgba(239,68,68,0.5)',
              ],
            }
          : {}
      }
      transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
    >
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </motion.div>
  );
}

// Time's up explosion animation
export function TimesUpExplosion({
  isActive,
  onComplete,
}: {
  isActive: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Explosion rings */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-4 border-orange-500"
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: [0, 500 + i * 100],
            height: [0, 500 + i * 100],
            opacity: [1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Central text */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{
            rotate: [0, -5, 5, -5, 5, 0],
          }}
          transition={{ duration: 0.5 }}
        >
          ⏰
        </motion.div>
        <motion.h1
          className="text-5xl md:text-7xl font-black text-orange-500 tracking-wider"
          animate={{
            textShadow: [
              '0 0 20px rgba(251,146,60,0.5)',
              '0 0 60px rgba(251,146,60,0.8)',
              '0 0 20px rgba(251,146,60,0.5)',
            ],
          }}
          transition={{ duration: 0.3, repeat: 3 }}
        >
          TIME'S UP!
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}

// Round progress indicator
export function RoundProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {[...Array(total)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < current
              ? 'bg-orange-500'
              : i === current
              ? 'bg-orange-400'
              : 'bg-slate-700'
          }`}
          animate={
            i === current
              ? {
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(251,146,60,0.4)',
                    '0 0 0 8px rgba(251,146,60,0)',
                    '0 0 0 0 rgba(251,146,60,0)',
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: i === current ? Infinity : 0,
          }}
        />
      ))}
    </div>
  );
}
