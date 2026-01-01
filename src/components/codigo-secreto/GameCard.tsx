'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card, CardRevealResult } from '@/types/game';

interface GameCardProps {
  card: Card;
  index: number;
  isSpymaster: boolean;
  canGuess: boolean;
  onClick: () => void;
  lastReveal?: { cardIndex: number; result: CardRevealResult; revealedAt: number } | null;
  isProposed?: boolean;
}

// Dramatic card reveal overlay
function RevealOverlay({
  stage,
  result,
  cardType
}: {
  stage: 'scanning' | 'decrypting' | 'revealing' | 'complete';
  result: CardRevealResult;
  cardType: string;
}) {
  const getResultIcon = () => {
    switch (result) {
      case 'correct':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            ✓
          </motion.div>
        );
      case 'wrong':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ rotate: { repeat: 2 } }}
            className="text-4xl"
          >
            ✗
          </motion.div>
        );
      case 'neutral':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            —
          </motion.div>
        );
      case 'assassin':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 0.8 }}
            className="text-5xl"
          >
            💀
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="absolute inset-0 rounded-lg overflow-hidden z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {stage === 'scanning' && (
          <motion.div
            key="scanning"
            className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Scanning line */}
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
              initial={{ top: 0 }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.6, repeat: 1 }}
            />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(rgba(217, 119, 6, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(217, 119, 6, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '10px 10px'
            }} />

            <motion.span
              className="text-amber-400 text-[10px] font-mono tracking-widest z-10"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              ESCANEANDO...
            </motion.span>

            {/* Scanner bars */}
            <div className="flex gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-amber-400/70"
                  animate={{ height: [8, 16, 8] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'decrypting' && (
          <motion.div
            key="decrypting"
            className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Redacted bars sliding away */}
            <div className="absolute inset-1 flex flex-col gap-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 bg-slate-600"
                  initial={{ scaleX: 1, x: 0 }}
                  animate={{
                    scaleX: 0,
                    x: i % 2 === 0 ? -50 : 50
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.08,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            <motion.span
              className="text-green-400 text-[10px] font-mono tracking-widest z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1] }}
              transition={{ duration: 0.4, repeat: 1 }}
            >
              DESCLASIFICANDO...
            </motion.span>
          </motion.div>
        )}

        {stage === 'revealing' && (
          <motion.div
            key="revealing"
            className={`absolute inset-0 flex items-center justify-center ${
              result === 'correct' ? 'bg-green-500/90' :
              result === 'wrong' ? 'bg-orange-500/90' :
              result === 'neutral' ? 'bg-amber-500/90' :
              'bg-slate-900/95'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-white text-center">
              {getResultIcon()}
              <motion.p
                className="text-[10px] font-bold mt-1 uppercase tracking-wider"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {result === 'correct' ? 'CORRECTO' :
                 result === 'wrong' ? 'EQUIVOCADO' :
                 result === 'neutral' ? 'NEUTRAL' :
                 '¡ASESINO!'}
              </motion.p>
            </div>

            {/* Dramatic particles for assassin */}
            {result === 'assassin' && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-red-500 rounded-full"
                    initial={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: [1, 0],
                      scale: [0, 2, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GameCard({ card, index, isSpymaster, canGuess, onClick, lastReveal, isProposed }: GameCardProps) {
  const [revealStage, setRevealStage] = useState<'idle' | 'scanning' | 'decrypting' | 'revealing' | 'complete'>('idle');
  const [currentResult, setCurrentResult] = useState<CardRevealResult | null>(null);

  useEffect(() => {
    if (lastReveal && lastReveal.cardIndex === index) {
      setCurrentResult(lastReveal.result);
      setRevealStage('scanning');

      // Stage progression
      const t1 = setTimeout(() => setRevealStage('decrypting'), 600);
      const t2 = setTimeout(() => setRevealStage('revealing'), 1200);
      const t3 = setTimeout(() => setRevealStage('complete'), lastReveal.result === 'assassin' ? 3500 : 2200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [lastReveal, index]);

  const getCardStyles = () => {
    if (card.revealed) {
      switch (card.type) {
        case 'red':
          return 'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400 shadow-red-500/20';
        case 'blue':
          return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400 shadow-blue-500/20';
        case 'neutral':
          return 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 border-amber-300';
        case 'assassin':
          return 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-600 shadow-xl';
      }
    }

    if (isSpymaster) {
      switch (card.type) {
        case 'red':
          return 'bg-red-900/30 border-red-500/50 text-white hover:bg-red-900/40';
        case 'blue':
          return 'bg-blue-900/30 border-blue-500/50 text-white hover:bg-blue-900/40';
        case 'neutral':
          return 'bg-amber-900/20 border-amber-500/30 text-white hover:bg-amber-900/30';
        case 'assassin':
          return 'bg-slate-900/50 border-slate-500/50 text-white hover:bg-slate-900/60';
      }
    }

    // Default unrevealed card - spy document style
    return 'spy-card text-white border-amber-900/30 hover:border-amber-600/50';
  };

  const getSpymasterIndicator = () => {
    if (!isSpymaster || card.revealed) return null;

    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      neutral: 'bg-amber-400',
      assassin: 'bg-slate-900 border border-white',
    };

    return (
      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${colors[card.type]} shadow-lg`}></div>
    );
  };

  const canClick = canGuess && !card.revealed;
  const isRevealing = revealStage !== 'idle' && revealStage !== 'complete';

  return (
    <motion.button
      onClick={onClick}
      disabled={!canClick || isRevealing}
      whileHover={canClick && !isRevealing ? { scale: 1.03, y: -2 } : undefined}
      whileTap={canClick && !isRevealing ? { scale: 0.98 } : undefined}
      className={`
        game-card relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2]
        rounded-md sm:rounded-lg md:rounded-xl border sm:border-2
        flex items-center justify-center
        font-bold shadow-lg
        transition-all duration-200
        touch-feedback ripple
        ${getCardStyles()}
        ${canClick ? 'cursor-pointer' : 'cursor-default'}
        ${card.revealed ? 'opacity-90' : ''}
        ${isProposed ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900' : ''}
      `}
    >
      {getSpymasterIndicator()}

      {/* Word */}
      <span className={`
        text-center break-words leading-tight px-0.5 relative z-0
        ${card.revealed && card.type === 'assassin' ? 'line-through' : ''}
      `}
      style={{
        fontSize: 'clamp(0.5rem, 2.5vw, 0.875rem)',
        wordBreak: 'break-word',
        hyphens: 'auto',
      }}
      >
        {card.word}
      </span>

      {/* Proposed indicator */}
      {isProposed && !card.revealed && (
        <motion.div
          className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ?
        </motion.div>
      )}

      {/* Assassin icon when revealed */}
      {card.revealed && card.type === 'assassin' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
        >
          <span className="text-4xl">💀</span>
        </motion.div>
      )}

      {/* Dramatic reveal overlay */}
      <AnimatePresence>
        {isRevealing && currentResult && (
          <RevealOverlay
            stage={revealStage as 'scanning' | 'decrypting' | 'revealing'}
            result={currentResult}
            cardType={card.type}
          />
        )}
      </AnimatePresence>

      {/* Hover glow effect for unrevealed cards */}
      {!card.revealed && !isSpymaster && (
        <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-amber-500/10 to-transparent" />
        </div>
      )}
    </motion.button>
  );
}
