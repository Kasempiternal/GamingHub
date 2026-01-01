'use client';

import { motion } from 'framer-motion';
import type { ImpostorPhase } from '@/types/game';

interface PhaseIndicatorProps {
  phase: ImpostorPhase;
  round: number;
  totalPlayers: number;
  remainingPlayers: number;
}

export function PhaseIndicator({ phase, round, totalPlayers, remainingPlayers }: PhaseIndicatorProps) {
  const getPhaseInfo = () => {
    switch (phase) {
      case 'lobby':
        return { label: 'Lobby', icon: '🎮', color: 'bg-slate-600' };
      case 'description':
        return { label: 'Descripcion', icon: '💬', color: 'bg-blue-600' };
      case 'discussion':
        return { label: 'Discusion', icon: '🗣️', color: 'bg-amber-600' };
      case 'voting':
        return { label: 'Votacion', icon: '🗳️', color: 'bg-red-600' };
      case 'reveal':
        return { label: 'Revelacion', icon: '🎭', color: 'bg-yellow-600' };
      case 'finished':
        return { label: 'Fin', icon: '🏆', color: 'bg-green-600' };
      default:
        return { label: 'Unknown', icon: '❓', color: 'bg-slate-600' };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700">
      <div className="flex items-center justify-between gap-4">
        {/* Phase badge */}
        <motion.div
          key={phase}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${phaseInfo.color} px-4 py-2 rounded-xl flex items-center gap-2`}
        >
          <motion.span
            className="text-xl"
            animate={{ rotate: phase === 'voting' ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: phase === 'voting' ? Infinity : 0 }}
          >
            {phaseInfo.icon}
          </motion.span>
          <span className="font-bold text-white">{phaseInfo.label}</span>
        </motion.div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {phase !== 'lobby' && (
            <div className="text-center">
              <p className="text-slate-400">Ronda</p>
              <p className="text-white font-bold text-lg">{round}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-slate-400">Jugadores</p>
            <p className="text-white font-bold text-lg">
              {remainingPlayers}/{totalPlayers}
            </p>
          </div>
        </div>
      </div>

      {/* Phase description */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-slate-400 text-sm mt-3"
      >
        {phase === 'lobby' && 'Esperando jugadores para comenzar...'}
        {phase === 'description' && 'Cada jugador describe su palabra sin revelarla'}
        {phase === 'discussion' && 'Discutan quien podria ser el impostor'}
        {phase === 'voting' && 'Voten por quien creen que es el impostor'}
        {phase === 'reveal' && 'Revelando el rol del jugador eliminado...'}
        {phase === 'finished' && 'El juego ha terminado'}
      </motion.p>
    </div>
  );
}
