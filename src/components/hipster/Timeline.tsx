'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HipsterTimelineCard, HipsterSong } from '@/types/game';
import { SongCard, PlacementSlot } from './SongCard';

interface TimelineProps {
  cards: HipsterTimelineCard[];
  currentSong?: HipsterSong | null;
  isMyTurn?: boolean;
  onPlacementSelect?: (position: number) => void;
  selectedPosition?: number | null;
  showPlacementSlots?: boolean;
  compact?: boolean;
}

export function Timeline({
  cards,
  currentSong,
  isMyTurn = false,
  onPlacementSelect,
  selectedPosition = null,
  showPlacementSlots = false,
  compact = false,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sort cards by year for proper display
  const sortedCards = [...cards].sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  // Check scroll state
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cards]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Generate placement positions
  const generatePlacements = () => {
    if (!showPlacementSlots || sortedCards.length === 0) return [];

    const placements: { position: number; label: string }[] = [];

    // Before first card
    placements.push({
      position: 0,
      label: `Before ${sortedCards[0].song.releaseYear}`,
    });

    // Between cards
    for (let i = 0; i < sortedCards.length - 1; i++) {
      placements.push({
        position: i + 1,
        label: `${sortedCards[i].song.releaseYear}-${sortedCards[i + 1].song.releaseYear}`,
      });
    }

    // After last card
    placements.push({
      position: sortedCards.length,
      label: `After ${sortedCards[sortedCards.length - 1].song.releaseYear}`,
    });

    return placements;
  };

  const placements = generatePlacements();

  if (cards.length === 0 && !showPlacementSlots) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-2 opacity-50">🎵</div>
          <p className="text-purple-300/50 text-sm">No cards yet</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-purple-900/80 rounded-full flex items-center justify-center text-purple-300 hover:bg-purple-800 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-purple-900/80 rounded-full flex items-center justify-center text-purple-300 hover:bg-purple-800 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}

      {/* Timeline container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex items-center gap-3 overflow-x-auto scrollbar-hide px-4 ${
          compact ? 'py-2' : 'py-4'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Timeline line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {showPlacementSlots ? (
            // Show interleaved cards and placement slots
            <>
              {placements.map((placement, idx) => (
                <motion.div
                  key={`placement-${placement.position}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  {/* Placement slot before card */}
                  <PlacementSlot
                    isActive={selectedPosition === placement.position}
                    onClick={() => onPlacementSelect?.(placement.position)}
                    label={placement.label}
                  />

                  {/* Card at this index */}
                  {sortedCards[idx] && (
                    <SongCard
                      card={sortedCards[idx]}
                      size={compact ? 'small' : 'medium'}
                    />
                  )}
                </motion.div>
              ))}
            </>
          ) : (
            // Show just the cards
            sortedCards.map((card, index) => (
              <motion.div
                key={card.song.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <SongCard
                  card={card}
                  size={compact ? 'small' : 'medium'}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Year markers */}
      {sortedCards.length > 0 && !showPlacementSlots && (
        <div className="flex justify-between px-8 mt-2">
          <span className="text-purple-400/50 text-xs">
            {Math.min(...sortedCards.map((c) => c.song.releaseYear))}
          </span>
          <span className="text-purple-400/50 text-xs">
            {Math.max(...sortedCards.map((c) => c.song.releaseYear))}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini timeline for player cards display
interface MiniTimelineProps {
  cards: HipsterTimelineCard[];
  maxDisplay?: number;
}

export function MiniTimeline({ cards, maxDisplay = 5 }: MiniTimelineProps) {
  const sortedCards = [...cards].sort((a, b) => a.song.releaseYear - b.song.releaseYear);
  const displayCards = sortedCards.slice(0, maxDisplay);
  const remaining = sortedCards.length - maxDisplay;

  if (cards.length === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-purple-300/30 text-xs">No cards</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {displayCards.map((card) => (
        <div
          key={card.song.id}
          className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 shadow flex-shrink-0"
          style={{
            backgroundImage: card.song.albumArt ? `url(${card.song.albumArt})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!card.song.albumArt && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-[8px]">🎵</span>
            </div>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <span className="text-purple-300/50 text-xs ml-1">+{remaining}</span>
      )}
    </div>
  );
}

// Timeline with placement highlighting for result display
interface ResultTimelineProps {
  cards: HipsterTimelineCard[];
  newCard: HipsterTimelineCard;
  placedPosition: number;
  isCorrect: boolean;
}

export function ResultTimeline({
  cards,
  newCard,
  placedPosition,
  isCorrect,
}: ResultTimelineProps) {
  const allCards = [...cards];
  allCards.splice(placedPosition, 0, newCard);
  const sortedCards = allCards.sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  return (
    <div className="flex items-center justify-center gap-3 py-4 overflow-x-auto">
      {sortedCards.map((card) => (
        <motion.div
          key={card.song.id}
          initial={card.song.id === newCard.song.id ? { scale: 0, y: -50 } : {}}
          animate={{ scale: 1, y: 0 }}
          transition={card.song.id === newCard.song.id ? { type: 'spring', bounce: 0.5 } : {}}
          className="relative"
        >
          <SongCard
            card={card}
            size="medium"
            isPlaying={card.song.id === newCard.song.id}
          />
          {card.song.id === newCard.song.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {isCorrect ? '✓' : '✗'}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
