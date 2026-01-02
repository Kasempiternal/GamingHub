'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpostor } from '@/hooks/useImpostor';
import {
  WordReveal,
  PlayerCard,
  RevealAnimation,
  PhaseIndicator,
  RulesModal,
  RulesButton,
  QRCode,
} from '@/components/impostor';
import { ImpostorBackground, EmergencyMeeting } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import type { ImpostorPlayer } from '@/types/game';

export default function ImpostorRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);
  const [revealingPlayer, setRevealingPlayer] = useState<ImpostorPlayer | null>(null);
  const [showEmergencyMeeting, setShowEmergencyMeeting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('impostorPlayerId');
    if (stored) {
      setPlayerId(stored);
    } else {
      router.push(`/impostor/unirse/${roomCode}`);
    }
  }, [roomCode, router]);

  const {
    game,
    player,
    loading,
    error,
    isHost,
    isMyTurn,
    startGame,
    giveDescription,
    startVoting,
    vote,
    nextRound,
    resetGame,
  } = useImpostor(roomCode, playerId);

  // Handle reveal animation when player is eliminated
  useEffect(() => {
    if (game?.phase === 'reveal' && game.revealingPlayer && !showRevealAnimation) {
      const eliminatedPlayer = game.players.find(p => p.id === game.revealingPlayer);
      if (eliminatedPlayer) {
        setRevealingPlayer(eliminatedPlayer);
        setShowRevealAnimation(true);
      }
    }
  }, [game?.phase, game?.revealingPlayer, game?.players, showRevealAnimation]);

  // Handle emergency meeting animation when voting starts
  useEffect(() => {
    if (game?.phase === 'voting') {
      setShowEmergencyMeeting(true);
    }
  }, [game?.phase]);

  if (loading || !playerId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎭
          </motion.div>
          <p className="text-slate-400">Cargando partida...</p>
        </div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-400 mb-6">{error || 'Partida no encontrada'}</p>
          <Link
            href="/impostor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const activePlayers = game.players.filter(p => !p.isEliminated);
  const currentSpeaker = game.players.find(p => p.id === game.currentSpeaker);

  return (
    <main className="min-h-screen pb-20 safe-area-top safe-area-bottom relative overflow-hidden">
      <ImpostorBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="impostor" roomCode={roomCode} />

      {/* Emergency Meeting Animation */}
      <EmergencyMeeting
        isActive={showEmergencyMeeting}
        onComplete={() => setShowEmergencyMeeting(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/impostor"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </Link>

          <div className="text-center">
            <p className="text-xs text-slate-400">Sala</p>
            <p className="font-mono font-bold text-red-400 tracking-wider">{roomCode}</p>
          </div>

          <button
            onClick={() => setShowRules(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Phase Indicator */}
        <PhaseIndicator
          phase={game.phase}
          round={game.currentRound}
          totalPlayers={game.players.length}
          remainingPlayers={activePlayers.length}
        />

        {/* LOBBY PHASE */}
        {game.phase === 'lobby' && (
          <div className="space-y-4">
            {/* QR Code for sharing */}
            <QRCode roomCode={roomCode} />

            {/* Players list */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>👥</span>
                Jugadores ({game.players.length}/15)
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {game.players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isMe={p.id === playerId}
                    isSpeaking={false}
                    phase={game.phase}
                  />
                ))}
              </div>

              {game.players.length < 3 && (
                <p className="text-yellow-400 text-sm mt-4 text-center">
                  Se necesitan al menos 3 jugadores para comenzar
                </p>
              )}
            </div>

            {/* Start game button (host only) */}
            {isHost && (
              <motion.button
                onClick={startGame}
                disabled={game.players.length < 3}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: game.players.length >= 3 ? 1.02 : 1 }}
                whileTap={{ scale: game.players.length >= 3 ? 0.98 : 1 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🎮</span>
                  Iniciar Partida
                </span>
              </motion.button>
            )}

            {!isHost && (
              <div className="text-center text-slate-400 py-4">
                Esperando a que el host inicie la partida...
              </div>
            )}
          </div>
        )}

        {/* DESCRIPTION PHASE */}
        {game.phase === 'description' && (
          <div className="space-y-4">
            {/* My word */}
            <WordReveal
              word={player?.word || null}
              hint={player?.hint || null}
              role={player?.role || null}
              category={game.currentWordPair?.category}
            />

            {/* Current speaker */}
            {currentSpeaker && (
              <motion.div
                className="bg-blue-500/20 border-2 border-blue-500 rounded-2xl p-4 text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="text-blue-300 text-sm mb-2">Turno de describir:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{currentSpeaker.avatar}</span>
                  <span className="text-xl font-bold text-white">{currentSpeaker.name}</span>
                  {currentSpeaker.id === playerId && (
                    <span className="text-yellow-400">(Tu)</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* My turn to describe */}
            {isMyTurn && !player?.hasDescribed && (
              <motion.button
                onClick={giveDescription}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>✅</span>
                  Ya describi mi palabra
                </span>
              </motion.button>
            )}

            {/* Players grid */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Orden de descripcion</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {game.speakerOrder.map((speakerId, index) => {
                  const p = game.players.find(pl => pl.id === speakerId);
                  if (!p) return null;
                  return (
                    <div key={p.id} className="relative">
                      <PlayerCard
                        player={p}
                        isMe={p.id === playerId}
                        isSpeaking={game.currentSpeaker === p.id}
                        phase={game.phase}
                      />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DISCUSSION PHASE */}
        {game.phase === 'discussion' && (
          <div className="space-y-4">
            <motion.div
              className="bg-amber-500/20 border-2 border-amber-500 rounded-2xl p-6 text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-5xl mb-4 block">🗣️</span>
              <h2 className="text-2xl font-bold text-white mb-2">Discusion</h2>
              <p className="text-amber-200">
                Discutan quien podria ser el impostor basandose en las descripciones
              </p>
            </motion.div>

            {/* My word reminder */}
            <WordReveal
              word={player?.word || null}
              hint={player?.hint || null}
              role={player?.role || null}
              category={game.currentWordPair?.category}
            />

            {/* Players */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {activePlayers.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isMe={p.id === playerId}
                    isSpeaking={false}
                    phase={game.phase}
                  />
                ))}
              </div>
            </div>

            {/* Start voting button (host only) */}
            {isHost && (
              <motion.button
                onClick={startVoting}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🗳️</span>
                  Iniciar Votacion
                </span>
              </motion.button>
            )}

            {!isHost && (
              <div className="text-center text-slate-400 py-4">
                El host iniciara la votacion cuando esten listos...
              </div>
            )}
          </div>
        )}

        {/* VOTING PHASE */}
        {game.phase === 'voting' && (
          <div className="space-y-4">
            <motion.div
              className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-4 text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-4xl mb-2 block">🗳️</span>
              <h2 className="text-xl font-bold text-white mb-1">Votacion</h2>
              <p className="text-red-200 text-sm">
                {player?.hasVoted
                  ? 'Esperando a los demas...'
                  : 'Selecciona a quien quieres eliminar'}
              </p>
            </motion.div>

            {/* Voting grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activePlayers
                .filter(p => p.id !== playerId)
                .map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isMe={false}
                    isSpeaking={false}
                    phase={game.phase}
                    votesReceived={game.votingResults[p.id] || 0}
                    canVote={!player?.hasVoted && !player?.isEliminated}
                    hasVoted={player?.hasVoted || false}
                    onVote={() => vote(p.id)}
                  />
                ))}
            </div>

            {/* Vote status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-center text-slate-300">
                Votos: {activePlayers.filter(p => p.hasVoted).length}/{activePlayers.length}
              </p>
            </div>
          </div>
        )}

        {/* REVEAL PHASE */}
        {game.phase === 'reveal' && !showRevealAnimation && (
          <div className="space-y-4">
            <motion.div
              className="bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-6 text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-5xl mb-4 block">🎭</span>
              <h2 className="text-2xl font-bold text-white mb-2">
                {game.winner ? '¡Juego Terminado!' : 'Resultado de la Votacion'}
              </h2>

              {game.lastKickedPlayer && (
                <div className="mt-4">
                  {(() => {
                    const kicked = game.players.find(p => p.id === game.lastKickedPlayer);
                    if (!kicked) return null;
                    return (
                      <div className="inline-flex flex-col items-center gap-2 bg-black/30 rounded-xl p-4">
                        <span className="text-5xl">{kicked.avatar}</span>
                        <span className="text-xl font-bold text-white">{kicked.name}</span>
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-bold
                          ${kicked.role === 'impostor' ? 'bg-red-500 text-white' :
                            kicked.role === 'mr-white' ? 'bg-gray-400 text-black' :
                            'bg-green-500 text-white'}
                        `}>
                          {kicked.role === 'impostor' ? '🕵️ Impostor' :
                           kicked.role === 'mr-white' ? '👻 Mr. White' :
                           '👤 Civil'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {game.winner && (
                <div className="mt-6">
                  <p className={`text-2xl font-bold ${
                    game.winner === 'civilians' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.winner === 'civilians' ? '👤 Civiles Ganan!' : '🕵️ Impostores Ganan!'}
                  </p>
                  <p className="text-slate-300 mt-2">{game.winReason}</p>
                </div>
              )}
            </motion.div>

            {/* All players with roles revealed */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Todos los roles</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {game.players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isMe={p.id === playerId}
                    isSpeaking={false}
                    phase={game.phase}
                    showRole={true}
                  />
                ))}
              </div>
            </div>

            {/* Next round or reset */}
            {isHost && !game.winner && (
              <motion.button
                onClick={nextRound}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>➡️</span>
                  Siguiente Ronda
                </span>
              </motion.button>
            )}

            {isHost && game.winner && (
              <motion.button
                onClick={resetGame}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🔄</span>
                  Nueva Partida
                </span>
              </motion.button>
            )}
          </div>
        )}

        {/* FINISHED PHASE */}
        {game.phase === 'finished' && (
          <div className="space-y-4">
            <motion.div
              className={`
                rounded-2xl p-6 text-center border-2
                ${game.winner === 'civilians'
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-red-500/20 border-red-500'}
              `}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.span
                className="text-6xl mb-4 block"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆
              </motion.span>
              <h2 className="text-3xl font-bold text-white mb-2">
                {game.winner === 'civilians' ? '👤 Civiles Ganan!' : '🕵️ Impostores Ganan!'}
              </h2>
              <p className="text-slate-300">{game.winReason}</p>
            </motion.div>

            {/* Final scores */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-center">Resultado Final</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {game.players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isMe={p.id === playerId}
                    isSpeaking={false}
                    phase={game.phase}
                    showRole={true}
                  />
                ))}
              </div>
            </div>

            {/* New game button (host only) */}
            {isHost && (
              <motion.button
                onClick={resetGame}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🔄</span>
                  Nueva Partida
                </span>
              </motion.button>
            )}

            {!isHost && (
              <div className="text-center text-slate-400 py-4">
                Esperando a que el host inicie una nueva partida...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reveal Animation Overlay */}
      <AnimatePresence>
        {showRevealAnimation && revealingPlayer && (
          <RevealAnimation
            player={revealingPlayer}
            onComplete={() => setShowRevealAnimation(false)}
          />
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
