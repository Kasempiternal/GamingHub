'use client';

import { motion } from 'framer-motion';

interface MusicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'default' | 'playing' | 'collecting';
}

export function MusicBackground({ intensity = 'medium', variant = 'default' }: MusicBackgroundProps) {
  const noteCount = intensity === 'low' ? 5 : intensity === 'medium' ? 8 : 12;
  const orbOpacity = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.2 : 0.3;

  // Different color schemes based on variant
  const colors = {
    default: {
      primary: 'purple',
      secondary: 'pink',
      gradient: 'from-[#1A0A24] via-[#2D1B4E] to-[#1A0A24]',
    },
    playing: {
      primary: 'green',
      secondary: 'emerald',
      gradient: 'from-[#0A1A14] via-[#1B4E2D] to-[#0A1A14]',
    },
    collecting: {
      primary: 'amber',
      secondary: 'orange',
      gradient: 'from-[#1A140A] via-[#4E3D1B] to-[#1A140A]',
    },
  };

  const currentColors = colors[variant];

  const musicNotes = ['🎵', '🎶', '🎼', '🎹', '🎸', '🎷', '🎺', '🥁', '🎻', '🎤', '🎧', '🪕'];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColors.gradient}`} />

      {/* Animated gradient orbs */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-${currentColors.primary}-600/${Math.round(orbOpacity * 100)} blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [orbOpacity, orbOpacity + 0.2, orbOpacity],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-${currentColors.secondary}-600/${Math.round(orbOpacity * 100)} blur-3xl`}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [orbOpacity + 0.1, orbOpacity + 0.3, orbOpacity + 0.1],
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Additional orb for playing variant */}
      {variant === 'playing' && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-green-500/10 blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Floating music notes */}
      {[...Array(noteCount)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute text-${currentColors.primary}-400/10 pointer-events-none select-none`}
          style={{
            fontSize: `${Math.random() * 2 + 1.5}rem`,
            left: `${(i / noteCount) * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0.05, 0.2, 0.05],
            rotate: [0, Math.random() > 0.5 ? 15 : -15, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeInOut',
          }}
        >
          {musicNotes[i % musicNotes.length]}
        </motion.div>
      ))}

      {/* Vinyl record decorations (subtle) */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full border border-white/5 opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
        <div className="absolute inset-12 rounded-full border border-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/5" />
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-32 -right-32 w-48 h-48 rounded-full border border-white/5 opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-3 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/5" />
        </div>
      </motion.div>

      {/* Sound wave bars (for playing variant) */}
      {variant === 'playing' && (
        <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
          {[...Array(32)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-green-500 to-transparent rounded-t"
              animate={{
                height: [
                  `${Math.random() * 30 + 10}px`,
                  `${Math.random() * 60 + 20}px`,
                  `${Math.random() * 30 + 10}px`,
                ],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Equalizer animation component
export function Equalizer({ isPlaying = false, className = '' }: { isPlaying?: boolean; className?: string }) {
  const bars = 5;

  return (
    <div className={`flex items-end justify-center gap-0.5 h-4 ${className}`}>
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
          animate={
            isPlaying
              ? {
                  height: ['4px', `${8 + Math.random() * 8}px`, '4px'],
                }
              : { height: '4px' }
          }
          transition={
            isPlaying
              ? {
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }
              : {}
          }
        />
      ))}
    </div>
  );
}

// Spinning vinyl record decoration
export function VinylDecoration({
  size = 'medium',
  isSpinning = false,
  albumArt,
}: {
  size?: 'small' | 'medium' | 'large';
  isSpinning?: boolean;
  albumArt?: string;
}) {
  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-zinc-800 to-black shadow-lg relative overflow-hidden`}
      animate={isSpinning ? { rotate: 360 } : {}}
      transition={isSpinning ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
    >
      {/* Album art label */}
      {albumArt ? (
        <div
          className="absolute inset-[20%] rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${albumArt})` }}
        />
      ) : (
        <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-purple-600 to-pink-600" />
      )}

      {/* Vinyl grooves */}
      <div className="absolute inset-[5%] rounded-full border border-white/10" />
      <div className="absolute inset-[10%] rounded-full border border-white/5" />
      <div className="absolute inset-[15%] rounded-full border border-white/5" />

      {/* Center hole */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-900 border border-white/20" />

      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
}
