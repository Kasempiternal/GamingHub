'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimesUp } from '@/hooks/useTimesUp';
import { TimesUpBackground, TimesUpExplosion } from '@/components/themes';
import {
  CardDisplay,
  Timer,
  TeamPanel,
  TeamSelector,
  RoundIndicator,
  ScoreBoard,
  QRCode,
  RulesModal,
  RulesButton,
} from '@/components/times-up';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { LeaveGameDialog } from '@/components/shared/LeaveGameDialog';
import { TIMESUP_CONFIG } from '@/types/game';

export default function TimesUpRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Get player info from session storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('timesUpPlayerId');
    const storedPlayerName = sessionStorage.getItem('timesUpPlayerName');
    const storedRoomCode = sessionStorage.getItem('timesUpRoomCode');

    if (!storedPlayerId || storedRoomCode !== roomCode) {
      router.push(`/times-up/unirse/${roomCode}`);
      return;
    }

    setPlayerId(storedPlayerId);
    setPlayerName(storedPlayerName);
  }, [roomCode, router]);

  const {
    game,
    player,
    loading,
    error,
    isHost,
    isMyTurn,
    currentCard,
    timeRemaining,
    setTeam,
    startGame,
    startTurn,
    guessCorrect,
    skipCard,
    endTurn,
    nextRound,
    resetGame,
  } = useTimesUp(roomCode, playerId);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Track when time runs out to show animation
  useEffect(() => {
    if (game?.currentTurn?.isActive && timeRemaining === 0) {
      setShowTimesUp(true);
    }
  }, [game?.currentTurn?.isActive, timeRemaining]);

  // Loading state
  if (loading || !playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TimesUpBackground />
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Cargando partida...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <TimesUpBackground />
        <div className="text-center">
          <div className="text-6xl mb-4">&#9888;&#65039;</div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/times-up')}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!game) return null;

  // Derived state
  const orangePlayers = game.players.filter(p => p.team === 'orange');
  const bluePlayers = game.players.filter(p => p.team === 'blue');
  const currentTurnPlayer = game.currentTurn
    ? game.players.find(p => p.id === game.currentTurn?.playerId)
    : null;
  const isPlayingPhase = game.phase === 'round1' || game.phase === 'round2' || game.phase === 'round3';
  const currentRoundNumber = game.phase === 'round1' ? 1 : game.phase === 'round2' ? 2 : game.phase === 'round3' ? 3 : 0;

  // Check if game can start
  const canStartGame = orangePlayers.length >= TIMESUP_CONFIG.minPlayersPerTeam &&
    bluePlayers.length >= TIMESUP_CONFIG.minPlayersPerTeam;

  // Handle team selection
  const handleSelectTeam = async (team: 'orange' | 'blue') => {
    try {
      await setTeam(team);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle start game
  const handleStartGame = async () => {
    try {
      await startGame();
      showToast('Juego iniciado!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle start turn
  const handleStartTurn = async () => {
    try {
      await startTurn();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle correct guess
  const handleGuessCorrect = async () => {
    try {
      await guessCorrect();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle skip card
  const handleSkipCard = async () => {
    try {
      await skipCard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle end turn
  const handleEndTurn = async () => {
    try {
      await endTurn();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle next round
  const handleNextRound = async () => {
    try {
      await nextRound();
      showToast('Siguiente ronda!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Handle reset game
  const handleResetGame = async () => {
    try {
      await resetGame();
      showToast('Nueva partida!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 safe-area-top safe-area-bottom">
      <TimesUpBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="times-up" roomCode={roomCode} />

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              fixed top-20 left-1/2 -translate-x-1/2 z-50
              px-6 py-3 rounded-xl shadow-lg
              ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-orange-500'}
              text-white font-medium
            `}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Times Up explosion animation */}
      <TimesUpExplosion
        isActive={showTimesUp}
        onComplete={() => setShowTimesUp(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-10 md:pt-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">&#x23F1;&#xFE0F;</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Time&apos;s Up
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Sala:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  showToast('Codigo copiado!', 'success');
                }}
                className="font-mono text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
              >
                {roomCode}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-slate-400 text-xs">Jugando como</div>
          <div className="text-white font-medium">{player?.name || playerName}</div>
        </div>
      </div>

      {/* LOBBY PHASE */}
      {game.phase === 'lobby' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          {/* Team selector */}
          <div className="mb-6">
            <TeamSelector
              players={game.players}
              currentPlayerId={playerId || ''}
              onSelectTeam={handleSelectTeam}
            />
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <QRCode roomCode={roomCode} />
          </div>

          {/* Start button */}
          {isHost && (
            <div className="text-center mt-auto pb-4">
              {canStartGame ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGame}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-orange-500/30"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Iniciar Juego
                </motion.button>
              ) : (
                <div className="bg-amber-500/20 text-amber-400 px-6 py-3 rounded-xl text-sm">
                  Se necesitan al menos {TIMESUP_CONFIG.minPlayersPerTeam} jugadores por equipo
                </div>
              )}
            </div>
          )}

          {!isHost && (
            <div className="text-center mt-auto pb-4">
              <p className="text-slate-400 text-sm">
                Esperando a que el host inicie el juego...
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* PLAYING PHASES (round1, round2, round3) */}
      {isPlayingPhase && (
        <div className="flex-1 flex flex-col">
          {/* Round indicator */}
          <div className="mb-4">
            <RoundIndicator currentRound={currentRoundNumber as 1 | 2 | 3} />
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <TeamPanel
              team="orange"
              players={orangePlayers}
              score={game.orangeScore}
              currentPlayerId={game.currentTurn?.playerId || null}
              isCurrentTeam={game.currentTeam === 'orange'}
            />
            <TeamPanel
              team="blue"
              players={bluePlayers}
              score={game.blueScore}
              currentPlayerId={game.currentTurn?.playerId || null}
              isCurrentTeam={game.currentTeam === 'blue'}
            />
          </div>

          {/* Cards remaining */}
          <div className="text-center text-sm text-slate-400 mb-4">
            {game.remainingCards.length} cartas restantes esta ronda
          </div>

          {/* Game content area */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* MY TURN and turn active */}
            {isMyTurn && game.currentTurn?.isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-4"
              >
                {/* Timer */}
                <div className="flex justify-center mb-4">
                  <Timer
                    timeRemaining={timeRemaining * 1000}
                    totalTime={TIMESUP_CONFIG.turnDuration}
                  />
                </div>

                {/* Card display */}
                <CardDisplay
                  card={currentCard}
                  isRevealed={true}
                  currentRound={currentRoundNumber}
                />

                {/* Action buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuessCorrect}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-xl shadow-lg shadow-green-500/30"
                  >
                    &#x2714; Correcto!
                  </motion.button>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSkipCard}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
                    >
                      Pasar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEndTurn}
                      className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-medium transition-colors"
                    >
                      Terminar Turno
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MY TURN but turn not started */}
            {player?.team === game.currentTeam && !game.currentTurn?.isActive && game.currentTurn?.playerId === playerId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="text-4xl mb-4">&#x1F3AF;</div>
                <h2 className="text-2xl font-bold text-white">Tu turno!</h2>
                <p className="text-slate-400">
                  Tienes 30 segundos para que tu equipo adivine tantas cartas como pueda
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartTurn}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30"
                >
                  Empezar Turno
                </motion.button>
              </motion.div>
            )}

            {/* NOT my turn */}
            {player?.team !== game.currentTeam && game.currentTurn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                {game.currentTurn.isActive ? (
                  <>
                    {/* Show timer */}
                    <div className="flex justify-center mb-4">
                      <Timer
                        timeRemaining={timeRemaining * 1000}
                        totalTime={TIMESUP_CONFIG.turnDuration}
                      />
                    </div>

                    {/* Show card back */}
                    <CardDisplay
                      card={null}
                      isRevealed={false}
                      currentRound={currentRoundNumber}
                    />

                    <p className="text-slate-400">
                      <span className="font-bold text-white">{currentTurnPlayer?.name}</span> esta describiendo...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">&#x23F3;</div>
                    <p className="text-slate-400">
                      Esperando a que <span className="font-bold text-white">{currentTurnPlayer?.name}</span> empiece su turno
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* My team's turn but not my specific turn */}
            {player?.team === game.currentTeam && game.currentTurn?.playerId !== playerId && game.currentTurn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                {game.currentTurn.isActive ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <Timer
                        timeRemaining={timeRemaining * 1000}
                        totalTime={TIMESUP_CONFIG.turnDuration}
                      />
                    </div>

                    <div className={`
                      p-6 rounded-2xl border-2
                      ${player?.team === 'orange' ? 'bg-orange-500/20 border-orange-500' : 'bg-blue-500/20 border-blue-500'}
                    `}>
                      <div className="text-5xl mb-4">&#x1F440;</div>
                      <h3 className="text-xl font-bold text-white mb-2">Adivina!</h3>
                      <p className="text-slate-300">
                        <span className="font-bold">{currentTurnPlayer?.name}</span> esta describiendo
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        {currentRoundNumber === 1 && 'Escucha las descripciones'}
                        {currentRoundNumber === 2 && 'Solo UNA palabra como pista'}
                        {currentRoundNumber === 3 && 'Solo mimica, sin hablar'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">&#x23F3;</div>
                    <p className="text-slate-400">
                      Esperando a que <span className="font-bold text-white">{currentTurnPlayer?.name}</span> empiece su turno
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ROUND END PHASE */}
      {game.phase === 'roundEnd' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            &#x1F389;
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Ronda {game.currentRound} Completada!
          </h2>

          {/* Round scores */}
          <div className="w-full max-w-md my-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-orange-500/20 rounded-xl p-4 text-center border border-orange-500/30">
                <p className="text-orange-300 text-sm mb-1">Equipo Naranja</p>
                <p className="text-3xl font-bold text-orange-400">{game.orangeScore}</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-500/30">
                <p className="text-blue-300 text-sm mb-1">Equipo Azul</p>
                <p className="text-3xl font-bold text-blue-400">{game.blueScore}</p>
              </div>
            </div>
          </div>

          {isHost && game.currentRound < 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextRound}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30"
            >
              Siguiente Ronda
            </motion.button>
          )}

          {!isHost && (
            <p className="text-slate-400 text-sm">
              Esperando al host...
            </p>
          )}
        </motion.div>
      )}

      {/* FINISHED PHASE */}
      {game.phase === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col"
        >
          <ScoreBoard game={game} />

          {/* Celebration for winner */}
          {game.winner && player?.team === game.winner && (
            <motion.div
              className="text-center my-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                className="text-6xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                &#x1F3C6;
              </motion.div>
              <p className="text-2xl font-bold text-yellow-400 mt-4">
                Tu equipo gano!
              </p>
            </motion.div>
          )}

          {isHost && (
            <div className="mt-auto pb-4 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetGame}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30"
              >
                Nueva Partida
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Rules button */}
      <RulesButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Leave game dialog */}
      <LeaveGameDialog
        isOpen={showLeaveDialog}
        onConfirm={() => {
          router.push('/times-up');
        }}
        onCancel={() => setShowLeaveDialog(false)}
        roomCode={roomCode}
        gameName="Time's Up"
      />
    </main>
  );
}
