'use client';

import { motion } from 'framer-motion';
import type { WavelengthRound, WavelengthTeam } from '@/types/game';

interface GuessRevealProps {
  round: WavelengthRound;
  currentTeam: WavelengthTeam;
  myTeam: WavelengthTeam | null;
}

export function GuessReveal({ round, currentTeam, myTeam }: GuessRevealProps) {
  const { targetPosition, teamGuess, pointsAwarded, counterGuess, counterPointAwarded } = round;

  // Calculate distance
  const distance = teamGuess !== null ? Math.abs(targetPosition - teamGuess) : 0;

  // Is this MY team's result?
  const isMyTeamResult = myTeam === currentTeam;

  // Get result message - contextualized based on whether it's your team or not
  const getResultMessage = () => {
    if (pointsAwarded === 4) return isMyTeamResult ? '¡PERFECTO! 🎯' : '¡Acertaron!';
    if (pointsAwarded === 3) return isMyTeamResult ? '¡MUY CERCA! 🔥' : 'Estuvieron cerca';
    if (pointsAwarded === 2) return isMyTeamResult ? '¡BIEN! 👍' : 'No está mal';
    return isMyTeamResult ? '¡FALLASTE! 😅' : '¡Fallaron!';
  };

  // Get result color
  const getResultColor = () => {
    if (pointsAwarded === 4) return 'text-green-400';
    if (pointsAwarded === 3) return 'text-orange-400';
    if (pointsAwarded === 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get team color
  const teamColor = currentTeam === 'red' ? 'text-red-400' : 'text-blue-400';
  const opposingTeam = currentTeam === 'red' ? 'Azul' : 'Rojo';
  const opposingTeamColor = currentTeam === 'red' ? 'text-blue-400' : 'text-red-400';

  // Team label for context
  const teamLabel = isMyTeamResult
    ? 'Tu equipo:'
    : `Equipo ${currentTeam === 'red' ? 'Rojo' : 'Azul'}:`;

  return (
    <div className="space-y-6 text-center">
      {/* Team context label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-medium ${isMyTeamResult ? 'text-cyan-400' : 'text-white/60'}`}
      >
        {teamLabel}
      </motion.div>

      {/* Main result */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <h2 className={`text-4xl font-bold ${getResultColor()}`}>
          {getResultMessage()}
        </h2>
      </motion.div>

      {/* Position comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="flex justify-center items-center gap-4">
          <div className="text-center">
            <div className="text-white/60 text-sm">Objetivo</div>
            <div className="text-2xl font-bold text-white">{targetPosition}</div>
          </div>
          <div className="text-white/40">vs</div>
          <div className="text-center">
            <div className="text-white/60 text-sm">Respuesta</div>
            <div className={`text-2xl font-bold ${teamColor}`}>{teamGuess}</div>
          </div>
        </div>
        <div className="text-white/50 text-sm">
          Diferencia: {distance} puntos
        </div>
      </motion.div>

      {/* Points awarded */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {/* Team points */}
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
          currentTeam === 'red' ? 'bg-red-500/20' : 'bg-blue-500/20'
        }`}>
          <span className={`text-lg ${teamColor}`}>
            Equipo {currentTeam === 'red' ? 'Rojo' : 'Azul'}:
          </span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className={`text-3xl font-bold ${getResultColor()}`}
          >
            +{pointsAwarded}
          </motion.span>
        </div>

        {/* Counter guess result */}
        {counterGuess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              currentTeam === 'red' ? 'bg-blue-500/20' : 'bg-red-500/20'
            }`}
          >
            <span className={`text-sm ${opposingTeamColor}`}>
              Equipo {opposingTeam} ({counterGuess === 'left' ? '←' : '→'}):
            </span>
            {counterPointAwarded ? (
              <span className="text-lg font-bold text-green-400">+1</span>
            ) : (
              <span className="text-lg font-bold text-red-400">+0</span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Visual feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        {pointsAwarded === 4 && (
          <div className="text-6xl">🎯</div>
        )}
        {pointsAwarded === 3 && (
          <div className="text-6xl">🔥</div>
        )}
        {pointsAwarded === 2 && (
          <div className="text-6xl">👍</div>
        )}
        {pointsAwarded === 0 && (
          <div className="text-6xl">😅</div>
        )}
      </motion.div>
    </div>
  );
}
