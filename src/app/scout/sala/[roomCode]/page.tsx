'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useScout } from '@/hooks/useScout';
import {
  PlayerHand,
  OpponentHand,
  CurrentPlay,
  ActionButtons,
  FlipHandButton,
  ConfirmHandButton,
  StartGameButton,
  RoundSummary,
  GameResults,
  MiniScoreBoard,
  RulesModal,
  HelpButton,
} from '@/components/scout';
import { CircusBackground, CircusConfetti } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import type { ScoutCard, ScoutPlayer } from '@/types/game';

export default function ScoutRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [showRules, setShowRules] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [scoutMode, setScoutMode] = useState<'none' | 'selecting' | 'inserting'>('none');
  const [scoutFromLeft, setScoutFromLeft] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [actionNotification, setActionNotification] = useState<{type: string; playerName: string} | null>(null);

  const {
    game,
    playerId,
    loading,
    error,
    startGame,
    flipHand,
    confirmHand,
    show,
    scout,
    scoutAndShow,
    nextRound,
    resetGame,
  } = useScout();

  // Rejoin check on mount
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('scoutPlayerId');
    const storedRoomCode = sessionStorage.getItem('scoutRoomCode');

    if (!storedPlayerId || storedRoomCode !== roomCode) {
      router.push(`/scout/unirse/${roomCode}`);
    }
  }, [roomCode, router]);

  // Show confetti on round end or game end with player winning
  useEffect(() => {
    if (game?.phase === 'roundEnd' || game?.phase === 'gameEnd') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [game?.phase]);

  // Clear selection when turn changes or phase changes
  useEffect(() => {
    setSelectedCardIds([]);
    setScoutMode('none');
    setScoutFromLeft(null);
    setInsertPosition(null);
  }, [game?.currentPlayerIndex, game?.phase, game?.currentRound]);

  // Show action notifications
  useEffect(() => {
    if (game?.lastAction?.type && game?.lastAction?.playerId) {
      const player = game.players.find(p => p.id === game.lastAction?.playerId);
      if (player && game.lastAction.type) {
        setActionNotification({
          type: game.lastAction.type,
          playerName: player.name,
        });
        const timer = setTimeout(() => setActionNotification(null), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [game?.lastAction?.timestamp]);

  const currentPlayer = game?.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const isMyTurn = game?.players[game?.currentPlayerIndex]?.id === playerId;
  const myCards = currentPlayer?.hand || [];

  // Get selected cards in order
  const selectedCards = useMemo(() => {
    return selectedCardIds
      .map(id => myCards.find(c => c.id === id))
      .filter((c): c is ScoutCard => c !== undefined);
  }, [selectedCardIds, myCards]);

  // Check if selected cards are adjacent in hand
  const areSelectedAdjacent = useMemo(() => {
    if (selectedCardIds.length <= 1) return true;
    const indices = selectedCardIds
      .map(id => myCards.findIndex(c => c.id === id))
      .sort((a, b) => a - b);

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] - indices[i - 1] !== 1) return false;
    }
    return true;
  }, [selectedCardIds, myCards]);

  // Validate if current selection can beat the current play
  const canShowWithSelection = useMemo(() => {
    if (!game || selectedCardIds.length === 0 || !areSelectedAdjacent) return false;
    if (!isMyTurn) return false;

    // Get active values of selected cards
    const activeValues = selectedCards.map(c =>
      c.orientation === 'up' ? c.topValue : c.bottomValue
    );

    // Check if it's a valid play (single, set, or run)
    const isAllSame = activeValues.every(v => v === activeValues[0]);
    const sortedValues = [...activeValues].sort((a, b) => a - b);
    const isRun = sortedValues.length > 1 &&
      sortedValues.every((v, i) => i === 0 || v === sortedValues[i - 1] + 1);

    if (!isAllSame && !isRun) return false;

    // If no current play, any valid play works
    if (!game.currentPlay) return true;

    const currentPlay = game.currentPlay;
    const myCount = activeValues.length;
    const theirCount = currentPlay.cards.length;

    // More cards always wins
    if (myCount > theirCount) return true;
    if (myCount < theirCount) return false;

    // Same count - type matters (run beats set)
    const myType = isRun ? 'run' : 'set';
    if (myType === 'run' && currentPlay.playType === 'set') return true;
    if (myType === 'set' && currentPlay.playType === 'run') return false;

    // Same type - value matters
    const myValue = isRun ? sortedValues[0] : activeValues[0];
    return myValue > currentPlay.value;
  }, [game, selectedCardIds, selectedCards, areSelectedAdjacent, isMyTurn]);

  // Can scout from current play
  const canScout = useMemo(() => {
    if (!game || !isMyTurn || !game.currentPlay) return false;
    if (game.currentPlay.cards.length === 0) return false;
    return true;
  }, [game, isMyTurn]);

  // Can use Scout & Show (once per round)
  const canScoutAndShow = useMemo(() => {
    if (!currentPlayer || !game) return false;
    if (currentPlayer.hasUsedScoutAndShow) return false;
    if (!isMyTurn) return false;
    if (!game.currentPlay || game.currentPlay.cards.length === 0) return false;
    return true;
  }, [currentPlayer, game, isMyTurn]);

  // Handle card selection
  const handleCardClick = useCallback((cardId: string) => {
    if (!isMyTurn || game?.phase !== 'playing' || scoutMode !== 'none') return;

    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      return [...prev, cardId];
    });
  }, [isMyTurn, game?.phase, scoutMode]);

  // Handle Show action
  const handleShow = async () => {
    if (!canShowWithSelection || selectedCardIds.length === 0) return;

    // Get cards in order of their position in hand
    const orderedIds = myCards
      .filter(c => selectedCardIds.includes(c.id))
      .map(c => c.id);

    const success = await show(orderedIds);
    if (success) {
      setSelectedCardIds([]);
    }
  };

  // Handle Scout action
  const handleScoutStart = (fromLeft: boolean) => {
    setScoutFromLeft(fromLeft);
    setScoutMode('inserting');
    setSelectedCardIds([]);
  };

  const handleInsertPosition = async (index: number) => {
    if (scoutMode !== 'inserting' || scoutFromLeft === null) return;

    const success = await scout(scoutFromLeft, index);
    if (success) {
      setScoutMode('none');
      setScoutFromLeft(null);
      setInsertPosition(null);
    }
  };

  // Cancel scout mode
  const handleCancelScout = () => {
    setScoutMode('none');
    setScoutFromLeft(null);
    setInsertPosition(null);
  };

  // Handle Scout & Show
  const handleScoutAndShow = async () => {
    if (!canScoutAndShow) return;
    // For simplicity, we'll let the user do it step by step
    // This would need a more complex UI in a full implementation
    setScoutMode('selecting');
  };

  // Render loading state
  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <CircusBackground />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-amber-400/60">Cargando...</p>
        </div>
      </div>
    );
  }

  const otherPlayers = game.players.filter(p => p.id !== playerId);
  const currentTurnPlayer = game.players[game.currentPlayerIndex];

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 safe-area-top safe-area-bottom relative overflow-hidden">
      <CircusBackground />
      <CircusConfetti isActive={showConfetti} />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="scout" roomCode={roomCode} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <Link href="/scout" className="text-amber-400/70 hover:text-amber-300 transition-colors">
          ← Salir
        </Link>
        <div className="text-center">
          <div className="text-amber-500/50 text-xs uppercase tracking-wider">Show</div>
          <div className="text-amber-400 font-mono text-lg tracking-widest">{game.roomCode}</div>
        </div>
        <div className="w-12" />
      </div>

      {/* Round indicator */}
      {game.phase === 'playing' && (
        <div className="text-center mb-4 relative z-10">
          <MiniScoreBoard players={game.players} totalScores={game.totalScores} />
          <div className="text-amber-400/50 text-xs mt-1">
            Ronda {game.currentRound} de {game.totalRounds}
          </div>
        </div>
      )}

      {/* LOBBY PHASE */}
      {game.phase === 'lobby' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center relative z-10"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎪
          </motion.div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">SCOUT</h2>
          <p className="text-amber-300/60 mb-6">El Circo de las Cartas</p>

          {/* Players list */}
          <div className="w-full max-w-sm mb-6">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30">
              <div className="text-amber-400/60 text-sm mb-3 uppercase tracking-wider">
                Artistas ({game.players.length}/5)
              </div>
              <div className="space-y-2">
                {game.players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      player.id === playerId
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <span className="text-white flex items-center gap-2">
                      <span className="text-amber-400">🎭</span>
                      {player.name}
                      {player.isHost && ' 👑'}
                      {player.id === playerId && ' (Tu)'}
                    </span>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-amber-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code area placeholder */}
          <div className="w-full max-w-sm mb-6 text-center">
            <div className="text-amber-400/50 text-sm">
              Comparte el codigo: <span className="font-mono font-bold text-amber-300">{game.roomCode}</span>
            </div>
          </div>

          {/* Start button */}
          {isHost && (
            <StartGameButton
              onClick={startGame}
              playerCount={game.players.length}
              disabled={loading}
            />
          )}

          {isHost && game.players.length < 3 && (
            <p className="text-amber-400/60 text-sm mt-4">
              Se necesitan al menos 3 artistas para comenzar
            </p>
          )}

          {!isHost && (
            <p className="text-amber-400/60 text-sm">
              Esperando a que el director inicie el show...
            </p>
          )}
        </motion.div>
      )}

      {/* ORIENTATION PHASE */}
      {game.phase === 'orientation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center relative z-10"
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🃏
          </motion.div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">
            Prepara tu Mano
          </h2>
          <p className="text-amber-300/60 mb-6 text-center max-w-sm">
            Voltea tu mano si quieres usar los otros valores.
            <br />
            <span className="text-amber-400/80">No podras reordenar las cartas!</span>
          </p>

          {/* Player's hand */}
          <div className="w-full max-w-md mb-6">
            <PlayerHand
              cards={myCards}
              selectedCardIds={[]}
              isCurrentPlayer={true}
              isOrientationPhase={true}
              disabled={currentPlayer?.hasConfirmedHand}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <FlipHandButton
              onClick={flipHand}
              disabled={loading || !!currentPlayer?.hasConfirmedHand}
            />
            <ConfirmHandButton
              onClick={confirmHand}
              disabled={loading || !!currentPlayer?.hasConfirmedHand}
            />
          </div>

          {currentPlayer?.hasConfirmedHand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-emerald-400 flex items-center gap-2"
            >
              <span>✓</span>
              <span>Mano confirmada</span>
            </motion.div>
          )}

          {/* Confirmation status */}
          <div className="mt-6 text-amber-400/60 text-sm">
            {game.players.filter(p => p.hasConfirmedHand).length} / {game.players.length} listos
          </div>
        </motion.div>
      )}

      {/* PLAYING PHASE */}
      {game.phase === 'playing' && (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Other players */}
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {otherPlayers.map((player) => (
                <OpponentHand
                  key={player.id}
                  playerName={player.name}
                  cardCount={player.hand.length}
                  isCurrentTurn={currentTurnPlayer?.id === player.id}
                  capturedCards={player.capturedCards}
                  scoutTokens={player.scoutTokensReceived}
                />
              ))}
            </div>
          </div>

          {/* Center: Current play */}
          <div className="flex-1 flex items-center justify-center">
            <CurrentPlay
              currentPlay={game.currentPlay}
              players={game.players}
              canScout={canScout && scoutMode === 'none'}
              isSelectingScout={scoutMode === 'inserting'}
              onScoutLeft={() => handleScoutStart(true)}
              onScoutRight={() => handleScoutStart(false)}
            />
          </div>

          {/* Scout mode instructions */}
          <AnimatePresence>
            {scoutMode === 'inserting' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center mb-4"
              >
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl px-4 py-3 inline-flex items-center gap-3">
                  <span className="text-purple-300">
                    👁️ Selecciona donde insertar la carta
                  </span>
                  <button
                    onClick={handleCancelScout}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="mb-4">
            <ActionButtons
              onShow={handleShow}
              onScout={() => {}}
              onScoutAndShow={handleScoutAndShow}
              canShow={canShowWithSelection}
              canScout={canScout}
              canScoutAndShow={canScoutAndShow}
              isMyTurn={isMyTurn}
              selectedCardCount={selectedCardIds.length}
              loading={loading}
            />
          </div>

          {/* My hand */}
          <div className="border-t border-amber-500/20 pt-4">
            <PlayerHand
              cards={myCards}
              selectedCardIds={selectedCardIds}
              onCardClick={handleCardClick}
              onCardInsertPosition={scoutMode === 'inserting' ? handleInsertPosition : undefined}
              isCurrentPlayer={true}
              showInsertPositions={scoutMode === 'inserting'}
              disabled={!isMyTurn || scoutMode !== 'none'}
            />
          </div>

          {/* Selection validation message */}
          {selectedCardIds.length > 0 && !areSelectedAdjacent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-2 text-red-400 text-sm"
            >
              Las cartas deben ser adyacentes
            </motion.div>
          )}
        </div>
      )}

      {/* ROUND END PHASE */}
      {game.phase === 'roundEnd' && game.rounds.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center relative z-10"
        >
          <RoundSummary
            round={game.rounds[game.rounds.length - 1]}
            players={game.players}
            onContinue={nextRound}
            isHost={isHost}
            isLastRound={game.currentRound >= game.totalRounds}
          />
        </motion.div>
      )}

      {/* GAME END PHASE */}
      {game.phase === 'gameEnd' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center relative z-10"
        >
          <GameResults
            players={game.players}
            totalScores={game.totalScores}
            winnerId={game.winner}
            onPlayAgain={resetGame}
            isHost={isHost}
          />
        </motion.div>
      )}

      {/* Action notification */}
      <AnimatePresence>
        {actionNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-slate-900/90 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {actionNotification.type === 'show' && '🎭'}
                  {actionNotification.type === 'scout' && '👁️'}
                  {actionNotification.type === 'scoutAndShow' && '⚡'}
                </span>
                <div>
                  <p className="text-amber-300 font-medium">{actionNotification.playerName}</p>
                  <p className="text-white/60 text-sm">
                    {actionNotification.type === 'show' && 'ha hecho Show'}
                    {actionNotification.type === 'scout' && 'ha usado Scout'}
                    {actionNotification.type === 'scoutAndShow' && 'ha usado Scout & Show'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50"
          >
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-center text-red-300 text-sm">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help button */}
      <HelpButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
