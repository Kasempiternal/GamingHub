'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Vintage Circus themed background with tent stripes, spotlights, and stars
export function CircusBackground({ intensity = 'medium' }: { intensity?: 'low' | 'medium' | 'high' }) {
  const starCount = intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 40;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #1a0505 0%, #0d0303 100%)' }}>
      {/* Circus tent stripes pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="circus-stripes" x="0" y="0" width="80" height="100%" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="100%" fill="#dc2626" />
              <rect x="40" y="0" width="40" height="100%" fill="#f5f0e6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circus-stripes)" />
        </svg>
      </div>

      {/* Radial spotlight from top center */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px]"
        style={{
          background: 'conic-gradient(from 180deg, transparent 45%, rgba(251, 191, 36, 0.08) 48%, rgba(251, 191, 36, 0.15) 50%, rgba(251, 191, 36, 0.08) 52%, transparent 55%)',
        }}
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary spotlights */}
      <motion.div
        className="absolute top-0 left-1/4 w-[400px] h-[500px]"
        style={{
          background: 'conic-gradient(from 200deg, transparent 42%, rgba(168, 85, 247, 0.06) 47%, rgba(168, 85, 247, 0.12) 50%, rgba(168, 85, 247, 0.06) 53%, transparent 58%)',
        }}
        animate={{
          rotate: [-5, 15, -5],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-0 right-1/4 w-[400px] h-[500px]"
        style={{
          background: 'conic-gradient(from 160deg, transparent 42%, rgba(20, 184, 166, 0.06) 47%, rgba(20, 184, 166, 0.12) 50%, rgba(20, 184, 166, 0.06) 53%, transparent 58%)',
        }}
        animate={{
          rotate: [5, -15, 5],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating stars */}
      {[...Array(starCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-300/60"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        >
          ★
        </motion.div>
      ))}

      {/* Gold dust particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute w-1 h-1 rounded-full bg-amber-400/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Curtain drapes on sides */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-red-900/40 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-red-900/40 to-transparent" />

      {/* Top curtain valance */}
      <div className="absolute top-0 inset-x-0 h-8">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 10">
          <path
            d="M0,0 Q10,10 20,0 Q30,10 40,0 Q50,10 60,0 Q70,10 80,0 Q90,10 100,0 L100,0 L0,0 Z"
            fill="rgba(185, 28, 28, 0.4)"
          />
        </svg>
      </div>

      {/* Warm ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center 30%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10, 5, 5, 0.8) 100%)',
        }}
      />
    </div>
  );
}

// Confetti burst for celebrations
export function CircusConfetti({ isActive }: { isActive: boolean }) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        color: ['#dc2626', '#fbbf24', '#a855f7', '#14b8a6', '#f5f0e6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);

      const timer = setTimeout(() => setConfetti([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive && confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: 720 + Math.random() * 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random(),
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

// Spotlight effect for emphasis
export function Spotlight({ position, color = 'amber' }: { position: { x: number; y: number }; color?: 'amber' | 'purple' | 'teal' }) {
  const colors = {
    amber: 'rgba(251, 191, 36, 0.3)',
    purple: 'rgba(168, 85, 247, 0.3)',
    teal: 'rgba(20, 184, 166, 0.3)',
  };

  return (
    <motion.div
      className="absolute w-32 h-32 rounded-full pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// Score burst animation
export function ScoreBurst({ score, position }: { score: number; position: { x: number; y: number } }) {
  return (
    <motion.div
      className="absolute text-2xl font-bold text-amber-400 pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        textShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
      }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      +{score}
    </motion.div>
  );
}

// Curtain transition effect
export function CurtainTransition({ isClosing, onComplete }: { isClosing: boolean; onComplete?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Left curtain */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background: 'linear-gradient(to right, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: isClosing ? '0%' : '-100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        onAnimationComplete={() => !isClosing && onComplete?.()}
      >
        {/* Curtain texture */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 bg-gradient-to-r from-transparent via-red-900 to-transparent"
              style={{ left: `${i * 12.5}%`, width: '3px' }}
            />
          ))}
        </div>
      </motion.div>

      {/* Right curtain */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background: 'linear-gradient(to left, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: isClosing ? '0%' : '100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Curtain texture */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 bg-gradient-to-r from-transparent via-red-900 to-transparent"
              style={{ right: `${i * 12.5}%`, width: '3px' }}
            />
          ))}
        </div>
      </motion.div>

      {/* Center gold trim when closed */}
      {isClosing && (
        <motion.div
          className="absolute left-1/2 inset-y-0 w-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
      )}
    </div>
  );
}

// Decorative circus ring
export function CircusRing({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer gold ring */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 opacity-80" />
      {/* Inner dark ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-900 to-red-950" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
