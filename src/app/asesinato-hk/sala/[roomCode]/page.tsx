'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAsesinato } from '@/hooks/useAsesinato';
import { getRoleName, getRoleDescription } from '@/lib/asesinatoLogic';
import { playRevealSound, playSelectSound, playVictorySound, playErrorSound, playClickSound, playWarningSound, playNotificationSound, playCountdownSound, startSleepingAmbience, stopSleepingAmbience, playWakeUpSound, triggerWakeVibration } from '@/lib/audioUtils';
import type { AsesinatoPlayer, AsesinatoSceneTile, AsesinatoClueCard, AsesinatoMeansCard } from '@/types/game';
import { AsesinatoHelper, AsesinatoHelperToggle, HoldButton, RoleReveal } from '@/components/asesinato-hk';

export default function AsesinatoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Get player ID from session storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('asesinatoPlayerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  const {
    game,
    player,
    loading,
    error,
    isHost,
    isForensicScientist,
    isMurderer,
    isAccomplice,
    isWitness,
    isInvestigator,
    canAccuse,
    discussionTimeRemaining,
    isHolding,
    allPlayersHolding,
    forensicScientistName,
    startGame,
    proceedToMurderSelection,
    startHold,
    stopHold,
    startSleeping,
    selectSolution,
    selectTileOption,
    confirmClues,
    replaceTile,
    accuse,
    nextRound,
    resetGame,
  } = useAsesinato(roomCode, playerId);

  // States for UI
  const [selectedClueCard, setSelectedClueCard] = useState<string | null>(null);
  const [selectedMeansCard, setSelectedMeansCard] = useState<string | null>(null);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [accusationStep, setAccusationStep] = useState<'player' | 'clue' | 'means' | 'confirm'>('player');
  const [accusationTarget, setAccusationTarget] = useState<AsesinatoPlayer | null>(null);
  const [accusationClue, setAccusationClue] = useState<AsesinatoClueCard | null>(null);
  const [accusationMeans, setAccusationMeans] = useState<AsesinatoMeansCard | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [showReplaceTileModal, setShowReplaceTileModal] = useState(false);
  const [tileToReplace, setTileToReplace] = useState<string | null>(null);
  const [lastAccusationResult, setLastAccusationResult] = useState<{ isCorrect: boolean; accuserName: string } | null>(null);
  const [prevPhase, setPrevPhase] = useState<string | null>(null);

  // Helper tutorial state
  const [helperEnabled, setHelperEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('asesinato_helper_enabled');
    return stored === null ? true : stored === 'true';
  });
  const [helperDismissed, setHelperDismissed] = useState(false);

  // Night phase audio state
  const [sleepingAmbienceStop, setSleepingAmbienceStop] = useState<(() => void) | null>(null);
  const [countdownPlayed, setCountdownPlayed] = useState(false);
  const [wakeUpHandled, setWakeUpHandled] = useState(false);

  // Play sounds on phase changes
  useEffect(() => {
    if (game?.phase && game.phase !== prevPhase) {
      if (game.phase === 'roleReveal' && prevPhase === 'lobby') {
        playRevealSound();
      } else if (game.phase === 'discussion' && prevPhase === 'clueGiving') {
        playSelectSound();
      } else if (game.phase === 'finished') {
        // Play victory or defeat based on winner
        if (game.winner === 'investigators') {
          playVictorySound();
        } else {
          playErrorSound();
        }
      }
      setPrevPhase(game.phase);
    }
  }, [game?.phase, game?.winner, prevPhase]);

  // Play warning sound when discussion timer is low (under 30 seconds)
  useEffect(() => {
    if (game?.phase === 'discussion' && discussionTimeRemaining > 0 && discussionTimeRemaining <= 30000) {
      const seconds = Math.floor(discussionTimeRemaining / 1000);
      if (seconds === 30 || seconds === 10 || seconds === 5) {
        playWarningSound();
      }
    }
  }, [game?.phase, discussionTimeRemaining]);

  // Reset helper dismissed state on phase change
  useEffect(() => {
    setHelperDismissed(false);
  }, [game?.phase]);

  // Handle night phase audio and transitions
  useEffect(() => {
    // Handle countdown when all players are holding
    if (game?.nightPhase === 'countdown' && !countdownPlayed) {
      setCountdownPlayed(true);
      playCountdownSound().then(() => {
        // After countdown, trigger server to start sleeping phase
        startSleeping();
      });
    }

    // Handle sleeping ambience
    if (game?.nightPhase === 'sleeping' && !sleepingAmbienceStop) {
      const stopFn = startSleepingAmbience();
      setSleepingAmbienceStop(() => stopFn);
    }

    // Handle wake up
    if (game?.nightPhase === 'waking' && !wakeUpHandled) {
      setWakeUpHandled(true);
      // Stop sleeping ambience
      if (sleepingAmbienceStop) {
        sleepingAmbienceStop();
        setSleepingAmbienceStop(null);
      }
      stopSleepingAmbience();
      playWakeUpSound();
      triggerWakeVibration();
    }

    // Reset states when phase changes away from murderSelection
    if (game?.phase !== 'murderSelection') {
      if (sleepingAmbienceStop) {
        sleepingAmbienceStop();
        setSleepingAmbienceStop(null);
      }
      stopSleepingAmbience();
      setCountdownPlayed(false);
      setWakeUpHandled(false);
    }
  }, [game?.nightPhase, game?.phase, countdownPlayed, sleepingAmbienceStop, wakeUpHandled, startSleeping]);

  // Cleanup sleeping ambience on unmount
  useEffect(() => {
    return () => {
      stopSleepingAmbience();
    };
  }, []);

  // Toggle helper enabled state
  const toggleHelper = () => {
    setHelperEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('asesinato_helper_enabled', String(newValue));
      return newValue;
    });
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando partida...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-400 mb-6">{error || 'Partida no encontrada'}</p>
          <Link
            href="/asesinato-hk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  // Handle murder solution selection
  const handleSelectSolution = async () => {
    if (!selectedClueCard || !selectedMeansCard) return;
    playSelectSound();
    await selectSolution(selectedClueCard, selectedMeansCard);
    setSelectedClueCard(null);
    setSelectedMeansCard(null);
  };

  // Handle card selection with sound
  const handleCardSelect = (type: 'clue' | 'means', cardId: string) => {
    playClickSound();
    if (type === 'clue') {
      setSelectedClueCard(cardId);
    } else {
      setSelectedMeansCard(cardId);
    }
  };

  // Handle tile option selection with sound
  const handleTileOptionSelect = async (tileId: string, optionIndex: number) => {
    playClickSound();
    await selectTileOption(tileId, optionIndex);
  };

  // Handle start game with sound
  const handleStartGame = async () => {
    playClickSound();
    await startGame();
  };

  // Handle proceed to murder selection with sound
  const handleProceedToMurderSelection = async () => {
    playClickSound();
    await proceedToMurderSelection();
  };

  // Handle hold button start
  const handleHoldStart = async () => {
    const result = await startHold();
    // If all players holding, countdown will start automatically via server
  };

  // Handle hold button end
  const handleHoldEnd = async () => {
    await stopHold();
  };

  // Handle confirm clues with sound
  const handleConfirmClues = async () => {
    playNotificationSound();
    await confirmClues();
  };

  // Handle open accusation modal with sound
  const handleOpenAccusation = () => {
    playClickSound();
    setShowAccusationModal(true);
  };

  // Handle accusation
  const handleAccuse = async () => {
    if (!accusationTarget || !accusationClue || !accusationMeans) return;
    const result = await accuse(accusationTarget.id, accusationClue.id, accusationMeans.id);
    setLastAccusationResult({ isCorrect: result.isCorrect, accuserName: player?.name || '' });
    // Play sound based on result
    if (result.isCorrect) {
      playVictorySound();
    } else {
      playErrorSound();
    }
    setShowAccusationModal(false);
    resetAccusationState();
  };

  const resetAccusationState = () => {
    setAccusationStep('player');
    setAccusationTarget(null);
    setAccusationClue(null);
    setAccusationMeans(null);
  };

  // Format time remaining
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get role color
  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'forensicScientist': return 'text-cyan-400';
      case 'murderer': return 'text-red-500';
      case 'accomplice': return 'text-orange-400';
      case 'witness': return 'text-purple-400';
      case 'investigator': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  // Render based on phase
  const renderPhaseContent = () => {
    switch (game.phase) {
      case 'lobby':
        return (
          <div className="space-y-6">
            {/* Room Code */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Codigo de sala</p>
              <p className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Copiar enlace de invitacion
              </button>
            </div>

            {/* Players */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Jugadores ({game.players.length}/12)</h3>
              <div className="space-y-2">
                {game.players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="text-white flex-1">{p.name}</span>
                    {p.isHost && <span className="text-xs bg-red-800 text-white px-2 py-1 rounded">Host</span>}
                    {p.id === playerId && <span className="text-xs bg-slate-600 text-white px-2 py-1 rounded">Tu</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Start button */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={game.players.length < 4}
                className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
              >
                {game.players.length < 4
                  ? `Esperando jugadores (${game.players.length}/4 minimo)`
                  : 'Iniciar Partida'}
              </button>
            )}

            {!isHost && (
              <p className="text-center text-slate-400">Esperando a que el host inicie la partida...</p>
            )}
          </div>
        );

      case 'roleReveal':
        // Build team members for witness/criminals
        const teamMembers = (isWitness || isMurderer || isAccomplice)
          ? game.players
              .filter(p => p.role === 'murderer' || p.role === 'accomplice')
              .map(p => ({ name: p.name, role: p.role as 'murderer' | 'accomplice' }))
          : undefined;

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Tu Rol</h2>

            <RoleReveal
              role={player?.role || null}
              roleName={player?.role ? getRoleName(player.role) : ''}
              roleDescription={player?.role ? getRoleDescription(player.role) : ''}
              teamMembers={teamMembers}
            />

            {isHost && (
              <button
                onClick={handleProceedToMurderSelection}
                className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all"
              >
                Continuar - Seleccion del Crimen
              </button>
            )}
          </div>
        );

      case 'murderSelection':
        // Night phase implementation
        const nightPhase = game.nightPhase || 'waiting';
        const playersHoldingCount = game.playersHolding?.length || 0;
        const totalPlayers = game.players.length;

        return (
          <div className="space-y-6">
            {/* Forensic Scientist identity - ALWAYS visible */}
            <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-xl p-4 text-center">
              <p className="text-cyan-400 text-sm mb-1">Cientifico Forense</p>
              <p className="text-white text-xl font-bold flex items-center justify-center gap-2">
                <span className="text-2xl">
                  {game.players.find(p => p.role === 'forensicScientist')?.avatar}
                </span>
                {forensicScientistName}
              </p>
            </div>

            {/* Night Phase UI */}
            {nightPhase === 'waiting' && (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Noche de Crimen</h2>
                  <p className="text-slate-400">
                    Cierra los ojos y mantén presionado el botón
                  </p>
                </div>

                <HoldButton
                  onHoldStart={handleHoldStart}
                  onHoldEnd={handleHoldEnd}
                  isHolding={isHolding}
                  disabled={false}
                />

                {/* Players holding status */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-2">
                    Jugadores listos: {playersHoldingCount}/{totalPlayers}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {game.players.map(p => {
                      const isPlayerHolding = game.playersHolding?.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                            isPlayerHolding
                              ? 'bg-green-800/50 text-green-300'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isPlayerHolding ? 'bg-green-400' : 'bg-slate-500'}`} />
                          <span>{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {nightPhase === 'countdown' && (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-bold text-red-500 mb-4"
                >
                  🌙
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Cerrando ojos...</h2>
                <p className="text-slate-400">3... 2... 1...</p>

                <HoldButton
                  onHoldStart={() => {}}
                  onHoldEnd={() => {}}
                  isHolding={true}
                  disabled={true}
                  label="MANTENER CERRADOS"
                />
              </div>
            )}

            {nightPhase === 'sleeping' && (
              <>
                {isMurderer && !game.murdererReady ? (
                  // Murderer sees card selection
                  <>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-red-400 mb-2">🔪 Elige tu Crimen</h2>
                      <p className="text-slate-400">Selecciona UNA evidencia y UN metodo</p>
                    </div>

                    {/* Clue Cards - 2x2 grid */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">Evidencias (elige 1)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {player?.clueCards.map(card => (
                          <motion.button
                            key={card.id}
                            onClick={() => handleCardSelect('clue', card.id)}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-xl text-left transition-all ${
                              selectedClueCard === card.id
                                ? 'bg-red-800 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                : 'bg-slate-800/80 border-2 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <p className="text-white font-bold text-lg mb-1">{card.name}</p>
                            <p className="text-slate-400 text-xs">{card.category}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Means Cards - 2x2 grid */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">Metodos (elige 1)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {player?.meansCards.map(card => (
                          <motion.button
                            key={card.id}
                            onClick={() => handleCardSelect('means', card.id)}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-xl text-left transition-all ${
                              selectedMeansCard === card.id
                                ? 'bg-red-800 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                : 'bg-slate-800/80 border-2 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <p className="text-white font-bold text-lg mb-1">{card.name}</p>
                            <p className="text-slate-400 text-xs">{card.category}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSelectSolution}
                      disabled={!selectedClueCard || !selectedMeansCard}
                      className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all"
                    >
                      Confirmar Crimen 🔪
                    </button>
                  </>
                ) : isMurderer && game.murdererReady ? (
                  // Murderer sees fake hold button after selection
                  <div className="text-center py-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Crimen Elegido</h2>
                    <p className="text-slate-400 mb-6">Mantén los ojos cerrados como los demas...</p>

                    <HoldButton
                      onHoldStart={() => {}}
                      onHoldEnd={() => {}}
                      isHolding={true}
                      disabled={false}
                      isFake={true}
                      label="ESPERANDO..."
                    />
                  </div>
                ) : (
                  // Non-murderers keep eyes closed
                  <div className="text-center py-6">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-8xl mb-6"
                    >
                      😴
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Mantén los ojos cerrados</h2>
                    <p className="text-slate-400 mb-6">El crimen se esta cometiendo...</p>

                    <HoldButton
                      onHoldStart={() => {}}
                      onHoldEnd={() => {}}
                      isHolding={true}
                      disabled={true}
                      label="OJOS CERRADOS"
                    />
                  </div>
                )}
              </>
            )}

            {nightPhase === 'waking' && (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="text-8xl mb-6"
                >
                  ☀️
                </motion.div>
                <h2 className="text-3xl font-bold text-amber-400 mb-2">Despierta!</h2>
                <p className="text-slate-300">Abre los ojos... la investigacion comienza</p>
              </div>
            )}
          </div>
        );

      case 'clueGiving':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">Ronda {game.currentRound} de {game.maxRounds}</h2>
              <p className="text-slate-400">
                {isForensicScientist
                  ? 'Coloca las pistas en las fichas de escena'
                  : 'El Cientifico Forense esta colocando pistas...'}
              </p>
            </div>

            {/* Solution display for those who can see it */}
            {(isForensicScientist || isMurderer || isAccomplice) && game.solution && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold mb-2">El Crimen (secreto)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Evidencia:</p>
                    <p className="text-white font-medium">
                      {game.players.find(p => p.id === game.solution?.murdererPlayerId)
                        ?.clueCards.find(c => c.id === game.solution?.keyEvidenceId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Metodo:</p>
                    <p className="text-white font-medium">
                      {game.players.find(p => p.id === game.solution?.murdererPlayerId)
                        ?.meansCards.find(c => c.id === game.solution?.meansOfMurderId)?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scene Tiles */}
            <div className="space-y-4">
              {/* Cause of Death & Location (always visible) */}
              <div className="grid grid-cols-1 gap-3">
                {game.causeOfDeathTile && (
                  <SceneTileComponent
                    tile={game.causeOfDeathTile}
                    isForensicScientist={isForensicScientist}
                    onSelect={(optionIndex) => handleTileOptionSelect(game.causeOfDeathTile!.id, optionIndex)}
                  />
                )}
                {game.locationTile && (
                  <SceneTileComponent
                    tile={game.locationTile}
                    isForensicScientist={isForensicScientist}
                    onSelect={(optionIndex) => handleTileOptionSelect(game.locationTile!.id, optionIndex)}
                  />
                )}
              </div>

              {/* Regular Scene Tiles */}
              <div className="grid grid-cols-1 gap-3">
                {game.sceneTiles.map(tile => (
                  <SceneTileComponent
                    key={tile.id}
                    tile={tile}
                    isForensicScientist={isForensicScientist}
                    onSelect={(optionIndex) => handleTileOptionSelect(tile.id, optionIndex)}
                    canReplace={isForensicScientist && game.currentRound > 1 && !game.rounds[game.rounds.length - 1]?.replacedTileId}
                    onReplace={() => {
                      setTileToReplace(tile.id);
                      setShowReplaceTileModal(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Confirm button for Forensic Scientist */}
            {isForensicScientist && (
              <button
                onClick={handleConfirmClues}
                className="w-full py-4 bg-gradient-to-r from-cyan-700 to-cyan-800 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all"
              >
                Confirmar Pistas - Iniciar Discusion
              </button>
            )}
          </div>
        );

      case 'discussion':
        return (
          <div className="space-y-6">
            {/* Timer */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">Ronda {game.currentRound} - Discusion</h2>
              <div className={`text-3xl font-mono font-bold ${discussionTimeRemaining < 30000 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(discussionTimeRemaining)}
              </div>
            </div>

            {/* Scene Tiles (read-only now) */}
            <div className="space-y-3">
              {game.causeOfDeathTile && (
                <SceneTileComponent tile={game.causeOfDeathTile} isForensicScientist={false} onSelect={() => {}} />
              )}
              {game.locationTile && (
                <SceneTileComponent tile={game.locationTile} isForensicScientist={false} onSelect={() => {}} />
              )}
              {game.sceneTiles.map(tile => (
                <SceneTileComponent key={tile.id} tile={tile} isForensicScientist={false} onSelect={() => {}} />
              ))}
            </div>

            {/* All Players Cards */}
            <div>
              <h3 className="text-white font-semibold mb-3">Cartas de todos los jugadores</h3>
              <div className="space-y-2">
                {game.players.map(p => (
                  <div key={p.id} className="bg-slate-800/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPlayerId(expandedPlayerId === p.id ? null : p.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar}</span>
                        <span className="text-white">{p.name}</span>
                        {p.hasAccused && <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">Acuso</span>}
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlayerId === p.id ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {expandedPlayerId === p.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 pb-3"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Evidencias</p>
                              <div className="space-y-1">
                                {p.clueCards.map(c => (
                                  <div key={c.id} className="text-sm text-white bg-slate-700/50 px-2 py-1 rounded">
                                    {c.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Metodos</p>
                              <div className="space-y-1">
                                {p.meansCards.map(c => (
                                  <div key={c.id} className="text-sm text-white bg-slate-700/50 px-2 py-1 rounded">
                                    {c.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Accusation Button */}
            {canAccuse && (
              <button
                onClick={handleOpenAccusation}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all"
              >
                Hacer Acusacion (Solo tienes 1!)
              </button>
            )}

            {player?.hasAccused && (
              <p className="text-center text-slate-400">Ya usaste tu unica acusacion</p>
            )}

            {/* Next Round button for FS */}
            {isForensicScientist && game.currentRound < game.maxRounds && (
              <button
                onClick={nextRound}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
              >
                Siguiente Ronda
              </button>
            )}

            {isForensicScientist && game.currentRound >= game.maxRounds && (
              <button
                onClick={nextRound}
                className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
              >
                Terminar Juego (Ultima Ronda)
              </button>
            )}
          </div>
        );

      case 'finished':
        return (
          <div className="space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-4">
                {game.winner === 'investigators' ? '🎉' : '💀'}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${game.winner === 'investigators' ? 'text-green-400' : 'text-red-400'}`}>
                {game.winner === 'investigators' ? 'Investigadores Ganan!' : 'El Asesino Gana!'}
              </h2>
              <p className="text-slate-400">{game.winReason}</p>
            </motion.div>

            {/* Solution Reveal */}
            {game.solution && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">La Solucion</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Asesino:</span>
                    <span className="text-red-400 font-medium">
                      {game.players.find(p => p.id === game.solution?.murdererPlayerId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Evidencia:</span>
                    <span className="text-white font-medium">
                      {game.players.find(p => p.id === game.solution?.murdererPlayerId)
                        ?.clueCards.find(c => c.id === game.solution?.keyEvidenceId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Metodo:</span>
                    <span className="text-white font-medium">
                      {game.players.find(p => p.id === game.solution?.murdererPlayerId)
                        ?.meansCards.find(c => c.id === game.solution?.meansOfMurderId)?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* All Roles */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Roles de Todos</h3>
              <div className="space-y-2">
                {game.players.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-white flex-1">{p.name}</span>
                    <span className={`text-sm font-medium ${getRoleColor(p.role)}`}>
                      {p.role ? getRoleName(p.role) : 'Desconocido'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accusations History */}
            {game.allAccusations.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Historial de Acusaciones</h3>
                <div className="space-y-2">
                  {game.allAccusations.map((acc, i) => (
                    <div key={i} className={`p-2 rounded-lg ${acc.isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      <p className="text-white text-sm">
                        <span className="font-medium">{acc.accuserName}</span> acuso a{' '}
                        <span className="font-medium">{acc.targetPlayerName}</span>
                      </p>
                      <p className="text-slate-400 text-xs">
                        {acc.clueCardName} + {acc.meansCardName}
                      </p>
                      <p className={`text-xs ${acc.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {acc.isCorrect ? 'CORRECTO!' : 'Incorrecto'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            {isHost && (
              <button
                onClick={resetGame}
                className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all"
              >
                Nueva Partida
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 p-4 pb-20 safe-area-top safe-area-bottom">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/asesinato-hk" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Asesinato en HK</h1>
            <p className="text-xs text-slate-400">{roomCode}</p>
          </div>
          <AsesinatoHelperToggle isEnabled={helperEnabled} onToggle={toggleHelper} />
        </div>

        {/* Dynamic Helper Banner */}
        {!helperDismissed && (
          <AsesinatoHelper
            phase={game.phase}
            role={player?.role || null}
            isEnabled={helperEnabled}
            onDismiss={() => setHelperDismissed(true)}
          />
        )}

        {/* Player Role Badge - Hidden behind hold gesture */}
        {player?.role && game.phase !== 'lobby' && game.phase !== 'roleReveal' && game.phase !== 'finished' && (
          <div className="flex justify-center mb-4">
            <RoleReveal
              role={player.role}
              roleName={getRoleName(player.role)}
              roleDescription={getRoleDescription(player.role)}
              compact
            />
          </div>
        )}

        {/* Main Content */}
        {renderPhaseContent()}
      </div>

      {/* Accusation Modal */}
      <AnimatePresence>
        {showAccusationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAccusationModal(false); resetAccusationState(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {accusationStep === 'player' && 'Paso 1: Elige al sospechoso'}
                {accusationStep === 'clue' && 'Paso 2: Elige la evidencia'}
                {accusationStep === 'means' && 'Paso 3: Elige el metodo'}
                {accusationStep === 'confirm' && 'Confirmar acusacion'}
              </h2>

              {accusationStep === 'player' && (
                <div className="space-y-2">
                  {game?.players.filter(p => p.id !== playerId).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { playClickSound(); setAccusationTarget(p); setAccusationStep('clue'); }}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <span className="text-2xl">{p.avatar}</span>
                      <span className="text-white">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {accusationStep === 'clue' && accusationTarget && (
                <div className="space-y-2">
                  <p className="text-slate-400 mb-2">Evidencias de {accusationTarget.name}:</p>
                  {accusationTarget.clueCards.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { playClickSound(); setAccusationClue(c); setAccusationStep('means'); }}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors"
                    >
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-slate-400 text-sm">{c.category}</p>
                    </button>
                  ))}
                </div>
              )}

              {accusationStep === 'means' && accusationTarget && (
                <div className="space-y-2">
                  <p className="text-slate-400 mb-2">Metodos de {accusationTarget.name}:</p>
                  {accusationTarget.meansCards.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { playClickSound(); setAccusationMeans(c); setAccusationStep('confirm'); }}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors"
                    >
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-slate-400 text-sm">{c.category}</p>
                    </button>
                  ))}
                </div>
              )}

              {accusationStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Acusado:</span>
                      <span className="text-white font-medium">{accusationTarget?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Evidencia:</span>
                      <span className="text-white font-medium">{accusationClue?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Metodo:</span>
                      <span className="text-white font-medium">{accusationMeans?.name}</span>
                    </div>
                  </div>

                  <p className="text-amber-400 text-sm text-center">
                    Solo tienes UNA acusacion. Esta seguro?
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowAccusationModal(false); resetAccusationState(); }}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAccuse}
                      className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Acusar!
                    </button>
                  </div>
                </div>
              )}

              {accusationStep !== 'player' && accusationStep !== 'confirm' && (
                <button
                  onClick={() => {
                    if (accusationStep === 'clue') {
                      setAccusationTarget(null);
                      setAccusationStep('player');
                    } else if (accusationStep === 'means') {
                      setAccusationClue(null);
                      setAccusationStep('clue');
                    }
                  }}
                  className="mt-4 w-full py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Volver
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replace Tile Modal */}
      <AnimatePresence>
        {showReplaceTileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowReplaceTileModal(false); setTileToReplace(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-4">Elegir nueva ficha</h2>
              <div className="space-y-2">
                {game?.availableSceneTiles.map(tile => (
                  <button
                    key={tile.id}
                    onClick={async () => {
                      if (tileToReplace) {
                        await replaceTile(tileToReplace, tile.id);
                      }
                      setShowReplaceTileModal(false);
                      setTileToReplace(null);
                    }}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors"
                  >
                    <p className="text-white font-medium">{tile.title}</p>
                    <p className="text-slate-400 text-xs">{tile.options.join(' / ')}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowReplaceTileModal(false); setTileToReplace(null); }}
                className="mt-4 w-full py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Accusation Result Toast */}
      <AnimatePresence>
        {lastAccusationResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 left-4 right-4 p-4 rounded-xl text-center ${
              lastAccusationResult.isCorrect ? 'bg-green-800' : 'bg-red-800'
            }`}
            onClick={() => setLastAccusationResult(null)}
          >
            <p className="text-white font-semibold">
              {lastAccusationResult.isCorrect
                ? `${lastAccusationResult.accuserName} resolvio el crimen!`
                : `${lastAccusationResult.accuserName} fallo en su acusacion`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Scene Tile Component
function SceneTileComponent({
  tile,
  isForensicScientist,
  onSelect,
  canReplace,
  onReplace,
}: {
  tile: AsesinatoSceneTile;
  isForensicScientist: boolean;
  onSelect: (optionIndex: number) => void;
  canReplace?: boolean;
  onReplace?: () => void;
}) {
  return (
    <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-semibold text-sm">{tile.title}</h4>
        {canReplace && onReplace && tile.isLocked && (
          <button
            onClick={onReplace}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Reemplazar
          </button>
        )}
        {tile.isLocked && !canReplace && (
          <span className="text-xs text-slate-500">Bloqueado</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tile.options.map((option, index) => {
          const isSelected = tile.selectedOption === index;
          const canInteract = isForensicScientist && !tile.isLocked;

          return (
            <button
              key={index}
              onClick={() => canInteract && onSelect(index)}
              disabled={!canInteract}
              className={`
                p-2 rounded-lg text-xs transition-all
                ${isSelected
                  ? 'bg-red-700 text-white border-2 border-red-500'
                  : canInteract
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
                    : 'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
