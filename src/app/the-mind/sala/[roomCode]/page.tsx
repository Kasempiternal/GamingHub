'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheMind } from '@/hooks/useTheMind';
import {
  PlayerHand,
  LevelIndicator,
  LivesDisplay,
  ShurikenButton,
  PlayedPile,
  PlayerList,
  RulesModal,
  HelpButton,
  QRCode,
} from '@/components/the-mind';
import { TelepathyBackground, SyncPulse } from '@/components/themes';
import type { TheMindPlayer } from '@/types/game';

export default function TheMindRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const [showRules, setShowRules] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [cardPlayedNotification, setCardPlayedNotification] = useState<{playerName: string; cardValue: number} | null>(null);

  // Track which conflicts we've already shown to avoid re-triggering
  const shownConflictsRef = useRef<string>('');
  const lastPlayedCardRef = useRef<number | null>(null);

  const {
    game,
    playerId,
    loading,
    startGame,
    playerReady,
    playCard,
    nextLevel,
    proposeShuriken,
    cancelShuriken,
    resetGame,
  } = useTheMind();

  // Rejoin on mount
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('theMindPlayerId');
    const storedRoomCode = sessionStorage.getItem('theMindRoomCode');

    if (!storedPlayerId || storedRoomCode !== roomCode) {
      router.push(`/the-mind/unirse/${roomCode}`);
    }
  }, [roomCode, router]);

  // Handle conflict animation - only show once per unique conflict
  useEffect(() => {
    if (game?.conflictCards && game.conflictCards.length > 0) {
      const conflictKey = game.conflictCards.sort().join(',');
      if (shownConflictsRef.current !== conflictKey) {
        shownConflictsRef.current = conflictKey;
        setShowConflict(true);
        const timer = setTimeout(() => setShowConflict(false), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset when conflicts are cleared (new level)
      shownConflictsRef.current = '';
    }
  }, [game?.conflictCards]);

  // Handle card played notification
  useEffect(() => {
    if (game?.lastPlayedCard && game.lastPlayedBy && game.phase === 'playing') {
      // Only show if this is a new card played
      if (lastPlayedCardRef.current !== game.lastPlayedCard) {
        lastPlayedCardRef.current = game.lastPlayedCard;
        const player = game.players.find(p => p.id === game.lastPlayedBy);
        if (player) {
          setCardPlayedNotification({
            playerName: player.name,
            cardValue: game.lastPlayedCard,
          });
          const timer = setTimeout(() => setCardPlayedNotification(null), 2000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [game?.lastPlayedCard, game?.lastPlayedBy, game?.phase, game?.players]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = game.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const myCards = currentPlayer?.cards || [];
  const canPlay = game.phase === 'playing' && myCards.length > 0;
  const canPropose = game.phase === 'playing' && myCards.length > 0 && game.shurikens > 0;
  const playersWithCards = game.players.filter(p => p.cards.some(c => c !== 0));

  const handlePlayCard = async (value: number) => {
    await playCard(value);
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 safe-area-top safe-area-bottom">
      <TelepathyBackground intensity={game.phase === 'playing' ? 'high' : 'medium'} />
      <SyncPulse isActive={showSync} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/the-mind" className="text-slate-400">
          ← Salir
        </Link>
        <div className="text-center">
          <div className="text-slate-500 text-xs">Sala</div>
          <div className="text-white font-mono text-lg">{game.roomCode}</div>
        </div>
        <div className="w-12" />
      </div>

      {/* Lobby phase */}
      {game.phase === 'lobby' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            className="text-6xl mb-4 relative"
            animate={{
              boxShadow: [
                '0 0 20px rgba(14, 165, 233, 0.3)',
                '0 0 40px rgba(14, 165, 233, 0.5)',
                '0 0 20px rgba(14, 165, 233, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🧠
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-2">The Mind</h2>
          <p className="text-sky-400/60 mb-6">Esperando conexion mental...</p>

          {/* Players */}
          <div className="w-full max-w-sm mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-sky-500/20">
              <div className="text-sky-400/60 text-sm mb-3 uppercase tracking-wider">
                Mentes Conectadas ({game.players.length}/4)
              </div>
              <div className="space-y-2">
                {game.players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      player.id === playerId ? 'bg-sky-500/20 border border-sky-500/30' : 'bg-slate-700/50'
                    }`}
                  >
                    <span className="text-white flex items-center gap-2">
                      <span className="text-sky-400">∿</span>
                      {player.name}
                      {player.isHost && ' 👑'}
                      {player.id === playerId && ' (Tu)'}
                    </span>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="w-full max-w-sm mb-6">
            <QRCode roomCode={game.roomCode} />
          </div>

          {/* Start button */}
          {isHost && game.players.length >= 2 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold text-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Sincronizar Mentes
            </motion.button>
          )}

          {isHost && game.players.length < 2 && (
            <p className="text-amber-400 text-sm">
              Se necesitan al menos 2 mentes conectadas
            </p>
          )}

          {!isHost && (
            <p className="text-sky-400/60 text-sm">
              Esperando al host para iniciar la sincronizacion...
            </p>
          )}
        </motion.div>
      )}

      {/* Dealing phase */}
      {game.phase === 'dealing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-6"
          >
            🃏
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Nivel {game.currentLevel}
          </h2>
          <p className="text-slate-400 mb-6">
            Repartiendo {game.currentLevel} {game.currentLevel === 1 ? 'carta' : 'cartas'}...
          </p>

          {/* Ready button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={playerReady}
            disabled={currentPlayer?.isReady}
            className={`px-8 py-4 rounded-xl font-bold text-lg ${
              currentPlayer?.isReady
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white'
            }`}
          >
            {currentPlayer?.isReady ? '✓ Listo' : 'Estoy listo'}
          </motion.button>

          {/* Ready status */}
          <div className="mt-4 text-slate-400 text-sm">
            {game.players.filter(p => p.isReady).length} / {game.players.length} listos
          </div>
        </motion.div>
      )}

      {/* Playing phase */}
      {game.phase === 'playing' && (
        <div className="flex-1 flex flex-col">
          {/* Top bar: Level, Lives, Shurikens */}
          <div className="mb-4">
            <LevelIndicator
              currentLevel={game.currentLevel}
              maxLevel={game.maxLevel}
              lifeRewardLevels={game.lifeRewardLevels}
              shurikenRewardLevels={game.shurikenRewardLevels}
            />
          </div>

          <div className="flex justify-between items-start mb-4">
            <LivesDisplay lives={game.lives} maxLives={game.maxLives} />
          </div>

          {/* Players */}
          <div className="mb-4">
            <PlayerList players={game.players} currentPlayerId={playerId} />
          </div>

          {/* Center: Played pile */}
          <div className="flex-1 flex items-center justify-center">
            <PlayedPile
              cards={game.playedCards}
              lastPlayedCard={game.lastPlayedCard}
              conflictCards={game.conflictCards}
            />
          </div>

          {/* Shuriken button */}
          <div className="my-4">
            <ShurikenButton
              shurikens={game.shurikens}
              maxShurikens={game.maxShurikens}
              isProposing={currentPlayer?.isProposingStar || false}
              proposerCount={game.shurikenProposers.length}
              totalPlayers={playersWithCards.length}
              players={game.players}
              canPropose={canPropose}
              onPropose={proposeShuriken}
              onCancel={cancelShuriken}
            />
          </div>

          {/* Bottom: My cards */}
          <div className="border-t border-slate-700 pt-4">
            <div className="text-center text-slate-400 text-sm mb-2">Tus cartas</div>
            <PlayerHand
              cards={myCards}
              canPlay={canPlay}
              onPlayCard={handlePlayCard}
            />
          </div>
        </div>
      )}

      {/* Level Complete */}
      {game.phase === 'levelComplete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Nivel {game.currentLevel} Completado!
          </h2>
          <p className="text-slate-400 mb-6">
            Gran trabajo equipo!
          </p>

          {/* Rewards */}
          {(game.lifeRewardLevels.includes(game.currentLevel) ||
            game.shurikenRewardLevels.includes(game.currentLevel)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <p className="text-amber-400 mb-2">Recompensa:</p>
              <div className="flex gap-4 justify-center">
                {game.lifeRewardLevels.includes(game.currentLevel) && (
                  <span className="text-2xl">+1 ❤️</span>
                )}
                {game.shurikenRewardLevels.includes(game.currentLevel) && (
                  <span className="text-2xl">+1 ⭐</span>
                )}
              </div>
            </motion.div>
          )}

          {isHost && game.currentLevel < game.maxLevel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextLevel}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold text-lg"
            >
              Siguiente Nivel
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Game Won */}
      {game.phase === 'gameWon' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-8xl mb-4"
          >
            🏆
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-2">Victoria!</h2>
          <p className="text-emerald-400 text-xl mb-6">
            Completaron todos los {game.maxLevel} niveles!
          </p>

          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold"
            >
              Jugar de nuevo
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Game Lost */}
      {game.phase === 'gameLost' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            💔
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Fin del juego</h2>
          <p className="text-red-400 mb-2">Sin vidas restantes</p>
          <p className="text-slate-400 mb-6">
            Llegaron al nivel {game.currentLevel}
          </p>

          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold"
            >
              Intentar de nuevo
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Card played notification */}
      <AnimatePresence>
        {cardPlayedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-slate-800/90 backdrop-blur-sm border border-sky-500/30 rounded-2xl px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-14 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {cardPlayedNotification.cardValue}
                </motion.div>
                <div>
                  <p className="text-sky-300 font-medium">{cardPlayedNotification.playerName}</p>
                  <p className="text-slate-400 text-sm">ha jugado <span className="text-white font-bold">{cardPlayedNotification.cardValue}</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict overlay */}
      <AnimatePresence>
        {showConflict && game.conflictCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, repeat: 2 }}
                className="text-8xl mb-4"
              >
                💥
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Error!</h2>
              <p className="text-red-300 mb-4">
                Cartas mas bajas descartadas:
              </p>
              <div className="flex gap-2 justify-center">
                {game.conflictCards.map(card => (
                  <div
                    key={card}
                    className="w-12 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold"
                  >
                    {card}
                  </div>
                ))}
              </div>
              <p className="text-white mt-4">-1 ❤️</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help button */}
      <HelpButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
