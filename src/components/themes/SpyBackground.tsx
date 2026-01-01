'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Spy/Detective themed background with classified document aesthetics
export function SpyBackground() {
  const [scannerPosition, setScannerPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScannerPosition(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      {/* Grid pattern - classified document feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Fingerprint watermark */}
      <div className="absolute top-10 right-10 w-32 h-32 opacity-[0.02]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-amber-500 w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
      </div>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
        style={{ top: `${scannerPosition}%` }}
      />

      {/* Corner brackets - classified document style */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-600/20" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-600/20" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-600/20" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-600/20" />

      {/* CLASSIFIED stamp watermark */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-[0.02] pointer-events-none">
        <div className="text-red-500 text-[8rem] font-black tracking-widest border-8 border-red-500 px-8 py-2">
          CLASSIFIED
        </div>
      </div>

      {/* Ambient particles - floating dust */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -20, 20],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Film grain effect */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Card reveal animation component for dramatic declassification
export function ClassifiedReveal({
  children,
  isRevealing,
  onComplete,
  cardType
}: {
  children: React.ReactNode;
  isRevealing: boolean;
  onComplete?: () => void;
  cardType?: 'red' | 'blue' | 'neutral' | 'assassin';
}) {
  const [stage, setStage] = useState<'idle' | 'scanning' | 'decrypting' | 'revealed'>('idle');

  useEffect(() => {
    if (isRevealing) {
      setStage('scanning');
      const t1 = setTimeout(() => setStage('decrypting'), 800);
      const t2 = setTimeout(() => {
        setStage('revealed');
        onComplete?.();
      }, 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setStage('idle');
    }
  }, [isRevealing, onComplete]);

  if (!isRevealing && stage === 'idle') return <>{children}</>;

  return (
    <div className="relative w-full h-full">
      {children}

      {/* Overlay during reveal */}
      {stage !== 'revealed' && (
        <motion.div
          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center overflow-hidden rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {stage === 'scanning' && (
            <>
              {/* Scanning animation */}
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 0.8, repeat: 1 }}
              />
              <motion.div
                className="text-amber-400 text-xs font-mono tracking-widest"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                SCANNING...
              </motion.div>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-amber-400/50"
                    animate={{ scaleY: [1, 2, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </>
          )}

          {stage === 'decrypting' && (
            <>
              {/* Decryption animation - redacted bars sliding away */}
              <div className="absolute inset-2 flex flex-col gap-1 justify-center">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2 bg-slate-700"
                    initial={{ scaleX: 1, x: 0 }}
                    animate={{
                      scaleX: 0,
                      x: i % 2 === 0 ? -100 : 100
                    }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
              <motion.div
                className="text-green-400 text-xs font-mono tracking-widest z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                DECLASSIFYING...
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Final reveal flash */}
      {stage === 'revealed' && (
        <motion.div
          className={`absolute inset-0 rounded-lg pointer-events-none ${
            cardType === 'red' ? 'bg-red-500' :
            cardType === 'blue' ? 'bg-blue-500' :
            cardType === 'assassin' ? 'bg-slate-900' :
            'bg-amber-400'
          }`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}
