'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAsesinato } from '@/hooks/useAsesinato';
import { getRoleName, getRoleDescription } from '@/lib/asesinatoLogic';
import type { AsesinatoPlayer, AsesinatoSceneTile, AsesinatoClueCard, AsesinatoMeansCard } from '@/types/game';

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
    startGame,
    proceedToMurderSelection,
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
    await selectSolution(selectedClueCard, selectedMeansCard);
    setSelectedClueCard(null);
    setSelectedMeansCard(null);
  };

  // Handle accusation
  const handleAccuse = async () => {
    if (!accusationTarget || !accusationClue || !accusationMeans) return;
    const result = await accuse(accusationTarget.id, accusationClue.id, accusationMeans.id);
    setLastAccusationResult({ isCorrect: result.isCorrect, accuserName: player?.name || '' });
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
                onClick={startGame}
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
        return (
          <div className="space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Tu Rol</h2>
              <div className={`text-5xl font-bold mb-4 ${getRoleColor(player?.role || null)}`}>
                {player?.role ? getRoleName(player.role) : 'Cargando...'}
              </div>
              <p className="text-slate-400 max-w-md mx-auto">
                {player?.role ? getRoleDescription(player.role) : ''}
              </p>
            </motion.div>

            {/* Role-specific info */}
            {isWitness && (
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4">
                <h3 className="text-purple-400 font-semibold mb-2">Sospechosos que viste:</h3>
                <div className="space-y-2">
                  {game.players.filter(p => p.role === 'murderer' || p.role === 'accomplice').map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-white">
                      <span>{p.avatar}</span>
                      <span>{p.name}</span>
                      <span className={`text-sm ${p.role === 'murderer' ? 'text-red-400' : 'text-orange-400'}`}>
                        ({p.role === 'murderer' ? 'Asesino' : 'Complice'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(isMurderer || isAccomplice) && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold mb-2">Tu equipo criminal:</h3>
                <div className="space-y-2">
                  {game.players.filter(p => p.role === 'murderer' || p.role === 'accomplice').map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-white">
                      <span>{p.avatar}</span>
                      <span>{p.name}</span>
                      <span className={`text-sm ${p.role === 'murderer' ? 'text-red-400' : 'text-orange-400'}`}>
                        ({p.role === 'murderer' ? 'Asesino' : 'Complice'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isHost && (
              <button
                onClick={proceedToMurderSelection}
                className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all"
              >
                Continuar - Seleccion del Crimen
              </button>
            )}
          </div>
        );

      case 'murderSelection':
        return (
          <div className="space-y-6">
            {isMurderer ? (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-400 mb-2">Elige tu Crimen</h2>
                  <p className="text-slate-400">Selecciona UNA evidencia y UN metodo de tus cartas</p>
                </div>

                {/* My Clue Cards */}
                <div>
                  <h3 className="text-white font-semibold mb-2">Tus Evidencias (elige 1)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {player?.clueCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedClueCard(card.id)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedClueCard === card.id
                            ? 'bg-red-800 border-2 border-red-500'
                            : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <p className="text-white font-medium">{card.name}</p>
                        <p className="text-slate-400 text-xs">{card.category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* My Means Cards */}
                <div>
                  <h3 className="text-white font-semibold mb-2">Tus Metodos (elige 1)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {player?.meansCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedMeansCard(card.id)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedMeansCard === card.id
                            ? 'bg-red-800 border-2 border-red-500'
                            : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <p className="text-white font-medium">{card.name}</p>
                        <p className="text-slate-400 text-xs">{card.category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSelectSolution}
                  disabled={!selectedClueCard || !selectedMeansCard}
                  className="w-full py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                >
                  Confirmar Crimen
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌙</div>
                <h2 className="text-2xl font-bold text-white mb-2">Noche de Crimen</h2>
                <p className="text-slate-400">
                  {isForensicScientist
                    ? 'El asesino esta eligiendo su crimen... Pronto conoceras la verdad.'
                    : 'El asesino esta eligiendo su crimen... Cierra los ojos.'}
                </p>
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
                    onSelect={(optionIndex) => selectTileOption(game.causeOfDeathTile!.id, optionIndex)}
                  />
                )}
                {game.locationTile && (
                  <SceneTileComponent
                    tile={game.locationTile}
                    isForensicScientist={isForensicScientist}
                    onSelect={(optionIndex) => selectTileOption(game.locationTile!.id, optionIndex)}
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
                    onSelect={(optionIndex) => selectTileOption(tile.id, optionIndex)}
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
                onClick={confirmClues}
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
                onClick={() => setShowAccusationModal(true)}
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
          <div className="w-6"></div>
        </div>

        {/* Player Role Badge */}
        {player?.role && game.phase !== 'lobby' && (
          <div className={`text-center mb-4 py-2 px-4 rounded-xl bg-slate-800/50 inline-flex items-center gap-2 w-full justify-center ${getRoleColor(player.role)}`}>
            <span className="text-sm">Tu rol:</span>
            <span className="font-bold">{getRoleName(player.role)}</span>
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
                      onClick={() => { setAccusationTarget(p); setAccusationStep('clue'); }}
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
                      onClick={() => { setAccusationClue(c); setAccusationStep('means'); }}
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
                      onClick={() => { setAccusationMeans(c); setAccusationStep('confirm'); }}
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
        {canReplace && onReplace && !tile.isLocked && (
          <button
            onClick={onReplace}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Reemplazar
          </button>
        )}
        {tile.isLocked && (
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
