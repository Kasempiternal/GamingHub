'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWavelength } from '@/hooks/useWavelength';
import { RadialDial } from '@/components/wavelength/RadialDial';
import { TeamScoreboard } from '@/components/wavelength/TeamScoreboard';
import { CounterGuessButtons } from '@/components/wavelength/CounterGuessButtons';
import { GuessReveal } from '@/components/wavelength/GuessReveal';
import type { WavelengthTeam } from '@/types/game';

export default function WavelengthRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [clueInput, setClueInput] = useState('');
  const [currentGuess, setCurrentGuess] = useState(50);

  // Load player ID from localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`wavelength_player_${roomCode}`);
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      // Redirect to join page if no player ID
      router.push(`/wavelength/unirse/${roomCode}`);
    }
  }, [roomCode, router]);

  const {
    game,
    player,
    loading,
    error,
    isHost,
    isPsychic,
    isMyTeamsTurn,
    myTeam,
    joinTeam,
    startGame,
    submitClue,
    submitGuess,
    submitCounter,
    skipCounter,
    reveal,
    nextRound,
    resetGame,
  } = useWavelength(roomCode, playerId);

  // Handle share
  const handleShare = async () => {
    const url = `${window.location.origin}/wavelength/unirse/${roomCode}`;
    if (navigator.share) {
      await navigator.share({
        title: 'Longitud de Onda',
        text: `¡Únete a mi partida! Código: ${roomCode}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('¡Enlace copiado!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📻</div>
          <p className="text-white/60">Cargando partida...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">😕</div>
          <p className="text-white">{error || 'Partida no encontrada'}</p>
          <Link
            href="/wavelength"
            className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const opposingTeam = myTeam === 'red' ? 'blue' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/wavelength" className="text-white/60 hover:text-white">
            ← Salir
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold">{roomCode}</span>
            <button
              onClick={handleShare}
              className="p-2 text-white/60 hover:text-white"
              title="Compartir"
            >
              📤
            </button>
          </div>
          <div className="text-white/60 text-sm">
            {game.players.length} jugadores
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* LOBBY PHASE */}
        {game.phase === 'lobby' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Elige tu equipo</h2>

            {/* Team selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Red team */}
              <div
                onClick={() => joinTeam('red')}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  myTeam === 'red'
                    ? 'bg-red-500/30 ring-2 ring-red-500'
                    : 'bg-red-500/10 hover:bg-red-500/20'
                }`}
              >
                <h3 className="text-red-400 font-bold text-center mb-3">Equipo Rojo</h3>
                <div className="space-y-2">
                  {game.players
                    .filter(p => p.team === 'red')
                    .map(p => (
                      <div
                        key={p.id}
                        className={`text-sm px-3 py-1 rounded-full text-center ${
                          p.id === playerId
                            ? 'bg-red-500 text-white'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {p.avatar} {p.name}
                        {p.isHost && ' 👑'}
                      </div>
                    ))}
                  {game.redTeam.length === 0 && (
                    <p className="text-red-400/50 text-center text-sm">Sin jugadores</p>
                  )}
                </div>
              </div>

              {/* Blue team */}
              <div
                onClick={() => joinTeam('blue')}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  myTeam === 'blue'
                    ? 'bg-blue-500/30 ring-2 ring-blue-500'
                    : 'bg-blue-500/10 hover:bg-blue-500/20'
                }`}
              >
                <h3 className="text-blue-400 font-bold text-center mb-3">Equipo Azul</h3>
                <div className="space-y-2">
                  {game.players
                    .filter(p => p.team === 'blue')
                    .map(p => (
                      <div
                        key={p.id}
                        className={`text-sm px-3 py-1 rounded-full text-center ${
                          p.id === playerId
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {p.avatar} {p.name}
                        {p.isHost && ' 👑'}
                      </div>
                    ))}
                  {game.blueTeam.length === 0 && (
                    <p className="text-blue-400/50 text-center text-sm">Sin jugadores</p>
                  )}
                </div>
              </div>
            </div>

            {/* Unassigned players */}
            {game.players.filter(p => !p.team).length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-white/60 text-sm mb-2 text-center">Sin equipo</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {game.players
                    .filter(p => !p.team)
                    .map(p => (
                      <span
                        key={p.id}
                        className={`text-sm px-3 py-1 rounded-full ${
                          p.id === playerId
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {p.avatar} {p.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Start button */}
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                disabled={game.redTeam.length < 2 || game.blueTeam.length < 2}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {game.redTeam.length < 2 || game.blueTeam.length < 2
                  ? 'Necesitas 2+ jugadores por equipo'
                  : '¡Comenzar Partida!'}
              </motion.button>
            )}

            {!isHost && (
              <p className="text-center text-white/60">
                Esperando a que el host inicie la partida...
              </p>
            )}
          </div>
        )}

        {/* GAME PHASES */}
        {game.phase !== 'lobby' && game.phase !== 'finished' && (
          <>
            {/* Scoreboard */}
            <TeamScoreboard
              redScore={game.redScore}
              blueScore={game.blueScore}
              targetScore={game.targetScore}
              currentTeam={game.currentTeam}
              redTeamNames={game.players.filter(p => p.team === 'red').map(p => p.name)}
              blueTeamNames={game.players.filter(p => p.team === 'blue').map(p => p.name)}
              psychicId={game.currentRound?.psychicId}
              players={game.players}
            />

            {/* Current round info */}
            {game.currentRound && (
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm">Ronda {game.currentRound.roundNumber}</p>
                {game.currentRound.clue && (
                  <p className="text-2xl font-bold text-cyan-400 mt-2">
                    &quot;{game.currentRound.clue}&quot;
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* PSYCHIC CLUE PHASE */}
        {game.phase === 'psychicClue' && game.currentRound && (
          <div className="space-y-6">
            {isPsychic ? (
              <>
                <div className="text-center">
                  <p className="text-cyan-400 font-bold text-lg mb-2">¡Eres el Psíquico!</p>
                  <p className="text-white/70">Da una pista para que tu equipo adivine la posición</p>
                </div>

                {/* Show dial with target to psychic */}
                <RadialDial
                  leftConcept={game.currentRound.spectrumCard.leftConcept}
                  rightConcept={game.currentRound.spectrumCard.rightConcept}
                  targetPosition={game.currentRound.targetPosition}
                  showTarget={true}
                  currentGuess={game.currentRound.targetPosition}
                  interactive={false}
                  size={280}
                />

                {/* Clue input */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Escribe tu pista..."
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    maxLength={30}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      submitClue(clueInput);
                      setClueInput('');
                    }}
                    disabled={!clueInput.trim()}
                    className="w-full py-3 bg-cyan-500 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    Enviar Pista
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔮</div>
                <p className="text-white/70">
                  El psíquico está pensando en una pista...
                </p>
                <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
                  <p className="text-white/40 text-sm">Espectro:</p>
                  <p className="text-cyan-400">
                    {game.currentRound.spectrumCard.leftConcept} ↔ {game.currentRound.spectrumCard.rightConcept}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEAM GUESS PHASE */}
        {game.phase === 'teamGuess' && game.currentRound && (
          <div className="space-y-6">
            <div className="text-center">
              <p className={`font-bold text-lg ${isMyTeamsTurn ? 'text-cyan-400' : 'text-white/60'}`}>
                {isMyTeamsTurn
                  ? isPsychic
                    ? 'Tu equipo está adivinando...'
                    : '¡Es tu turno de adivinar!'
                  : 'El otro equipo está adivinando...'}
              </p>
            </div>

            <RadialDial
              leftConcept={game.currentRound.spectrumCard.leftConcept}
              rightConcept={game.currentRound.spectrumCard.rightConcept}
              targetPosition={game.currentRound.targetPosition}
              showTarget={isPsychic}
              currentGuess={currentGuess}
              onGuessChange={setCurrentGuess}
              interactive={isMyTeamsTurn && !isPsychic}
              size={280}
            />

            {isMyTeamsTurn && !isPsychic && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => submitGuess(currentGuess)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl"
              >
                Confirmar: {Math.round(currentGuess)}
              </motion.button>
            )}
          </div>
        )}

        {/* COUNTER GUESS PHASE */}
        {game.phase === 'counterGuess' && game.currentRound && (
          <div className="space-y-6">
            {myTeam !== game.currentTeam ? (
              <>
                <div className="text-center">
                  <p className="text-cyan-400 font-bold text-lg">¡Tu turno de contra-adivinar!</p>
                </div>

                <RadialDial
                  leftConcept={game.currentRound.spectrumCard.leftConcept}
                  rightConcept={game.currentRound.spectrumCard.rightConcept}
                  showTarget={false}
                  currentGuess={game.currentRound.teamGuess || 50}
                  interactive={false}
                  size={280}
                />

                <CounterGuessButtons
                  onSelect={submitCounter}
                  teamGuess={game.currentRound.teamGuess || 50}
                  leftConcept={game.currentRound.spectrumCard.leftConcept}
                  rightConcept={game.currentRound.spectrumCard.rightConcept}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-white/70">El equipo contrario está contra-adivinando...</p>
                <p className="text-white/40 mt-2">
                  Tu respuesta: {game.currentRound.teamGuess}
                </p>
              </div>
            )}

            {isHost && (
              <button
                onClick={skipCounter}
                className="w-full py-2 text-white/40 hover:text-white/60 text-sm"
              >
                Saltar contra-adivinanza
              </button>
            )}
          </div>
        )}

        {/* REVEAL PHASE */}
        {game.phase === 'reveal' && game.currentRound && (
          <div className="space-y-6">
            <RadialDial
              leftConcept={game.currentRound.spectrumCard.leftConcept}
              rightConcept={game.currentRound.spectrumCard.rightConcept}
              targetPosition={game.currentRound.targetPosition}
              showTarget={true}
              currentGuess={game.currentRound.teamGuess || 50}
              interactive={false}
              revealMode={true}
              size={280}
            />

            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reveal}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl"
              >
                Revelar Resultado
              </motion.button>
            )}
          </div>
        )}

        {/* ROUND END PHASE */}
        {game.phase === 'roundEnd' && game.currentRound && (
          <div className="space-y-6">
            <GuessReveal round={game.currentRound} currentTeam={game.currentTeam} />

            <RadialDial
              leftConcept={game.currentRound.spectrumCard.leftConcept}
              rightConcept={game.currentRound.spectrumCard.rightConcept}
              targetPosition={game.currentRound.targetPosition}
              showTarget={true}
              currentGuess={game.currentRound.teamGuess || 50}
              interactive={false}
              size={240}
            />

            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextRound}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl"
              >
                Siguiente Ronda →
              </motion.button>
            )}
          </div>
        )}

        {/* FINISHED PHASE */}
        {game.phase === 'finished' && game.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="text-6xl">🏆</div>
            <h2 className={`text-3xl font-bold ${
              game.winner === 'red' ? 'text-red-400' : 'text-blue-400'
            }`}>
              ¡Equipo {game.winner === 'red' ? 'Rojo' : 'Azul'} gana!
            </h2>

            <div className="flex justify-center gap-8 text-xl">
              <div className="text-center">
                <div className="text-red-400 font-bold">{game.redScore}</div>
                <div className="text-white/40 text-sm">Rojo</div>
              </div>
              <div className="text-white/40">vs</div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">{game.blueScore}</div>
                <div className="text-white/40 text-sm">Azul</div>
              </div>
            </div>

            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetGame}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl"
              >
                Jugar de Nuevo
              </motion.button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
