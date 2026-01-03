'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Impostor / Deception themed background
export function ImpostorBackground() {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setEyePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0d0d0d]">
      {/* Warning stripes pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(239, 68, 68, 0.5) 20px,
            rgba(239, 68, 68, 0.5) 40px
          )`,
        }}
      />

      {/* Surveillance grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating suspicious eyes */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          initial={{
            x: `${20 + Math.random() * 60}%`,
            y: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 0.1, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.5,
          }}
        >
          <div className="relative w-12 h-6">
            {/* Eye shape */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full transform scale-x-150" />
            {/* Pupil */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500/40 rounded-full"
              style={{
                transform: `translate(${-50 + eyePosition.x}%, ${-50 + eyePosition.y}%)`,
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* Spotlight sweep */}
      <motion.div
        className="absolute w-96 h-[200%] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)',
          transformOrigin: 'top center',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Ambient red glow corners */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />

      {/* Emergency alert bars (subtle) */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          delay: 1.5,
        }}
      />

      {/* Glitch effect overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        animate={{
          backgroundPosition: ['0 0', '100% 100%'],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.015,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(13,13,13,0.8) 100%)',
        }}
      />
    </div>
  );
}

// Emergency meeting animation
export function EmergencyMeeting({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  const [stage, setStage] = useState<'idle' | 'alarm' | 'zoom' | 'text'>('idle');

  useEffect(() => {
    if (isActive) {
      setStage('alarm');
      const t1 = setTimeout(() => setStage('zoom'), 800);
      const t2 = setTimeout(() => setStage('text'), 1800);
      const t3 = setTimeout(() => {
        setStage('idle');
        onComplete?.();
      }, 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isActive, onComplete]);

  if (!isActive && stage === 'idle') return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Flashing red background */}
      <motion.div
        className="absolute inset-0 bg-red-600"
        animate={{
          opacity: stage === 'alarm' ? [0, 1, 0, 1, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Emergency button zoom in */}
      {stage === 'zoom' && (
        <motion.div
          initial={{ scale: 10, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center border-8 border-red-800 shadow-2xl"
        >
          <span className="text-4xl">🚨</span>
        </motion.div>
      )}

      {/* Emergency text */}
      {stage === 'text' && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-black text-red-500 tracking-widest"
            animate={{
              textShadow: [
                '0 0 20px rgba(239,68,68,0.5)',
                '0 0 60px rgba(239,68,68,0.8)',
                '0 0 20px rgba(239,68,68,0.5)',
              ],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            VOTACIÓN
          </motion.h1>
          <motion.p
            className="text-white text-xl mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ¿Quién es el impostor?
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Suspicious indicator that follows a player
export function SuspicionIndicator({ suspicionLevel }: { suspicionLevel: number }) {
  // 0-100 scale
  const isHighSuspicion = suspicionLevel > 60;

  return (
    <div className="relative">
      {/* Suspicion meter */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isHighSuspicion ? 'bg-red-500' : 'bg-amber-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${suspicionLevel}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Glowing effect for high suspicion */}
      {isHighSuspicion && (
        <motion.div
          className="absolute -inset-1 bg-red-500/20 rounded-lg blur-md -z-10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Vote reveal animation
export function VoteReveal({
  votes,
  eliminatedPlayer,
  onComplete,
}: {
  votes: { voter: string; target: string }[];
  eliminatedPlayer?: { name: string; role: 'impostor' | 'civilian' | 'mr-white' };
  onComplete?: () => void;
}) {
  const [showingVote, setShowingVote] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (showingVote < votes.length - 1) {
      timeout = setTimeout(() => {
        setShowingVote(prev => prev + 1);
      }, 800);
    } else if (!showResult && eliminatedPlayer) {
      timeout = setTimeout(() => setShowResult(true), 1000);
    } else if (showResult) {
      timeout = setTimeout(() => onComplete?.(), 3000);
    }

    return () => clearTimeout(timeout);
  }, [showingVote, showResult, votes.length, eliminatedPlayer, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {!showResult ? (
        <div className="text-center space-y-4 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-8">Revelando votos...</h2>
          <div className="space-y-2">
            {votes.slice(0, showingVote + 1).map((vote, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2"
              >
                <span className="text-white">{vote.voter}</span>
                <span className="text-red-400">→</span>
                <span className="text-red-400 font-bold">{vote.target}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          {eliminatedPlayer ? (
            <>
              <motion.div
                className="text-8xl mb-4"
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  y: [0, -20, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                {eliminatedPlayer.role === 'impostor' ? '🎭' : '😢'}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {eliminatedPlayer.name}
              </h2>
              <p className={`text-xl ${
                eliminatedPlayer.role === 'impostor' ? 'text-red-400' :
                eliminatedPlayer.role === 'mr-white' ? 'text-gray-400' :
                'text-green-400'
              }`}>
                {eliminatedPlayer.role === 'impostor' ? '¡Era el Impostor!' :
                 eliminatedPlayer.role === 'mr-white' ? '¡Era Mr. White!' :
                 'Era un Civil inocente...'}
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-4">🤔</div>
              <h2 className="text-2xl font-bold text-white">Empate</h2>
              <p className="text-slate-400">Nadie fue eliminado</p>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Ejection animation (Among Us style)
export function EjectionAnimation({
  playerName,
  wasImpostor,
  onComplete,
}: {
  playerName: string;
  wasImpostor: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => onComplete?.(), 4000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0a0a12] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              delay: Math.random(),
            }}
          />
        ))}
      </div>

      {/* Ejected player floating away */}
      <motion.div
        className="text-8xl"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: [0, 50, 150, 400],
          y: [0, -50, -20, 100],
          rotate: [0, 45, 180, 360],
          scale: [1, 1.2, 0.8, 0.3],
          opacity: [1, 1, 1, 0],
        }}
        transition={{
          duration: 3,
          ease: 'easeOut',
        }}
      >
        👤
      </motion.div>

      {/* Text reveal */}
      <motion.div
        className="absolute bottom-1/3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {playerName} fue expulsado.
        </h2>
        <motion.p
          className={`text-xl ${wasImpostor ? 'text-red-400' : 'text-slate-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          {wasImpostor ? '¡Era un Impostor!' : 'No era un Impostor.'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
