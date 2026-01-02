import { NextRequest, NextResponse } from 'next/server';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import type { HipsterGameState, HipsterPlayer, HipsterSong, HipsterTimelineCard, HipsterCurrentTurn } from '@/types/game';
import { HIPSTER_CONFIG, HIPSTER_AVATARS } from '@/types/game';

// Lazy initialization of Neon SQL client
let sql: NeonQueryFunction<false, false> | null = null;
function getSQL() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
      throw new Error('Database URL not configured');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

// Initialize games table if not exists
async function initDB() {
  try {
    const db = getSQL();
    await db`
      CREATE TABLE IF NOT EXISTS games (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
      )
    `;
    // Create index for cleanup
    await db`
      CREATE INDEX IF NOT EXISTS idx_games_expires ON games (expires_at)
    `;
  } catch (error) {
    console.error('DB init error:', error);
  }
}

// Run init once
let dbInitialized = false;
async function ensureDB() {
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
}

// Game storage helpers with 24-hour TTL
const getGameKey = (roomCode: string) => `hipster:${roomCode.toUpperCase()}`;

async function getGame(roomCode: string): Promise<HipsterGameState | null> {
  try {
    await ensureDB();
    const db = getSQL();
    const result = await db`
      SELECT data FROM games
      WHERE key = ${getGameKey(roomCode)}
      AND expires_at > NOW()
    `;
    if (result.length === 0) return null;
    return result[0].data as HipsterGameState;
  } catch (error) {
    console.error('DB get error:', error);
    return null;
  }
}

async function setGame(roomCode: string, game: HipsterGameState): Promise<void> {
  try {
    await ensureDB();
    const db = getSQL();
    await db`
      INSERT INTO games (key, data, expires_at)
      VALUES (${getGameKey(roomCode)}, ${JSON.stringify(game)}::jsonb, NOW() + INTERVAL '24 hours')
      ON CONFLICT (key)
      DO UPDATE SET data = ${JSON.stringify(game)}::jsonb, expires_at = NOW() + INTERVAL '24 hours'
    `;
  } catch (error) {
    console.error('DB set error:', error);
    throw error;
  }
}

// Generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate unique player ID
function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random avatar
function getRandomAvatar(usedAvatars: string[]): string {
  const available = HIPSTER_AVATARS.filter(a => !usedAvatars.includes(a));
  if (available.length === 0) {
    return HIPSTER_AVATARS[Math.floor(Math.random() * HIPSTER_AVATARS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Draw a song for a player (anti-cheat: exclude their contributions)
function drawSongForPlayer(
  songPool: HipsterSong[],
  usedSongs: string[],
  playerId: string
): HipsterSong | null {
  // Filter out: used songs AND songs contributed by current player
  const available = songPool.filter(song =>
    !usedSongs.includes(song.id) && song.addedBy !== playerId
  );

  if (available.length === 0) {
    // Recycle used songs, still excluding player's contributions
    const recycled = songPool.filter(song => song.addedBy !== playerId);
    if (recycled.length === 0) {
      return null; // Edge case: all songs are from this player
    }
    return recycled[Math.floor(Math.random() * recycled.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

// Check if timeline position guess is correct
function checkGuessCorrect(
  timeline: HipsterTimelineCard[],
  newSong: HipsterSong,
  guessedPosition: number
): boolean {
  if (timeline.length === 0) {
    return true; // First card is always correct
  }

  // Create a copy of timeline with the new song at guessed position
  const testTimeline = [...timeline];
  const newCard: HipsterTimelineCard = {
    song: newSong,
    position: guessedPosition,
    placedAt: Date.now(),
  };

  // Insert at position
  testTimeline.splice(guessedPosition, 0, newCard);

  // Check if timeline is in chronological order
  for (let i = 0; i < testTimeline.length - 1; i++) {
    if (testTimeline[i].song.releaseYear > testTimeline[i + 1].song.releaseYear) {
      return false;
    }
  }

  return true;
}

// Fuzzy match for bonus guess (case insensitive, allows minor typos)
function fuzzyMatch(guess: string, actual: string): boolean {
  const normalizeStr = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const g = normalizeStr(guess);
  const a = normalizeStr(actual);

  if (g === a) return true;

  // Allow if guess contains the main part
  if (a.includes(g) || g.includes(a)) return true;

  // Simple Levenshtein distance for typo tolerance
  const maxDistance = Math.floor(a.length * 0.3); // Allow 30% error
  const distance = levenshteinDistance(g, a);
  return distance <= maxDistance;
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// API response helper
function success<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// GET - Fetch game state
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const playerId = searchParams.get('playerId');

  if (!roomCode) {
    return error('Código de sala requerido');
  }

  const game = await getGame(roomCode);
  if (!game) {
    return error('Sala no encontrada');
  }

  return success({ game });
}

// POST - Game actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomCode, playerId, ...data } = body;

    switch (action) {
      case 'create':
        return handleCreate(data.playerName, data.avatar);
      case 'join':
        return handleJoin(roomCode || data.roomCode, data.playerName, data.avatar);
      case 'rejoin':
        return handleRejoin(roomCode, playerId);
      case 'musicReady':
        return handleMusicReady(roomCode, playerId);
      case 'startCollecting':
        return handleStartCollecting(roomCode, playerId);
      case 'addSong':
        return handleAddSong(roomCode, playerId, data.song);
      case 'removeSong':
        return handleRemoveSong(roomCode, playerId, data.songId);
      case 'playerReady':
        return handlePlayerReady(roomCode, playerId);
      case 'startGame':
        return handleStartGame(roomCode, playerId);
      case 'submitGuess':
        return handleSubmitGuess(roomCode, playerId, data.position);
      case 'submitBonus':
        return handleSubmitBonus(roomCode, playerId, data.artist, data.title);
      case 'skipBonus':
        return handleSkipBonus(roomCode, playerId);
      case 'useToken':
        return handleUseToken(roomCode, playerId, data.targetPlayerId, data.cardIndex);
      case 'nextTurn':
        return handleNextTurn(roomCode, playerId);
      case 'reset':
        return handleReset(roomCode, playerId);
      default:
        return error('Acción no válida');
    }
  } catch (e) {
    console.error('API error:', e);
    return error('Error interno del servidor', 500);
  }
}

// Action handlers

async function handleCreate(playerName: string, avatar?: string) {
  if (!playerName?.trim()) {
    return error('Nombre requerido');
  }

  // Generate unique room code
  let roomCode = generateRoomCode();
  let attempts = 0;
  while (await getGame(roomCode) && attempts < 10) {
    roomCode = generateRoomCode();
    attempts++;
  }

  const playerId = generatePlayerId();
  const now = Date.now();

  const player: HipsterPlayer = {
    id: playerId,
    name: playerName.trim(),
    avatar: avatar || getRandomAvatar([]),
    isHost: true,
    timeline: [],
    tokens: 2, // Start with 2 tokens
    contributedSongs: [],
    isReady: false,
    songsAdded: 0,
  };

  const game: HipsterGameState = {
    roomCode,
    phase: 'lobby',
    players: [player],
    songPool: [],
    usedSongs: [],
    currentTurn: null,
    currentPlayerIndex: 0,
    turnOrder: [],
    musicReady: false,
    songsPerPlayer: HIPSTER_CONFIG.defaultSongsPerPlayer,
    cardsToWin: HIPSTER_CONFIG.defaultCardsToWin,
    winner: null,
    createdAt: now,
    lastActivity: now,
  };

  await setGame(roomCode, game);

  return success({ playerId, game });
}

async function handleJoin(roomCode: string, playerName: string, avatar?: string) {
  if (!roomCode?.trim() || !playerName?.trim()) {
    return error('Código de sala y nombre requeridos');
  }

  const game = await getGame(roomCode.toUpperCase());
  if (!game) {
    return error('Sala no encontrada');
  }

  if (game.phase !== 'lobby' && game.phase !== 'collecting') {
    return error('La partida ya ha comenzado');
  }

  if (game.players.length >= HIPSTER_CONFIG.maxPlayers) {
    return error('Sala llena');
  }

  const usedAvatars = game.players.map(p => p.avatar);
  const playerId = generatePlayerId();

  const player: HipsterPlayer = {
    id: playerId,
    name: playerName.trim(),
    avatar: avatar || getRandomAvatar(usedAvatars),
    isHost: false,
    timeline: [],
    tokens: 2,
    contributedSongs: [],
    isReady: false,
    songsAdded: 0,
  };

  game.players.push(player);
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ playerId, game });
}

async function handleRejoin(roomCode: string, playerId: string) {
  if (!roomCode || !playerId) {
    return error('Datos de sesión inválidos');
  }

  const game = await getGame(roomCode);
  if (!game) {
    return error('Sala no encontrada');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    return error('Jugador no encontrado');
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleMusicReady(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return error('Solo el anfitrión puede confirmar el audio');
  }

  game.musicReady = true;
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleStartCollecting(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return error('Solo el anfitrión puede iniciar');
  }

  if (game.players.length < HIPSTER_CONFIG.minPlayers) {
    return error(`Se necesitan al menos ${HIPSTER_CONFIG.minPlayers} jugadores`);
  }

  game.phase = 'collecting';
  game.musicReady = true; // Music is ready when we start collecting
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleAddSong(roomCode: string, playerId: string, songData: Omit<HipsterSong, 'addedBy' | 'addedAt'>) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (game.phase !== 'collecting') {
    return error('No se pueden añadir canciones ahora');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  if (player.songsAdded >= game.songsPerPlayer) {
    return error(`Ya has añadido ${game.songsPerPlayer} canciones`);
  }

  // Check if song already in pool
  if (game.songPool.some(s => s.id === songData.id)) {
    return error('Esta canción ya está en la lista');
  }

  const song: HipsterSong = {
    ...songData,
    addedBy: playerId,
    addedAt: Date.now(),
  };

  game.songPool.push(song);
  player.contributedSongs.push(song.id);
  player.songsAdded++;
  player.isReady = false; // Reset ready when adding song
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleRemoveSong(roomCode: string, playerId: string, songId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (game.phase !== 'collecting') {
    return error('No se pueden eliminar canciones ahora');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  const songIndex = game.songPool.findIndex(s => s.id === songId && s.addedBy === playerId);
  if (songIndex === -1) {
    return error('Canción no encontrada o no te pertenece');
  }

  game.songPool.splice(songIndex, 1);
  player.contributedSongs = player.contributedSongs.filter(id => id !== songId);
  player.songsAdded--;
  player.isReady = false;
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handlePlayerReady(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (game.phase !== 'collecting') {
    return error('No es el momento de marcar listo');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  if (player.songsAdded < 1) {
    return error('Añade al menos una canción');
  }

  player.isReady = !player.isReady;
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleStartGame(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return error('Solo el anfitrión puede iniciar');
  }

  // Check all players ready
  const allReady = game.players.every(p => p.isReady);
  if (!allReady) {
    return error('No todos los jugadores están listos');
  }

  // Need minimum songs per player (excluding own contributions)
  const minSongsNeeded = game.players.length * 3; // At least 3 songs per player from others
  if (game.songPool.length < minSongsNeeded) {
    return error(`Se necesitan al menos ${minSongsNeeded} canciones`);
  }

  // Setup game
  game.phase = 'playing';
  game.turnOrder = shuffleArray(game.players.map(p => p.id));
  game.currentPlayerIndex = 0;

  // Deal initial card to each player
  for (const p of game.players) {
    const song = drawSongForPlayer(game.songPool, game.usedSongs, p.id);
    if (song) {
      p.timeline.push({
        song,
        position: 0,
        placedAt: Date.now(),
      });
      game.usedSongs.push(song.id);
    }
  }

  // Start first turn
  const firstPlayerId = game.turnOrder[0];
  const firstSong = drawSongForPlayer(game.songPool, game.usedSongs, firstPlayerId);

  if (firstSong) {
    game.currentTurn = {
      playerId: firstPlayerId,
      song: firstSong,
      phase: 'listening',
      guessedPosition: null,
      isCorrect: null,
      bonusGuess: null,
      bonusCorrect: null,
      startedAt: Date.now(),
    };
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleSubmitGuess(roomCode: string, playerId: string, position: number) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn || game.currentTurn.playerId !== playerId) {
    return error('No es tu turno');
  }

  if (game.currentTurn.phase !== 'listening' && game.currentTurn.phase !== 'guessing') {
    return error('No es momento de adivinar');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  const isCorrect = checkGuessCorrect(player.timeline, game.currentTurn.song, position);

  game.currentTurn.guessedPosition = position;
  game.currentTurn.isCorrect = isCorrect;
  game.currentTurn.phase = isCorrect ? 'bonus' : 'result';

  if (isCorrect) {
    // Add card to timeline at correct position
    const newCard: HipsterTimelineCard = {
      song: game.currentTurn.song,
      position,
      placedAt: Date.now(),
    };
    player.timeline.splice(position, 0, newCard);
    // Update positions
    player.timeline.forEach((card, idx) => {
      card.position = idx;
    });
    game.usedSongs.push(game.currentTurn.song.id);

    // Check win condition
    if (player.timeline.length >= game.cardsToWin) {
      game.winner = playerId;
      game.phase = 'finished';
    }
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleSubmitBonus(roomCode: string, playerId: string, artist: string, title: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn || game.currentTurn.playerId !== playerId) {
    return error('No es tu turno');
  }

  if (game.currentTurn.phase !== 'bonus') {
    return error('No es momento del bonus');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  const artistCorrect = fuzzyMatch(artist, game.currentTurn.song.artist);
  const titleCorrect = fuzzyMatch(title, game.currentTurn.song.title);
  const bonusCorrect = artistCorrect && titleCorrect;

  game.currentTurn.bonusGuess = { artist, title };
  game.currentTurn.bonusCorrect = bonusCorrect;
  game.currentTurn.phase = 'result';

  if (bonusCorrect) {
    player.tokens++;
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleSkipBonus(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn || game.currentTurn.playerId !== playerId) {
    return error('No es tu turno');
  }

  if (game.currentTurn.phase !== 'bonus') {
    return error('No es momento del bonus');
  }

  game.currentTurn.bonusCorrect = false;
  game.currentTurn.phase = 'result';
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleUseToken(roomCode: string, playerId: string, targetPlayerId: string, cardIndex: number) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (game.phase !== 'playing') {
    return error('No es momento de usar tokens');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  if (player.tokens < 1) {
    return error('No tienes tokens');
  }

  const targetPlayer = game.players.find(p => p.id === targetPlayerId);
  if (!targetPlayer) return error('Jugador objetivo no encontrado');

  if (cardIndex < 0 || cardIndex >= targetPlayer.timeline.length) {
    return error('Carta no válida');
  }

  // Steal the card
  const stolenCard = targetPlayer.timeline.splice(cardIndex, 1)[0];
  player.timeline.push(stolenCard);
  player.timeline.sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  // Update positions
  targetPlayer.timeline.forEach((card, idx) => { card.position = idx; });
  player.timeline.forEach((card, idx) => { card.position = idx; });

  player.tokens--;
  game.lastActivity = Date.now();

  // Check win condition after stealing
  if (player.timeline.length >= game.cardsToWin) {
    game.winner = playerId;
    game.phase = 'finished';
  }

  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleNextTurn(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  // Only host or current player can advance
  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost && game.currentTurn?.playerId !== playerId) {
    return error('No puedes avanzar el turno');
  }

  if (game.phase === 'finished') {
    return error('La partida ha terminado');
  }

  // Advance to next player
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;
  const nextPlayerId = game.turnOrder[game.currentPlayerIndex];

  // Draw new song for next player
  const nextSong = drawSongForPlayer(game.songPool, game.usedSongs, nextPlayerId);

  if (nextSong) {
    game.currentTurn = {
      playerId: nextPlayerId,
      song: nextSong,
      phase: 'listening',
      guessedPosition: null,
      isCorrect: null,
      bonusGuess: null,
      bonusCorrect: null,
      startedAt: Date.now(),
    };
  } else {
    // No more songs available, end game
    // Winner is player with most cards
    let maxCards = 0;
    let winnerId = game.players[0].id;
    for (const p of game.players) {
      if (p.timeline.length > maxCards) {
        maxCards = p.timeline.length;
        winnerId = p.id;
      }
    }
    game.winner = winnerId;
    game.phase = 'finished';
    game.currentTurn = null;
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleReset(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return error('Solo el anfitrión puede reiniciar');
  }

  // Reset to lobby
  game.phase = 'lobby';
  game.songPool = [];
  game.usedSongs = [];
  game.currentTurn = null;
  game.currentPlayerIndex = 0;
  game.turnOrder = [];
  game.winner = null;

  // Reset players
  for (const p of game.players) {
    p.timeline = [];
    p.tokens = 2;
    p.contributedSongs = [];
    p.isReady = false;
    p.songsAdded = 0;
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}
