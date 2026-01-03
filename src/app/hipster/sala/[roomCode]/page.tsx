'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useHipster } from '@/hooks/useHipster';
import type { HipsterSong, HipsterPlayer } from '@/types/game';
import { HIPSTER_CONFIG } from '@/types/game';
import { NavigationMenu } from '@/components/shared/NavigationMenu';

// Music-themed animated background
function MusicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#1A0A24]">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(156,39,176,0.15) 0%, transparent 70%)', top: '-20%', left: '-10%' }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(233,30,99,0.12) 0%, transparent 70%)', top: '30%', right: '-15%' }}
        animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// QR Code component
function QRCode({ roomCode }: { roomCode: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/hipster/unirse/${roomCode}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}&bgcolor=1A0A24&color=9C27B0`;

  return (
    <div className="flex flex-col items-center">
      <img src={qrUrl} alt="QR Code" className="w-24 h-24 rounded-lg" />
      <p className="text-purple-400/60 text-xs mt-2">Escanea para unirte</p>
    </div>
  );
}

// Audio Player Component - Uses iTunes 30-second previews
function AudioPlayer({ previewUrl, isPlaying, onEnded }: {
  previewUrl: string;
  isPlaying: boolean;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setProgress(100);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <audio ref={audioRef} src={previewUrl} preload="auto" />
      <div className="h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-purple-400/60 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

// Song Search Component - Uses iTunes API
function SongSearch({ onAddSong, addedSongs, maxSongs, addedSongIds }: {
  onAddSong: (song: Omit<HipsterSong, 'addedBy' | 'addedAt'>) => void;
  addedSongs: number;
  maxSongs: number;
  addedSongIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Omit<HipsterSong, 'addedBy' | 'addedAt'>[]>([]);
  const [searching, setSearching] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      setRateLimited(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/hipster/itunes/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.tracks);
        setRateLimited(data.rateLimited || false);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  }, [query]);

  // Debounced search (500ms to reduce API calls)
  useEffect(() => {
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Filter out already-added songs
  const filteredResults = results.filter(track => !addedSongIds.includes(track.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cancion..."
          className="flex-1 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-400"
        />
        <span className="text-purple-400/60 text-sm whitespace-nowrap">
          {addedSongs}/{maxSongs}
        </span>
      </div>

      {searching && (
        <div className="text-center py-4">
          <motion.div
            className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {rateLimited && !searching && (
        <div className="text-center py-2 text-amber-400/80 text-sm">
          ⏳ Demasiadas busquedas. Espera un momento...
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredResults.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors"
          >
            <img src={track.albumArt} alt="" className="w-12 h-12 rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{track.title}</p>
              <p className="text-purple-400/60 text-sm truncate">{track.artist} • {track.releaseYear}</p>
            </div>
            <button
              onClick={() => onAddSong(track)}
              disabled={addedSongs >= maxSongs}
              className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </motion.div>
        ))}
        {!searching && query.length >= 2 && filteredResults.length === 0 && results.length > 0 && (
          <p className="text-purple-400/50 text-sm text-center py-2">
            Todas las canciones ya fueron añadidas
          </p>
        )}
      </div>
    </div>
  );
}

// Player List Component
function PlayerList({
  players,
  currentPlayerId,
  isHost = false,
  onRemovePlayer
}: {
  players: HipsterPlayer[];
  currentPlayerId: string | null;
  isHost?: boolean;
  onRemovePlayer?: (playerId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-2 p-2 rounded-lg ${
            player.id === currentPlayerId ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
          }`}
        >
          <span className="text-2xl">{player.avatar}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {player.name}
              {player.isHost && <span className="text-purple-400 ml-1">★</span>}
            </p>
            <p className="text-purple-400/50 text-xs">
              {player.songsAdded} canciones
              {player.isReady && <span className="text-green-400 ml-1">✓</span>}
            </p>
          </div>
          {/* Remove button - only shown for host and non-host players */}
          {isHost && onRemovePlayer && !player.isHost && (
            <button
              onClick={() => onRemovePlayer(player.id)}
              className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Eliminar jugador"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Timeline Component - Groups same-year songs together
function Timeline({ timeline, onSelectPosition, selectedPosition, selectedType, isInteractive }: {
  timeline: { song: HipsterSong }[];
  onSelectPosition?: (position: number, type: 'slot' | 'year') => void;
  selectedPosition?: number | null;
  selectedType?: 'slot' | 'year' | null;
  isInteractive?: boolean;
}) {
  const sortedTimeline = [...timeline].sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  if (sortedTimeline.length === 0) {
    return (
      <div className="text-center py-8 text-purple-400/50">
        Tu linea temporal esta vacia
      </div>
    );
  }

  // Group cards by year
  const yearGroups: { year: number; cards: { song: HipsterSong }[]; startIndex: number }[] = [];
  let currentGroup: { year: number; cards: { song: HipsterSong }[]; startIndex: number } | null = null;

  sortedTimeline.forEach((card, index) => {
    if (!currentGroup || currentGroup.year !== card.song.releaseYear) {
      currentGroup = { year: card.song.releaseYear, cards: [card], startIndex: index };
      yearGroups.push(currentGroup);
    } else {
      currentGroup.cards.push(card);
    }
  });

  return (
    <div
      className="flex gap-2 overflow-x-auto py-4 px-2 scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Insert before first year */}
      {isInteractive && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectPosition?.(0, 'slot')}
          className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center ${
            selectedPosition === 0 && selectedType === 'slot' ? 'border-purple-400 bg-purple-400/20' : 'border-purple-400/30'
          }`}
        >
          <span className="text-purple-400/50 text-2xl">+</span>
        </motion.button>
      )}

      {yearGroups.map((group, groupIndex) => {
        // Position after this group (for inserting between groups)
        const positionAfterGroup = group.startIndex + group.cards.length;

        const isYearSelected = selectedPosition === positionAfterGroup && selectedType === 'year';
        const isSlotSelected = selectedPosition === positionAfterGroup && selectedType === 'slot';

        return (
          <div key={group.year} className="flex items-center gap-2 flex-shrink-0">
            {/* Year group - clickable for "same year" selection */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isInteractive ? { scale: 1.05 } : {}}
              whileTap={isInteractive ? { scale: 0.95 } : {}}
              onClick={() => isInteractive && onSelectPosition?.(positionAfterGroup, 'year')}
              className={`flex-shrink-0 rounded-lg p-1.5 text-center transition-colors ${
                isInteractive ? 'cursor-pointer' : ''
              } ${
                isYearSelected
                  ? 'bg-green-500/30 border-2 border-green-400'
                  : 'bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30'
              }`}
              style={{ minWidth: group.cards.length > 1 ? '3.5rem' : '3rem' }}
            >
              {/* Stacked album arts for same-year songs */}
              <div className={`relative ${group.cards.length > 1 ? 'h-12' : ''}`}>
                {group.cards.map((card, cardIndex) => (
                  card.song.albumArt ? (
                    <img
                      key={card.song.id}
                      src={card.song.albumArt}
                      alt=""
                      className={`rounded-md ${
                        group.cards.length > 1
                          ? 'absolute w-10 h-10 border border-slate-900'
                          : 'w-10 h-10'
                      }`}
                      style={
                        group.cards.length > 1
                          ? { left: `${cardIndex * 8}px`, top: `${cardIndex * 6}px`, zIndex: cardIndex }
                          : undefined
                      }
                    />
                  ) : (
                    <div
                      key={card.song.id}
                      className={`rounded-md bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ${
                        group.cards.length > 1
                          ? 'absolute w-10 h-10 border border-slate-900'
                          : 'w-10 h-10'
                      }`}
                      style={
                        group.cards.length > 1
                          ? { left: `${cardIndex * 8}px`, top: `${cardIndex * 6}px`, zIndex: cardIndex }
                          : undefined
                      }
                    >
                      <span className="text-lg">🎵</span>
                    </div>
                  )
                ))}
              </div>
              <p className="text-white text-[10px] font-bold mt-1">
                {group.year}
                {group.cards.length > 1 && (
                  <span className="text-purple-400/60 ml-1">×{group.cards.length}</span>
                )}
              </p>
            </motion.div>

            {/* Insert slot between year groups - for "after" selection */}
            {isInteractive && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectPosition?.(positionAfterGroup, 'slot')}
                className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center ${
                  isSlotSelected ? 'border-purple-400 bg-purple-400/20' : 'border-purple-400/30'
                }`}
              >
                <span className="text-purple-400/50 text-2xl">+</span>
              </motion.button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Main Room Component
export default function HipsterRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const {
    game,
    playerId,
    loading,
    error,
    confirmMusicReady,
    startCollecting,
    addSong,
    playerReady,
    startGame,
    startListening,
    skipTurn,
    submitGuess,
    submitBonus,
    skipBonus,
    intercept,
    interceptTimeout,
    resolveIntercept,
    nextTurn,
    resetGame,
    removePlayer,
  } = useHipster();

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [guessCountdown, setGuessCountdown] = useState<number>(0);

  // Stop audio when turn phase changes (except when moving to guessing)
  useEffect(() => {
    if (game?.currentTurn?.phase !== 'listening' && game?.currentTurn?.phase !== 'guessing' && game?.currentTurn?.phase !== 'intercepting') {
      setIsAudioPlaying(false);
    }
  }, [game?.currentTurn?.phase]);

  // Intercept countdown timer - handles both deciding and selecting phases
  useEffect(() => {
    if (game?.currentTurn?.phase !== 'intercepting') {
      setInterceptCountdown(0);
      setShowInterceptUI(false);
      setInterceptPosition(null);
      return;
    }

    const interceptPhase = game?.currentTurn?.interceptPhase ?? 'deciding';
    const isCurrentPlayersTurn = game?.currentTurn?.playerId === playerId;
    const isInterceptor = game?.currentTurn?.interceptingPlayerId === playerId;

    const updateCountdown = () => {
      // Use the appropriate deadline based on phase
      const deadline = interceptPhase === 'selecting'
        ? game.currentTurn!.selectingDeadline
        : game.currentTurn!.interceptDeadline;

      if (!deadline) {
        setInterceptCountdown(0);
        return;
      }

      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setInterceptCountdown(remaining);

      // Auto-handle when countdown reaches 0
      if (remaining === 0) {
        if (interceptPhase === 'selecting' && isInterceptor) {
          // Interceptor failed to select in time - they lose token
          interceptTimeout();
        } else if (interceptPhase === 'deciding' && isCurrentPlayersTurn) {
          // No one intercepted - resolve normally
          resolveIntercept();
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [game?.currentTurn?.phase, game?.currentTurn?.interceptDeadline, game?.currentTurn?.selectingDeadline, game?.currentTurn?.interceptPhase, game?.currentTurn?.interceptingPlayerId, game?.currentTurn?.playerId, playerId, resolveIntercept, interceptTimeout]);

  // Guess countdown timer (60 seconds)
  useEffect(() => {
    if (game?.currentTurn?.phase !== 'guessing' || !game?.currentTurn?.guessDeadline) {
      setGuessCountdown(0);
      return;
    }

    const isCurrentPlayersTurn = game?.currentTurn?.playerId === playerId;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((game.currentTurn!.guessDeadline! - Date.now()) / 1000));
      setGuessCountdown(remaining);

      // Auto-skip turn when countdown reaches 0
      if (remaining === 0 && isCurrentPlayersTurn) {
        skipTurn();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [game?.currentTurn?.phase, game?.currentTurn?.guessDeadline, game?.currentTurn?.playerId, playerId, skipTurn]);

  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'slot' | 'year' | null>(null);
  const [bonusArtist, setBonusArtist] = useState('');
  const [bonusTitle, setBonusTitle] = useState('');
  const [interceptPosition, setInterceptPosition] = useState<number | null>(null);
  const [showInterceptUI, setShowInterceptUI] = useState(false);
  const [interceptCountdown, setInterceptCountdown] = useState<number>(0);
  const [interceptClaimError, setInterceptClaimError] = useState<string | null>(null);
  const [showInterceptClaimed, setShowInterceptClaimed] = useState(false);
  const interceptRef = useRef<HTMLDivElement>(null);
  const prevInterceptingPlayerId = useRef<string | null>(null);

  // Auto-scroll to intercept UI when phase starts
  useEffect(() => {
    if (game?.currentTurn?.phase === 'intercepting' && interceptRef.current) {
      interceptRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [game?.currentTurn?.phase]);

  // Detect when someone claims the intercept (real-time feedback)
  useEffect(() => {
    const currentInterceptor = game?.currentTurn?.interceptingPlayerId;

    // Someone just claimed the intercept (and it wasn't already claimed before)
    if (currentInterceptor && !prevInterceptingPlayerId.current) {
      // Show notification if it's not the current player who claimed
      if (currentInterceptor !== playerId) {
        setShowInterceptClaimed(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowInterceptClaimed(false), 3000);
      }
    }

    // Reset when intercept phase ends
    if (!game?.currentTurn?.phase || game.currentTurn.phase !== 'intercepting') {
      setShowInterceptClaimed(false);
      setInterceptClaimError(null);
    }

    prevInterceptingPlayerId.current = currentInterceptor ?? null;
  }, [game?.currentTurn?.interceptingPlayerId, game?.currentTurn?.phase, playerId]);

  // Rejoin game if not connected
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('hipsterPlayerId');
    const storedRoomCode = sessionStorage.getItem('hipsterRoomCode');

    if (storedRoomCode !== roomCode) {
      // New room, redirect to join
      router.push(`/hipster/unirse/${roomCode}`);
    }
  }, [roomCode, router]);

  // Auto-play audio for host when turn player starts listening (phase becomes 'guessing')
  const currentPlayerForAudio = game?.players.find(p => p.id === playerId);
  const isHostForAudio = currentPlayerForAudio?.isHost ?? false;
  useEffect(() => {
    if (isHostForAudio && game?.currentTurn?.phase === 'guessing' && !isAudioPlaying) {
      setIsAudioPlaying(true);
    }
  }, [isHostForAudio, game?.currentTurn?.phase, isAudioPlaying]);

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <MusicBackground />
        <NavigationMenu currentGame="hipster" roomCode={roomCode} />
        <div className="text-center">
          {loading ? (
            <motion.div
              className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <div className="text-purple-400">Cargando sala...</div>
          )}
        </div>
      </main>
    );
  }

  const currentPlayer = game.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;
  const isMyTurn = game.currentTurn?.playerId === playerId;

  // LOBBY PHASE
  if (game.phase === 'lobby') {
    return (
      <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
        <MusicBackground />
        <NavigationMenu currentGame="hipster" roomCode={roomCode} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/hipster" className="text-purple-400/70 hover:text-purple-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Sala {roomCode}</h1>
            <p className="text-purple-400/60 text-sm">Esperando jugadores...</p>
          </div>
          <div className="w-6" />
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <QRCode roomCode={roomCode} />
          </div>

          {/* Players */}
          <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-purple-300 text-sm font-medium mb-3 uppercase tracking-wider">
              Jugadores ({game.players.length}/{HIPSTER_CONFIG.maxPlayers})
            </h3>
            <PlayerList
              players={game.players}
              currentPlayerId={playerId}
              isHost={isHost}
              onRemovePlayer={removePlayer}
            />
          </div>

          {/* Music Setup (Host only) */}
          {isHost && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-3 uppercase tracking-wider">Musica</h3>
              {game.musicReady ? (
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Audio listo</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-purple-400/60 text-sm">
                    Asegurate de que el audio de tu dispositivo funciona
                  </p>
                  <button
                    onClick={confirmMusicReady}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="text-xl">🎵</span>
                    Confirmar Audio Listo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Start Button */}
          {isHost && game.musicReady && game.players.length >= HIPSTER_CONFIG.minPlayers && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startCollecting}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
            >
              Empezar a Elegir Canciones
            </motion.button>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2">
              {error}
            </div>
          )}
        </div>
      </main>
    );
  }

  // COLLECTING PHASE
  if (game.phase === 'collecting') {
    const allReady = game.players.every(p => p.isReady);

    return (
      <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
        <MusicBackground />
        <NavigationMenu currentGame="hipster" roomCode={roomCode} />

        <div className="max-w-md mx-auto space-y-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white">Elige Canciones</h1>
            <p className="text-purple-400/60 text-sm">
              Pool: {game.songPool.length} canciones
            </p>
          </div>

          {/* Search */}
          <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <SongSearch
              onAddSong={(song) => addSong(song)}
              addedSongs={currentPlayer?.songsAdded ?? 0}
              maxSongs={game.songsPerPlayer}
              addedSongIds={game.songPool.map(s => s.id)}
            />
          </div>

          {/* My Songs */}
          {currentPlayer && currentPlayer.contributedSongs.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-3">Mis Canciones</h3>
              <div className="space-y-2">
                {game.songPool
                  .filter(s => s.addedBy === playerId)
                  .map(song => (
                    <div key={song.id} className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg">
                      <img src={song.albumArt} alt="" className="w-10 h-10 rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{song.title}</p>
                        <p className="text-purple-400/50 text-xs truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Players Status */}
          <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-purple-300 text-sm font-medium mb-3">Jugadores</h3>
            <PlayerList players={game.players} currentPlayerId={playerId} />
          </div>

          {/* Ready / Start */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={playerReady}
              disabled={loading || (currentPlayer?.songsAdded ?? 0) < 1}
              className={`flex-1 py-3 rounded-xl font-medium ${
                currentPlayer?.isReady
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              }`}
            >
              {currentPlayer?.isReady ? '✓ Listo' : 'Estoy Listo'}
            </motion.button>

            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                disabled={loading || !allReady}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl disabled:opacity-50"
              >
                Empezar
              </motion.button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // PLAYING PHASE
  if (game.phase === 'playing' && game.currentTurn) {
    const turnPlayer = game.players.find(p => p.id === game.currentTurn?.playerId);

    return (
      <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
        <MusicBackground />
        <NavigationMenu currentGame="hipster" roomCode={roomCode} />

        <div className="max-w-md mx-auto space-y-4">
          {/* Turn Banner */}
          <div className={`p-4 rounded-xl ${
            isMyTurn ? 'bg-green-500/20 border-2 border-green-500' : 'bg-purple-500/10 border border-purple-500/20'
          }`}>
            {isMyTurn ? (
              <div className="text-center">
                <span className="text-3xl">🎯</span>
                <p className="text-green-400 font-bold text-lg">¡ES TU TURNO!</p>
                <p className="text-green-300/70 text-sm">
                  {game.currentTurn.phase === 'listening' && 'Escucha la cancion y prepara tu respuesta'}
                  {game.currentTurn.phase === 'guessing' && 'Selecciona donde va en tu linea temporal'}
                  {game.currentTurn.phase === 'intercepting' && 'Esperando interceptaciones...'}
                  {game.currentTurn.phase === 'bonus' && 'Adivina artista y titulo para ganar token'}
                  {game.currentTurn.phase === 'result' && 'Revisa el resultado'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-purple-400/60 text-sm">Turno de</p>
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <span className="text-3xl">{turnPlayer?.avatar}</span>
                  {turnPlayer?.name}
                </h2>
              </div>
            )}
          </div>

          {/* Non-turn player: Show turn player's timeline for strategic viewing during listening/guessing */}
          {!isMyTurn && turnPlayer && (game.currentTurn.phase === 'listening' || game.currentTurn.phase === 'guessing') && (
            <div className="bg-slate-900/40 backdrop-blur rounded-xl p-3 border border-purple-500/10">
              <p className="text-purple-400/60 text-xs mb-2">
                Linea temporal de {turnPlayer.name} ({turnPlayer.timeline.length} cartas)
              </p>
              <Timeline
                timeline={turnPlayer.timeline}
                isInteractive={false}
              />
            </div>
          )}

          {/* Spectator Mode: Show minimized own timeline when watching others */}
          {!isMyTurn && currentPlayer && (
            <div className="bg-slate-900/40 backdrop-blur rounded-xl p-3 border border-purple-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400/60 text-xs">
                  Tu linea temporal ({currentPlayer.timeline.length}/{game.cardsToWin})
                </span>
                <span className="text-yellow-400 text-xs">🪙 {currentPlayer.tokens}</span>
              </div>
              {currentPlayer.timeline.length > 0 ? (
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {currentPlayer.timeline.map((card, idx) => (
                    <div
                      key={card.song.id}
                      className="flex-shrink-0 relative w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black overflow-hidden"
                      title={`${card.song.title} - ${card.song.releaseYear}`}
                    >
                      {card.song.albumArt ? (
                        <div
                          className="absolute inset-[15%] rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${card.song.albumArt})` }}
                        />
                      ) : (
                        <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-[8px]">🎵</span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                        <span className="text-white font-bold text-[6px]">{card.song.releaseYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-400/40 text-xs text-center">Sin cartas todavia</p>
              )}
            </div>
          )}

          {/* Phase Progress Indicator */}
          <div className="flex justify-between text-xs px-2">
            <span className={game.currentTurn.phase === 'listening' ? 'text-purple-300 font-bold' : 'text-purple-400/40'}>🎧 Escuchar</span>
            <span className={game.currentTurn.phase === 'guessing' ? 'text-purple-300 font-bold' : 'text-purple-400/40'}>🎯 Colocar</span>
            <span className={game.currentTurn.phase === 'intercepting' ? 'text-yellow-300 font-bold' : 'text-purple-400/40'}>⚡ Intercep.</span>
            <span className={game.currentTurn.phase === 'bonus' ? 'text-green-300 font-bold' : 'text-purple-400/40'}>🎁 Bonus</span>
            <span className={game.currentTurn.phase === 'result' ? 'text-purple-300 font-bold' : 'text-purple-400/40'}>📊 Result</span>
          </div>

          {/* Current Song - visible to ALL players during listening/guessing/intercepting */}
          {(game.currentTurn.phase === 'listening' || game.currentTurn.phase === 'guessing' || game.currentTurn.phase === 'intercepting') && game.currentTurn.song && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-6 border border-purple-500/20 text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden"
                animate={isAudioPlaying ? { rotate: 360 } : {}}
                transition={isAudioPlaying ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
              >
                <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30" />
                  <span className="text-5xl">🎵</span>
                </div>
              </motion.div>

              {/* Audio Player */}
              <div className="mb-4">
                <AudioPlayer
                  previewUrl={game.currentTurn.song.previewUrl}
                  isPlaying={isAudioPlaying}
                />
              </div>

              {/* Play/Pause Button - Only turn player can control */}
              {isMyTurn ? (
                <>
                  <button
                    onClick={() => {
                      if (!isAudioPlaying && game.currentTurn?.phase === 'listening') {
                        startListening();
                      }
                      setIsAudioPlaying(!isAudioPlaying);
                    }}
                    className="mb-3 px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    {isAudioPlaying ? '⏸ Pausar' : '▶ Reproducir'}
                  </button>

                  {/* Countdown Timer */}
                  {guessCountdown > 0 && (
                    <motion.div
                      className={`text-3xl font-bold mb-2 ${guessCountdown <= 10 ? 'text-red-400' : guessCountdown <= 30 ? 'text-yellow-400' : 'text-green-400'}`}
                      animate={guessCountdown <= 10 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: guessCountdown <= 10 ? Infinity : 0 }}
                    >
                      ⏱️ {guessCountdown}s
                    </motion.div>
                  )}

                  <p className="text-purple-300 font-medium">
                    {game.currentTurn.phase === 'listening'
                      ? (isAudioPlaying ? 'Escuchando...' : 'Presiona reproducir para empezar')
                      : 'Selecciona la posicion en tu linea temporal'
                    }
                  </p>
                  <p className="text-purple-400/50 text-sm mt-1">Coloca esta cancion en tu linea temporal</p>
                </>
              ) : (
                <div className="space-y-2">
                  {/* Audio status for non-turn players */}
                  <div className={`text-sm ${isAudioPlaying ? 'text-purple-300' : 'text-purple-400/60'}`}>
                    {isAudioPlaying ? '🎵 Reproduciendo...' : '⏸ Esperando reproduccion...'}
                  </div>
                  <p className="text-purple-400/50 text-sm">
                    {game.currentTurn.phase === 'intercepting'
                      ? 'Puedes interceptar si crees saber la posicion correcta'
                      : `Esperando a que ${turnPlayer?.name} coloque la cancion...`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {currentPlayer && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-2">Tu Linea Temporal ({currentPlayer.timeline.length}/{game.cardsToWin})</h3>
              <Timeline
                timeline={currentPlayer.timeline}
                onSelectPosition={isMyTurn && game.currentTurn.phase !== 'result' ? (pos, type) => {
                  setSelectedPosition(pos);
                  setSelectedType(type);
                } : undefined}
                selectedPosition={selectedPosition}
                selectedType={selectedType}
                isInteractive={isMyTurn && (game.currentTurn.phase === 'listening' || game.currentTurn.phase === 'guessing')}
              />
            </div>
          )}

          {/* Guess Submit */}
          {isMyTurn && (game.currentTurn.phase === 'listening' || game.currentTurn.phase === 'guessing') && selectedPosition !== null && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsAudioPlaying(false);
                submitGuess(selectedPosition, selectedType || 'slot');
                setSelectedPosition(null);
                setSelectedType(null);
              }}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
            >
              Confirmar Posicion
            </motion.button>
          )}

          {/* Intercept Phase UI - Two phases: deciding (10s) then selecting (10s) */}
          {game.currentTurn.phase === 'intercepting' && (() => {
            const interceptPhase = game.currentTurn.interceptPhase ?? 'deciding';
            const interceptingPlayer = game.players.find(p => p.id === game.currentTurn?.interceptingPlayerId);
            const isInterceptor = game.currentTurn.interceptingPlayerId === playerId;

            return (
              <motion.div
                ref={interceptRef}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  boxShadow: ['0 0 0px rgba(234, 179, 8, 0)', '0 0 30px rgba(234, 179, 8, 0.5)', '0 0 15px rgba(234, 179, 8, 0.3)']
                }}
                transition={{
                  duration: 0.5,
                  boxShadow: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
                }}
                className="bg-slate-900/90 backdrop-blur-lg rounded-xl p-4 border-2 border-yellow-400 space-y-4 shadow-lg shadow-yellow-500/20"
              >
                {/* Header with phase indicator and countdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">⏱️</span>
                    <span className="text-white font-medium">
                      {interceptPhase === 'selecting'
                        ? 'Seleccionando posicion...'
                        : 'Fase de Interceptacion'}
                    </span>
                  </div>
                  <motion.div
                    className="text-2xl font-bold text-yellow-400"
                    animate={{ scale: interceptCountdown <= 3 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: interceptCountdown <= 3 ? Infinity : 0 }}
                  >
                    {interceptCountdown}s
                  </motion.div>
                </div>

                {/* Turn player's view - just waiting */}
                {isMyTurn ? (
                  <div className="text-center text-purple-300">
                    <p>Has colocado la cancion en la posicion {(game.currentTurn.guessedPosition ?? 0) + 1}</p>
                    <p className="text-purple-400/50 text-sm">
                      {interceptPhase === 'selecting'
                        ? `${interceptingPlayer?.name} esta seleccionando su posicion...`
                        : 'Esperando posibles interceptaciones...'}
                    </p>
                  </div>
                ) : interceptPhase === 'selecting' ? (
                  // SELECTING PHASE - Only interceptor can select position
                  isInterceptor ? (
                    <>
                      {/* Interceptor sees timeline to select position */}
                      {turnPlayer && (
                        <div className="space-y-2">
                          <p className="text-yellow-300 text-sm text-center font-medium">
                            Has interceptado! Selecciona donde va la cancion
                          </p>
                          <Timeline
                            timeline={turnPlayer.timeline}
                            onSelectPosition={(pos, type) => {
                              setInterceptPosition(pos);
                              setSelectedType(type);
                            }}
                            selectedPosition={interceptPosition}
                            selectedType={selectedType}
                            isInteractive={true}
                          />
                        </div>
                      )}

                      {/* Confirm button when position selected */}
                      {interceptPosition !== null && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            intercept(interceptPosition);
                            setInterceptPosition(null);
                            setSelectedType(null);
                          }}
                          className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl"
                        >
                          Confirmar Posicion {interceptPosition + 1}
                        </motion.button>
                      )}
                    </>
                  ) : (
                    // Other players see waiting message
                    <div className="text-center py-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 mx-auto mb-3 border-2 border-yellow-400 border-t-transparent rounded-full"
                      />
                      <p className="text-yellow-400 font-medium">
                        {interceptingPlayer?.avatar} {interceptingPlayer?.name} esta seleccionando...
                      </p>
                      <p className="text-purple-400/50 text-sm mt-1">
                        Tiene {interceptCountdown}s para elegir la posicion
                      </p>
                    </div>
                  )
                ) : (
                  // DECIDING PHASE - Players can claim intercept
                  <>
                    {/* Show turn player's timeline */}
                    {turnPlayer && (
                      <div className="space-y-2">
                        <p className="text-purple-300 text-sm">
                          Linea temporal de {turnPlayer.name} ({turnPlayer.timeline.length} cartas)
                        </p>
                        <Timeline
                          timeline={turnPlayer.timeline}
                          isInteractive={false}
                        />
                      </div>
                    )}

                    {/* Real-time notification when someone claims */}
                    {showInterceptClaimed && game.currentTurn.interceptingPlayerId && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-yellow-500/30 border border-yellow-400 rounded-lg p-3 text-center"
                      >
                        <p className="text-yellow-300 font-bold flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                          >
                            🎯
                          </motion.span>
                          {game.players.find(p => p.id === game.currentTurn?.interceptingPlayerId)?.name} ha interceptado!
                        </p>
                      </motion.div>
                    )}

                    {/* Error notification when claim fails */}
                    {interceptClaimError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-center"
                      >
                        <p className="text-red-300 text-sm">{interceptClaimError}</p>
                      </motion.div>
                    )}

                    {/* Intercept button - first to click wins */}
                    <div className="flex flex-col items-center gap-2">
                      {currentPlayer && currentPlayer.tokens > 0 ? (
                        (() => {
                          const alreadyClaimed = !!game.currentTurn.interceptingPlayerId;
                          return (
                            <motion.button
                              whileHover={!alreadyClaimed ? { scale: 1.02 } : {}}
                              whileTap={!alreadyClaimed ? { scale: 0.98 } : {}}
                              onClick={async () => {
                                if (alreadyClaimed) {
                                  setInterceptClaimError('Ya alguien ha reclamado la interceptación');
                                  setTimeout(() => setInterceptClaimError(null), 2000);
                                  return;
                                }
                                const success = await intercept(null);
                                if (!success) {
                                  setInterceptClaimError('No pudiste interceptar - alguien fue más rápido!');
                                  setTimeout(() => setInterceptClaimError(null), 2000);
                                }
                              }}
                              disabled={alreadyClaimed}
                              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                                alreadyClaimed
                                  ? 'bg-gray-500/20 border border-gray-500/40 text-gray-400 cursor-not-allowed'
                                  : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30'
                              }`}
                            >
                              <span>🎯</span>
                              {alreadyClaimed ? 'Ya interceptado' : 'Interceptar (1 token)'}
                            </motion.button>
                          );
                        })()
                      ) : (
                        <p className="text-purple-400/50 text-sm">No tienes tokens para interceptar</p>
                      )}
                    </div>
                  </>
                )}

                {/* Show who intercepted (during selecting phase) */}
                {interceptPhase === 'selecting' && interceptingPlayer && (
                  <div className="pt-2 border-t border-purple-500/20">
                    <p className="text-purple-400/50 text-xs">
                      🎯 {interceptingPlayer.avatar} {interceptingPlayer.name} ha interceptado
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Bonus Phase */}
          {isMyTurn && game.currentTurn.phase === 'bonus' && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-green-500/20 space-y-3">
              <div className="text-center">
                <span className="text-green-400 text-lg">✓ Correcto!</span>
                <p className="text-purple-300 text-sm">Bonus: Adivina artista y titulo para ganar un token</p>
              </div>
              <input
                type="text"
                value={bonusArtist}
                onChange={(e) => setBonusArtist(e.target.value)}
                placeholder="Artista..."
                className="w-full px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white"
              />
              <input
                type="text"
                value={bonusTitle}
                onChange={(e) => setBonusTitle(e.target.value)}
                placeholder="Titulo..."
                className="w-full px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={skipBonus}
                  className="flex-1 py-2 bg-purple-500/20 text-purple-300 rounded-lg"
                >
                  Saltar
                </button>
                <button
                  onClick={() => {
                    submitBonus(bonusArtist, bonusTitle);
                    setBonusArtist('');
                    setBonusTitle('');
                  }}
                  disabled={!bonusArtist.trim() || !bonusTitle.trim()}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adivinar
                </button>
              </div>
            </div>
          )}

          {/* Result Phase */}
          {game.currentTurn.phase === 'result' && (
            <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20 text-center space-y-3">
              {/* Intercept outcome */}
              {game.currentTurn.interceptWinner ? (
                <>
                  <div className="text-4xl">🎯</div>
                  <div className="text-yellow-400 font-bold">
                    {game.players.find(p => p.id === game.currentTurn?.interceptWinner)?.name} intercepto correctamente!
                  </div>
                </>
              ) : (
                <div className="text-4xl">{game.currentTurn.isCorrect ? '🎉' : '😔'}</div>
              )}

              <div>
                <p className="text-white font-bold">{game.currentTurn.song.title}</p>
                <p className="text-purple-400/60">{game.currentTurn.song.artist}</p>
                <p className="text-purple-300 text-lg font-bold">{game.currentTurn.song.releaseYear}</p>
              </div>

              {/* Show what happened */}
              {game.currentTurn.interceptWinner ? (
                <p className="text-yellow-300 text-sm">
                  {turnPlayer?.name} fallo y un interceptor gano la carta
                </p>
              ) : game.currentTurn.isCorrect ? (
                game.currentTurn.bonusCorrect !== null && (
                  <p className={game.currentTurn.bonusCorrect ? 'text-green-400' : 'text-purple-400/50'}>
                    {game.currentTurn.bonusCorrect ? '+1 Token!' : 'Bonus incorrecto'}
                  </p>
                )
              ) : (
                <p className="text-red-400/60 text-sm">Posicion incorrecta - carta descartada</p>
              )}

              {(isHost || isMyTurn) && (
                <button
                  onClick={nextTurn}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
                >
                  Siguiente Turno
                </button>
              )}
            </div>
          )}

          {/* Scoreboard */}
          <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-purple-300 text-sm font-medium mb-2">Puntuaciones</h3>
            <div className="space-y-1">
              {game.players
                .sort((a, b) => b.timeline.length - a.timeline.length)
                .map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      player.id === playerId ? 'bg-purple-500/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}</span>
                      <span>{player.avatar}</span>
                      <span className="text-white text-sm">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-300 text-sm">{player.timeline.length} cartas</span>
                      <span className="text-yellow-400 text-sm">🪙 {player.tokens}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // FINISHED PHASE
  if (game.phase === 'finished') {
    const winner = game.players.find(p => p.id === game.winner);

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <MusicBackground />
        <NavigationMenu currentGame="hipster" roomCode={roomCode} />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            🏆
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Ganador!</h1>
          <div className="flex items-center justify-center gap-2 text-2xl text-purple-300 mb-6">
            <span className="text-4xl">{winner?.avatar}</span>
            <span>{winner?.name}</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-purple-500/20 mb-6">
            <h3 className="text-purple-300 text-sm font-medium mb-3">Resultados Finales</h3>
            {game.players
              .sort((a, b) => b.timeline.length - a.timeline.length)
              .map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b border-purple-500/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}</span>
                    <span>{player.avatar}</span>
                    <span className="text-white">{player.name}</span>
                  </div>
                  <span className="text-purple-300">{player.timeline.length} cartas</span>
                </div>
              ))}
          </div>

          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
            >
              Jugar de Nuevo
            </motion.button>
          )}

          <Link href="/hipster" className="block mt-4 text-purple-400/60 hover:text-purple-300">
            Volver al menu
          </Link>
        </motion.div>
      </main>
    );
  }

  return null;
}
