'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AsesinatoRole } from '@/types/game';

interface TeamMember {
  name: string;
  role: 'murderer' | 'accomplice';
}

interface RoleRevealProps {
  role: AsesinatoRole | null;
  roleName: string;
  roleDescription: string;
  teamMembers?: TeamMember[];
  compact?: boolean;
}

export function RoleReveal({
  role,
  roleName,
  roleDescription,
  teamMembers,
  compact = false,
}: RoleRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const maxRevealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (isRevealed) {
      maxRevealTimeoutRef.current = setTimeout(() => {
        setIsRevealed(false);
      }, 5000);
    }

    return () => {
      if (maxRevealTimeoutRef.current) {
        clearTimeout(maxRevealTimeoutRef.current);
      }
    };
  }, [isRevealed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (maxRevealTimeoutRef.current) {
        clearTimeout(maxRevealTimeoutRef.current);
      }
    };
  }, []);

  const getRoleIcon = () => {
    switch (role) {
      case 'forensicScientist':
        return '🔬';
      case 'murderer':
        return '🔪';
      case 'accomplice':
        return '🤝';
      case 'witness':
        return '👁';
      case 'investigator':
        return '🔍';
      default:
        return '❓';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'forensicScientist':
        return 'from-cyan-600 to-cyan-900 border-cyan-500';
      case 'murderer':
        return 'from-red-600 to-red-900 border-red-500';
      case 'accomplice':
        return 'from-orange-600 to-orange-900 border-orange-500';
      case 'witness':
        return 'from-purple-600 to-purple-900 border-purple-500';
      case 'investigator':
        return 'from-blue-600 to-blue-900 border-blue-500';
      default:
        return 'from-slate-600 to-slate-900 border-slate-500';
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsRevealed(true);
  };

  const handlePointerUp = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  const handlePointerLeave = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  const handlePointerCancel = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  if (!role) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
        <p className="text-slate-400">Esperando asignacion de rol...</p>
      </div>
    );
  }

  // Compact mode for badge in header
  if (compact) {
    return (
      <motion.div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-600 cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'none' }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.span
                className="text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔒
              </motion.span>
              <span className="text-white/50 text-xs">Tu rol</span>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{getRoleIcon()}</span>
              <span className="text-white font-medium text-xs">{roleName}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Full mode for roleReveal phase
  // IMPORTANT: Use neutral color when hidden, only show role color when revealed
  const hiddenColor = 'from-slate-700 to-slate-900 border-slate-600';

  return (
    <div className="relative">
      <motion.div
        className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer select-none bg-gradient-to-br ${isRevealed ? getRoleColor() : hiddenColor}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'none' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-6 min-h-[200px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                {/* Hold icon */}
                <motion.div
                  className="text-5xl mb-4 opacity-60"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  👆
                </motion.div>
                <p className="text-white/70 font-medium mb-1">
                  Manten presionado
                </p>
                <p className="text-white/40 text-sm">
                  para ver tu rol
                </p>

                {/* Hold indicator ring */}
                <motion.div
                  className="mt-4 w-16 h-16 mx-auto border-2 border-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="text-center w-full"
              >
                {/* Role icon and name */}
                <motion.div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-black/40 mb-4"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <span className="text-3xl">{getRoleIcon()}</span>
                  <span className="font-bold text-white tracking-wider text-lg">
                    {roleName}
                  </span>
                </motion.div>

                {/* Role description */}
                <motion.p
                  className="text-white/70 text-sm max-w-xs mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {roleDescription}
                </motion.p>

                {/* Team members (for witness/criminals) */}
                {teamMembers && teamMembers.length > 0 && (
                  <motion.div
                    className="mt-4 p-3 rounded-xl bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-white/50 text-xs mb-2">
                      {role === 'witness' ? 'Viste a:' : 'Tu equipo:'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {teamMembers.map((member, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.role === 'murderer'
                              ? 'bg-red-800/50 text-red-300'
                              : 'bg-orange-800/50 text-orange-300'
                          }`}
                        >
                          {member.role === 'murderer' ? '🔪' : '🤝'} {member.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Release indicator */}
                <motion.p
                  className="mt-4 text-white/30 text-xs"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Suelta para ocultar
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
