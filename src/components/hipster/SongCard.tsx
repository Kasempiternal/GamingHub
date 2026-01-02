'use client';

import { motion } from 'framer-motion';
import type { HipsterTimelineCard } from '@/types/game';

interface SongCardProps {
  card: HipsterTimelineCard;
  showYear?: boolean;
  isPlaying?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}

export function SongCard({
  card,
  showYear = true,
  isPlaying = false,
  size = 'medium',
  onClick,
  className = '',
}: SongCardProps) {
  const sizes = {
    small: {
      container: 'w-10 h-10',
      text: 'text-[6px]',
      year: 'text-[8px]',
      hole: 'w-1 h-1',
    },
    medium: {
      container: 'w-12 h-12',
      text: 'text-[7px]',
      year: 'text-[10px]',
      hole: 'w-1.5 h-1.5',
    },
    large: {
      container: 'w-20 h-20',
      text: 'text-[10px]',
      year: 'text-sm',
      hole: 'w-2 h-2',
    },
  };

  const s = sizes[size];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`relative ${s.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Vinyl record shape */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-black shadow-lg overflow-hidden"
        animate={isPlaying ? { rotate: 360 } : {}}
        transition={isPlaying ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
      >
        {/* Album art as label */}
        {card.song.albumArt ? (
          <div
            className="absolute inset-[15%] rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${card.song.albumArt})` }}
          />
        ) : (
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-lg">🎵</span>
          </div>
        )}

        {/* Vinyl grooves */}
        <div className="absolute inset-[5%] rounded-full border border-white/5" />
        <div className="absolute inset-[8%] rounded-full border border-white/5" />
        <div className="absolute inset-[10%] rounded-full border border-white/5" />
        <div className="absolute inset-[12%] rounded-full border border-white/5" />

        {/* Center hole */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${s.hole} rounded-full bg-zinc-900 border border-white/10`} />

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>

      {/* Year badge */}
      {showYear && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
          <span className={`text-white font-bold ${s.year}`}>{card.song.releaseYear}</span>
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-[8px]">▶</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Placeholder card for drop zones
interface PlacementSlotProps {
  isActive?: boolean;
  onClick?: () => void;
  label?: string;
}

export function PlacementSlot({ isActive, onClick, label }: PlacementSlotProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all ${
        isActive
          ? 'border-green-400 bg-green-500/20 text-green-300'
          : 'border-purple-400/50 bg-purple-500/10 text-purple-300/70 hover:border-purple-400 hover:bg-purple-500/20'
      }`}
    >
      <span className="text-2xl">+</span>
      {label && <span className="text-[8px] mt-1">{label}</span>}
    </motion.button>
  );
}

// Empty slot indicator
export function EmptySlot() {
  return (
    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
      <span className="text-white/20 text-sm">Empty</span>
    </div>
  );
}

// Song info overlay (for revealing song details)
interface SongInfoOverlayProps {
  title: string;
  artist: string;
  year: number;
  albumArt?: string;
  isCorrect?: boolean;
  onClose?: () => void;
}

export function SongInfoOverlay({
  title,
  artist,
  year,
  albumArt,
  isCorrect,
  onClose,
}: SongInfoOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-purple-900/90 rounded-2xl p-6 max-w-sm w-full text-center border border-purple-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Result indicator */}
        {isCorrect !== undefined && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
              isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {isCorrect ? '✅' : '❌'}
          </motion.div>
        )}

        {/* Album art */}
        {albumArt && (
          <motion.img
            src={albumArt}
            alt={title}
            className="w-32 h-32 mx-auto rounded-lg shadow-xl mb-4"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
          />
        )}

        {/* Song details */}
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-purple-300/70 mb-2">{artist}</p>
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
          <span className="text-white font-bold text-lg">{year}</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="block w-full mt-4 py-2 text-purple-300/70 hover:text-purple-200 transition-colors"
          >
            Tap to continue
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
