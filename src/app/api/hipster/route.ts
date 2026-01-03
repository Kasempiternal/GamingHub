import { NextRequest, NextResponse } from 'next/server';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import type { HipsterGameState, HipsterPlayer, HipsterSong, HipsterTimelineCard, HipsterCurrentTurn } from '@/types/game';
import { HIPSTER_CONFIG, HIPSTER_AVATARS } from '@/types/game';
import { getRandomSongsFromCatalog, type CuratedSongData } from '@/lib/hipsterSongs';

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

// Keywords to filter out non-original tracks (live, remix, etc.)
const FILTERED_TRACK_KEYWORDS = [
  'live', 'remix', 'acoustic', 'remaster', 'remastered',
  'radio edit', 'extended', 'demo', 'cover', 'tribute',
  'karaoke', 'instrumental', 'reprise', 'unplugged', 'session',
  // Additional filters:
  'version', 'edit', 'mix',           // Common variations
  'en vivo', 'directo',               // Spanish live versions
  'bonus', 'deluxe',                  // Album variants
  'stripped', 'alternative',          // Other variants
  'sped up', 'slowed',                // Speed variants (TikTok)
];

function isOriginalTrack(trackName: string): boolean {
  const lowerName = trackName.toLowerCase();
  return !FILTERED_TRACK_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

// Draw a song for a player (anti-cheat: exclude their contributions)
// Dynamically injects more songs from catalog if pool is exhausted
async function drawSongForPlayer(
  game: HipsterGameState,
  playerId: string
): Promise<HipsterSong | null> {
  const { songPool, usedSongs } = game;

  // Filter out: used songs AND songs contributed by current player
  let available = songPool.filter(song =>
    !usedSongs.includes(song.id) && song.addedBy !== playerId
  );

  // If running low on songs, proactively inject more from catalog
  if (available.length < 3) {
    console.log(`[Hipster] Song pool running low (${available.length} available). Injecting more songs...`);
    const injected = await injectRandomSongs(game, 10);
    console.log(`[Hipster] Injected ${injected} new songs from catalog. Pool now has ${game.songPool.length} songs.`);

    // Refresh available songs after injection
    available = game.songPool.filter(song =>
      !usedSongs.includes(song.id) && song.addedBy !== playerId
    );
  }

  if (available.length === 0) {
    // Only recycle if catalog is truly exhausted (all 199 songs used!)
    console.log('[Hipster] All catalog songs exhausted. Recycling used songs...');
    const recycled = songPool.filter(song => song.addedBy !== playerId);
    if (recycled.length === 0) {
      return null; // Edge case: all songs are from this player
    }
    return recycled[Math.floor(Math.random() * recycled.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

// Fetch a song from iTunes API
async function fetchSongFromiTunes(songData: CuratedSongData): Promise<HipsterSong | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?${new URLSearchParams({
        term: songData.searchQuery,
        media: 'music',
        entity: 'song',
        limit: '5',
        country: 'ES',
      })}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Find first track with preview that is NOT a live/remix version
    const track = data.results?.find((t: { previewUrl?: string; trackName?: string }) =>
      t.previewUrl && isOriginalTrack(t.trackName || '')
    );

    if (!track) return null;

    return {
      id: `itunes_${track.trackId}`,
      title: track.trackName || songData.title,
      artist: track.artistName || songData.artist,
      albumArt: track.artworkUrl100?.replace('100x100', '300x300') || '',
      releaseYear: songData.releaseYear, // Use our known year for accuracy
      previewUrl: track.previewUrl,
      addedBy: 'system', // System-added songs
      addedAt: Date.now(),
    };
  } catch (err) {
    console.error('iTunes fetch error for:', songData.title, err);
    return null;
  }
}

// Inject random songs from curated catalog into game pool
async function injectRandomSongs(
  game: HipsterGameState,
  count: number
): Promise<number> {
  const existingTitles = game.songPool.map(s => s.title);
  const randomSongs = getRandomSongsFromCatalog(count * 2, existingTitles); // Get extra in case some fail

  let added = 0;
  for (const songData of randomSongs) {
    if (added >= count) break;

    const song = await fetchSongFromiTunes(songData);
    if (song && !game.songPool.some(s => s.id === song.id)) {
      game.songPool.push(song);
      added++;
    }
  }

  return added;
}

// Check if timeline position guess is correct
// selectionType: 'slot' = clicked between years (strict: no same-year allowed)
//                'year' = clicked on a year group (lenient: same-year allowed)
function checkGuessCorrect(
  timeline: HipsterTimelineCard[],
  newSong: HipsterSong,
  guessedPosition: number,
  selectionType: 'slot' | 'year' = 'slot'
): boolean {
  if (timeline.length === 0) {
    return true; // First card is always correct
  }

  // Sort timeline by year to match UI display order (defensive measure)
  const sortedTimeline = [...timeline].sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  const newCard: HipsterTimelineCard = {
    song: newSong,
    position: guessedPosition,
    placedAt: Date.now(),
  };

  // Insert at position in the sorted timeline
  const testTimeline = [...sortedTimeline];
  testTimeline.splice(guessedPosition, 0, newCard);

  // Check if timeline is in chronological order
  for (let i = 0; i < testTimeline.length - 1; i++) {
    const current = testTimeline[i].song.releaseYear;
    const next = testTimeline[i + 1].song.releaseYear;

    if (selectionType === 'slot') {
      // Slot: Strict ordering required (must be strictly between years)
      // Song 2005 placed in slot between 1998 and 2005 is WRONG (2005 >= 2005)
      if (current >= next) return false;
    } else {
      // Year: Same-year allowed (clicking on a year group means "same year")
      if (current > next) return false;
    }
  }

  return true;
}

// Find the correct chronological position for a song in a timeline
function findChronologicalPosition(timeline: HipsterTimelineCard[], year: number): number {
  // Sort timeline first to ensure chronological order
  const sortedTimeline = [...timeline].sort((a, b) => a.song.releaseYear - b.song.releaseYear);

  // Find first position where the year fits chronologically
  for (let i = 0; i < sortedTimeline.length; i++) {
    if (year <= sortedTimeline[i].song.releaseYear) {
      return i;
    }
  }
  return sortedTimeline.length; // Insert at end
}

// Fuzzy match for bonus guess (case insensitive, 80% accuracy required)
function fuzzyMatch(guess: string, actual: string): boolean {
  const normalizeStr = (s: string) =>
    s.toLowerCase()
      .replace(/\(.*?\)/g, '')                           // Remove everything in parentheses
      .replace(/\[.*?\]/g, '')                           // Remove everything in brackets
      .replace(/\s*[-–—]\s*(feat|ft|featuring)\.?\s*.*/gi, '') // Remove "- feat X" patterns
      .replace(/\s*(feat|ft|featuring)\.?\s*.*/gi, '')   // Remove "feat X" at any position
      .replace(/[^a-z0-9\s]/g, '')                       // Remove remaining special chars
      .replace(/\s+/g, ' ')
      .trim();

  const g = normalizeStr(guess);
  const a = normalizeStr(actual);

  // Empty guess is never correct
  if (g.length === 0) return false;

  // Exact match
  if (g === a) return true;

  // Word match: if guess matches any word in actual exactly
  // e.g., "payaso" matches "So Payaso"
  const actualWords = a.split(' ');
  if (actualWords.some(word => word === g)) return true;

  // Levenshtein distance for typo tolerance (80% accuracy = 20% max error)
  const maxDistance = Math.floor(a.length * 0.2);
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
        return handleCreate(data.playerName, data.avatar, data.deviceId);
      case 'join':
        return handleJoin(roomCode || data.roomCode, data.playerName, data.avatar, data.deviceId);
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
        return handleSubmitGuess(roomCode, playerId, data.position, data.type);
      case 'submitBonus':
        return handleSubmitBonus(roomCode, playerId, data.artist, data.title);
      case 'skipBonus':
        return handleSkipBonus(roomCode, playerId);
      case 'useToken':
        return handleUseToken(roomCode, playerId, data.targetPlayerId, data.cardIndex);
      case 'nextTurn':
        return handleNextTurn(roomCode, playerId);
      case 'intercept':
        return handleIntercept(roomCode, playerId, data.position ?? null);
      case 'interceptTimeout':
        return handleInterceptTimeout(roomCode, playerId);
      case 'resolveIntercept':
        return handleResolveIntercept(roomCode, playerId);
      case 'startListening':
        return handleStartListening(roomCode, playerId);
      case 'skipTurn':
        return handleSkipTurn(roomCode, playerId);
      case 'reset':
        return handleReset(roomCode, playerId);
      case 'removePlayer':
        return handleRemovePlayer(roomCode, playerId, data.targetPlayerId);
      default:
        return error('Acción no válida');
    }
  } catch (e) {
    console.error('API error:', e);
    return error('Error interno del servidor', 500);
  }
}

// Action handlers

async function handleCreate(playerName: string, avatar?: string, deviceId?: string) {
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
    deviceId,
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

async function handleJoin(roomCode: string, playerName: string, avatar?: string, deviceId?: string) {
  if (!roomCode?.trim()) {
    return error('Código de sala requerido');
  }

  const game = await getGame(roomCode.toUpperCase());
  if (!game) {
    return error('Sala no encontrada');
  }

  // Check if device already has a player in this game (auto-reconnect)
  if (deviceId) {
    const existingByDevice = game.players.find(p => p.deviceId === deviceId);
    if (existingByDevice) {
      // Update last activity and return existing player
      game.lastActivity = Date.now();
      await setGame(game.roomCode, game);
      return success({
        playerId: existingByDevice.id,
        game,
        reconnected: true,
      });
    }
  }

  // New player joining - require name
  if (!playerName?.trim()) {
    return error('Nombre requerido');
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
    deviceId,
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

  // Inject random songs from curated catalog (5 per player)
  const randomSongsNeeded = game.players.length * (HIPSTER_CONFIG.randomSongsPerPlayer || 5);
  const randomSongsAdded = await injectRandomSongs(game, randomSongsNeeded);
  console.log(`Injected ${randomSongsAdded} random songs into pool`);

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
    const song = await drawSongForPlayer(game, p.id);
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
  const firstSong = await drawSongForPlayer(game, firstPlayerId);

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
      guessDeadline: null,
      intercepts: [],
      interceptDeadline: null,
      interceptWinner: null,
      // Two-phase intercept fields
      interceptPhase: null,
      interceptingPlayerId: null,
      selectingDeadline: null,
    };
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleSubmitGuess(roomCode: string, playerId: string, position: number, selectionType?: 'slot' | 'year') {
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

  // Check if guess is correct immediately
  // Use 'slot' as default for backwards compatibility
  const isCorrect = checkGuessCorrect(player.timeline, game.currentTurn.song, position, selectionType || 'slot');
  game.currentTurn.guessedPosition = position;
  game.currentTurn.isCorrect = isCorrect;
  game.currentTurn.intercepts = [];
  game.currentTurn.interceptWinner = null;

  if (isCorrect) {
    // Correct guess - skip intercept phase, go directly to bonus
    game.currentTurn.phase = 'bonus';
    game.currentTurn.interceptDeadline = null;
    game.currentTurn.interceptPhase = null;
    game.currentTurn.interceptingPlayerId = null;
    game.currentTurn.selectingDeadline = null;
    // Card is added after bonus phase (to hide album art during bonus)
  } else {
    // Wrong guess - start intercept DECIDING phase (10s to claim)
    game.currentTurn.phase = 'intercepting';
    game.currentTurn.interceptDeadline = Date.now() + 10000; // 10s to decide
    game.currentTurn.interceptPhase = 'deciding';
    game.currentTurn.interceptingPlayerId = null;
    game.currentTurn.selectingDeadline = null;
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

  // Now add the card to timeline (delayed from guess phase to hide album art)
  const position = game.currentTurn.guessedPosition!;
  const newCard: HipsterTimelineCard = {
    song: game.currentTurn.song,
    position,
    placedAt: Date.now(),
  };
  player.timeline.splice(position, 0, newCard);
  player.timeline.forEach((card, idx) => {
    card.position = idx;
  });
  game.usedSongs.push(game.currentTurn.song.id);

  // Check win condition
  if (player.timeline.length >= game.cardsToWin) {
    game.winner = playerId;
    game.phase = 'finished';
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

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  game.currentTurn.bonusCorrect = false;
  game.currentTurn.phase = 'result';

  // Now add the card to timeline (delayed from guess phase to hide album art)
  const position = game.currentTurn.guessedPosition!;
  const newCard: HipsterTimelineCard = {
    song: game.currentTurn.song,
    position,
    placedAt: Date.now(),
  };
  player.timeline.splice(position, 0, newCard);
  player.timeline.forEach((card, idx) => {
    card.position = idx;
  });
  game.usedSongs.push(game.currentTurn.song.id);

  // Check win condition
  if (player.timeline.length >= game.cardsToWin) {
    game.winner = playerId;
    game.phase = 'finished';
  }

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

  // Draw new song for next player (may inject more songs if pool is low)
  const nextSong = await drawSongForPlayer(game, nextPlayerId);

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
      guessDeadline: null,
      intercepts: [],
      interceptDeadline: null,
      interceptWinner: null,
      // Two-phase intercept fields
      interceptPhase: null,
      interceptingPlayerId: null,
      selectingDeadline: null,
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

async function handleIntercept(roomCode: string, playerId: string, position: number | null) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn) {
    return error('No hay turno activo');
  }

  // Cannot intercept your own turn
  if (game.currentTurn.playerId === playerId) {
    return error('No puedes interceptar tu propio turno');
  }

  // Must be in intercept phase
  if (game.currentTurn.phase !== 'intercepting') {
    return error('No es momento de interceptar');
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) return error('Jugador no encontrado');

  const interceptPhase = game.currentTurn.interceptPhase ?? 'deciding';

  // PHASE 1: DECIDING - player clicks "Intercept" button (position is null)
  if (interceptPhase === 'deciding') {
    // Check if deciding deadline has expired
    if (game.currentTurn.interceptDeadline && Date.now() > game.currentTurn.interceptDeadline) {
      return error('El tiempo de decisión ha expirado');
    }

    // Check if someone already claimed intercept
    if (game.currentTurn.interceptingPlayerId) {
      return error('Alguien ya ha reclamado la interceptación');
    }

    // Must have at least 1 token
    if (player.tokens < 1) {
      return error('No tienes tokens para interceptar');
    }

    // Deduct token NOW (committed to intercept, no refunds!)
    player.tokens--;

    // Transition to SELECTING phase
    game.currentTurn.interceptPhase = 'selecting';
    game.currentTurn.interceptingPlayerId = playerId;
    game.currentTurn.selectingDeadline = Date.now() + 10000; // 10s to select position
    game.currentTurn.interceptDeadline = null; // Clear deciding deadline

    game.lastActivity = Date.now();
    await setGame(game.roomCode, game);
    return success({ game });
  }

  // PHASE 2: SELECTING - interceptor submits their position choice
  if (interceptPhase === 'selecting') {
    // Only the intercepting player can submit position
    if (game.currentTurn.interceptingPlayerId !== playerId) {
      return error('No eres el interceptor');
    }

    if (position === null || position === undefined) {
      return error('Debes seleccionar una posición');
    }

    // Check selecting deadline
    if (game.currentTurn.selectingDeadline && Date.now() > game.currentTurn.selectingDeadline) {
      return error('El tiempo de selección ha expirado');
    }

    // Record the intercept
    game.currentTurn.intercepts.push({
      playerId,
      position,
      timestamp: Date.now(),
    });

    // Now resolve the intercept immediately
    const currentPlayer = game.players.find(p => p.id === game.currentTurn!.playerId);
    if (!currentPlayer) return error('Jugador actual no encontrado');

    const song = game.currentTurn.song;
    const interceptCorrect = checkGuessCorrect(currentPlayer.timeline, song, position);

    game.usedSongs.push(song.id);

    if (interceptCorrect) {
      // Interceptor wins! Add card to interceptor's timeline
      // Calculate correct position for INTERCEPTOR's timeline (not turn player's)
      const insertPosition = findChronologicalPosition(player.timeline, song.releaseYear);
      const newCard: HipsterTimelineCard = {
        song,
        position: insertPosition,
        placedAt: Date.now(),
      };
      player.timeline.splice(insertPosition, 0, newCard);
      player.timeline.forEach((card, idx) => { card.position = idx; });

      game.currentTurn.interceptWinner = playerId;
      game.currentTurn.phase = 'result';
      game.currentTurn.interceptPhase = null;

      // Check if interceptor won the game
      if (player.timeline.length >= game.cardsToWin) {
        game.winner = player.id;
        game.phase = 'finished';
      }
    } else {
      // Interceptor got it wrong too - card discarded
      game.currentTurn.phase = 'result';
      game.currentTurn.interceptPhase = null;
      game.currentTurn.interceptWinner = null;
    }

    game.lastActivity = Date.now();
    await setGame(game.roomCode, game);
    return success({ game });
  }

  return error('Estado de interceptación inválido');
}

// Handle intercept timeout (interceptor didn't select in time)
async function handleInterceptTimeout(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn || game.currentTurn.phase !== 'intercepting') {
    return error('No hay interceptación activa');
  }

  // Only allow timeout if in selecting phase
  if (game.currentTurn.interceptPhase !== 'selecting') {
    return error('No hay interceptación en fase de selección');
  }

  // Verify timeout has actually occurred
  if (game.currentTurn.selectingDeadline && Date.now() < game.currentTurn.selectingDeadline) {
    return error('El tiempo de selección no ha expirado aún');
  }

  // Interceptor loses token (already deducted) but no position submitted
  // Move directly to result phase - card is discarded
  game.currentTurn.phase = 'result';
  game.currentTurn.interceptPhase = null;
  game.currentTurn.interceptWinner = null;
  game.usedSongs.push(game.currentTurn.song.id);

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);
  return success({ game });
}

async function handleResolveIntercept(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  // Only host or current player can resolve
  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost && game.currentTurn?.playerId !== playerId) {
    return error('No puedes resolver la interceptación');
  }

  if (!game.currentTurn || game.currentTurn.phase !== 'intercepting') {
    return error('No hay interceptación que resolver');
  }

  const currentPlayer = game.players.find(p => p.id === game.currentTurn!.playerId);
  if (!currentPlayer) return error('Jugador actual no encontrado');

  const song = game.currentTurn.song;
  const originalPosition = game.currentTurn.guessedPosition!;
  const originalCorrect = checkGuessCorrect(currentPlayer.timeline, song, originalPosition);

  // Check all intercepts
  let winningInterceptor: { playerId: string; position: number } | null = null;

  if (!originalCorrect) {
    // Original player is wrong, check if any interceptor got it right
    for (const intercept of game.currentTurn.intercepts) {
      const interceptPlayer = game.players.find(p => p.id === intercept.playerId);
      if (interceptPlayer) {
        // Check if interceptor's guess is correct against the CURRENT player's timeline
        const interceptCorrect = checkGuessCorrect(currentPlayer.timeline, song, intercept.position);
        if (interceptCorrect) {
          // First correct interceptor wins (by timestamp - they're already sorted)
          winningInterceptor = intercept;
          break;
        }
      }
    }
  }

  // Store correctness result
  game.currentTurn.isCorrect = originalCorrect;
  game.usedSongs.push(song.id);

  if (winningInterceptor) {
    // Interceptor wins! Add card to interceptor's timeline
    const interceptPlayer = game.players.find(p => p.id === winningInterceptor!.playerId);
    if (interceptPlayer) {
      // Calculate correct position for INTERCEPTOR's timeline (not current player's)
      const insertPosition = findChronologicalPosition(interceptPlayer.timeline, song.releaseYear);
      const newCard: HipsterTimelineCard = {
        song,
        position: insertPosition,
        placedAt: Date.now(),
      };
      interceptPlayer.timeline.splice(insertPosition, 0, newCard);
      interceptPlayer.timeline.forEach((card, idx) => { card.position = idx; });

      game.currentTurn.interceptWinner = winningInterceptor.playerId;
      game.currentTurn.phase = 'result';

      // Check if interceptor won the game
      if (interceptPlayer.timeline.length >= game.cardsToWin) {
        game.winner = interceptPlayer.id;
        game.phase = 'finished';
      }
    }
  } else if (originalCorrect) {
    // Original player was correct, they get to try bonus
    game.currentTurn.phase = 'bonus';
    game.currentTurn.interceptWinner = null;
    // Don't add card yet - it's added after bonus phase to hide album art
  } else {
    // Nobody got it right, card is discarded
    game.currentTurn.phase = 'result';
    game.currentTurn.interceptWinner = null;
  }

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleStartListening(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn || game.currentTurn.playerId !== playerId) {
    return error('No es tu turno');
  }

  if (game.currentTurn.phase !== 'listening') {
    return error('Ya has empezado a escuchar');
  }

  // Start 60-second countdown for guessing
  game.currentTurn.phase = 'guessing';
  game.currentTurn.guessDeadline = Date.now() + 60000; // 60 seconds

  game.lastActivity = Date.now();
  await setGame(game.roomCode, game);

  return success({ game });
}

async function handleSkipTurn(roomCode: string, playerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  if (!game.currentTurn) {
    return error('No hay turno activo');
  }

  // Only the current player can skip their own turn (when timer expires)
  if (game.currentTurn.playerId !== playerId) {
    return error('No puedes saltar el turno de otro jugador');
  }

  // Mark the song as used (discarded)
  game.usedSongs.push(game.currentTurn.song.id);

  // Advance to next player
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;
  const nextPlayerId = game.turnOrder[game.currentPlayerIndex];

  // Draw new song for next player (may inject more songs if pool is low)
  const nextSong = await drawSongForPlayer(game, nextPlayerId);

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
      guessDeadline: null,
      intercepts: [],
      interceptDeadline: null,
      interceptWinner: null,
      // Two-phase intercept fields
      interceptPhase: null,
      interceptingPlayerId: null,
      selectingDeadline: null,
    };
  } else {
    // No more songs, end game
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

async function handleRemovePlayer(roomCode: string, playerId: string, targetPlayerId: string) {
  const game = await getGame(roomCode);
  if (!game) return error('Sala no encontrada');

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) {
    return error('Solo el anfitrión puede eliminar jugadores');
  }

  if (game.phase !== 'lobby') {
    return error('Solo puedes eliminar jugadores en el lobby');
  }

  if (playerId === targetPlayerId) {
    return error('No puedes eliminarte a ti mismo');
  }

  const targetIndex = game.players.findIndex(p => p.id === targetPlayerId);
  if (targetIndex === -1) {
    return error('Jugador no encontrado');
  }

  // Remove the player
  game.players.splice(targetIndex, 1);
  game.lastActivity = Date.now();

  await setGame(game.roomCode, game);

  return success({ game });
}
