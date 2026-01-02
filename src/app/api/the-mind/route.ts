import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { TheMindGameState, TheMindPlayer, TheMindCard, TheMindLevel, TheMindPhase } from '@/types/game';
import { THE_MIND_CONFIG } from '@/types/game';

// KV storage helpers with 24-hour TTL
const GAME_TTL = 60 * 60 * 24; // 24 hours in seconds
const getGameKey = (roomCode: string) => `themind:${roomCode.toUpperCase()}`;

async function getGame(roomCode: string): Promise<TheMindGameState | null> {
  try {
    return await kv.get<TheMindGameState>(getGameKey(roomCode));
  } catch (error) {
    console.error('KV get error:', error);
    return null;
  }
}

async function setGame(roomCode: string, game: TheMindGameState): Promise<void> {
  try {
    await kv.set(getGameKey(roomCode), game, { ex: GAME_TTL });
  } catch (error) {
    console.error('KV set error:', error);
  }
}

async function deleteGame(roomCode: string): Promise<void> {
  try {
    await kv.del(getGameKey(roomCode));
  } catch (error) {
    console.error('KV delete error:', error);
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

// Deal cards for current level
function dealCards(game: TheMindGameState): void {
  const cardsPerPlayer = game.currentLevel;
  const totalCards = game.players.length * cardsPerPlayer;

  // Create deck of cards 1-100
  const deck = Array.from({ length: 100 }, (_, i) => i + 1);
  const shuffled = shuffleArray(deck);
  const selectedCards = shuffled.slice(0, totalCards);

  // Sort cards for each player (they should see them sorted)
  let cardIndex = 0;
  game.players.forEach(player => {
    const playerCards = selectedCards.slice(cardIndex, cardIndex + cardsPerPlayer);
    player.cards = playerCards.sort((a, b) => a - b);
    player.isReady = false;
    player.isProposingStar = false;
    cardIndex += cardsPerPlayer;
  });

  game.playedCards = [];
  game.lastPlayedCard = null;
  game.lastPlayedBy = null;
  game.shurikenProposers = [];
  game.shurikenActive = false;
  game.conflictCards = [];
  game.lowestCardInHands = null;
}

// Find lowest card across all players
function findLowestCard(players: TheMindPlayer[]): number | null {
  let lowest: number | null = null;
  players.forEach(player => {
    player.cards.forEach(card => {
      if (lowest === null || card < lowest) {
        lowest = card;
      }
    });
  });
  return lowest;
}

// Check if all cards have been played
function allCardsPlayed(game: TheMindGameState): boolean {
  return game.players.every(player => player.cards.length === 0);
}

// Get sanitized game state (hide other players' cards)
function getSanitizedGame(game: TheMindGameState, playerId?: string): TheMindGameState {
  return {
    ...game,
    players: game.players.map(player => ({
      ...player,
      cards: player.id === playerId ? player.cards : player.cards.map(() => 0), // Hide actual values
    })),
  };
}

// Create new game
async function createGame(playerName: string): Promise<{ game: TheMindGameState; playerId: string }> {
  const roomCode = generateRoomCode();
  const playerId = generatePlayerId();

  const player: TheMindPlayer = {
    id: playerId,
    name: playerName,
    cards: [],
    isHost: true,
    isReady: false,
    isProposingStar: false,
  };

  const game: TheMindGameState = {
    roomCode,
    phase: 'lobby',
    players: [player],
    currentLevel: 1,
    maxLevel: 12,
    lives: 3,
    maxLives: 4,
    shurikens: 1,
    maxShurikens: 3,
    levels: [],
    playedCards: [],
    lastPlayedCard: null,
    lastPlayedBy: null,
    lowestCardInHands: null,
    shurikenProposers: [],
    shurikenActive: false,
    conflictCards: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
    lifeRewardLevels: [],
    shurikenRewardLevels: [],
  };

  await setGame(roomCode, game);
  return { game, playerId };
}

// Join game
async function joinGame(roomCode: string, playerName: string): Promise<{ game: TheMindGameState; playerId: string } | null> {
  const game = await getGame(roomCode);
  if (!game || game.phase !== 'lobby') return null;
  if (game.players.length >= 4) return null;

  const playerId = generatePlayerId();
  const player: TheMindPlayer = {
    id: playerId,
    name: playerName,
    cards: [],
    isHost: false,
    isReady: false,
    isProposingStar: false,
  };

  game.players.push(player);
  game.lastActivity = Date.now();

  await setGame(roomCode, game);
  return { game, playerId };
}

// Rejoin game
async function rejoinGame(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  game.lastActivity = Date.now();
  await setGame(roomCode, game);
  return game;
}

// Start game
async function startGame(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;
  if (game.players.length < 2) return null;

  // Configure game based on player count
  const config = THE_MIND_CONFIG[game.players.length] || THE_MIND_CONFIG[4];
  game.lives = config.lives;
  game.maxLives = config.lives;
  game.shurikens = config.shurikens;
  game.maxShurikens = config.shurikens + 2;
  game.maxLevel = config.levels;
  game.lifeRewardLevels = config.lifeRewards;
  game.shurikenRewardLevels = config.shurikenRewards;

  // Start level 1
  game.currentLevel = 1;
  game.phase = 'dealing';
  dealCards(game);

  // Add level record
  game.levels.push({
    levelNumber: 1,
    cardsPerPlayer: 1,
    completed: false,
    failed: false,
    cardsPlayed: [],
    startedAt: Date.now(),
    endedAt: null,
  });

  game.lastActivity = Date.now();

  await setGame(roomCode, game);

  // Note: Auto-transition to playing is now handled by the 'ready' action
  // which clients call after they've received their cards

  return game;
}

// Player ready (for synchronization before level starts)
async function playerReady(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  player.isReady = true;
  game.lastActivity = Date.now();

  // If all players ready and in dealing phase, start playing
  if (game.phase === 'dealing' && game.players.every(p => p.isReady)) {
    game.phase = 'playing';
  }

  await setGame(roomCode, game);
  return game;
}

// Play a card
async function playCard(roomCode: string, playerId: string, cardValue: number): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game || game.phase !== 'playing') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  // Check if player has this card
  const cardIndex = player.cards.indexOf(cardValue);
  if (cardIndex === -1) return null;

  // Check if any other player has a lower card
  const lowerCards: number[] = [];
  game.players.forEach(p => {
    p.cards.forEach(card => {
      if (card < cardValue) {
        lowerCards.push(card);
      }
    });
  });

  // Remove card from player's hand
  player.cards.splice(cardIndex, 1);

  // Add to played cards
  const playedCard: TheMindCard = {
    value: cardValue,
    playedBy: playerId,
    playedAt: Date.now(),
  };
  game.playedCards.push(playedCard);
  game.lastPlayedCard = cardValue;
  game.lastPlayedBy = playerId;

  // Update current level record
  const currentLevelRecord = game.levels[game.levels.length - 1];
  if (currentLevelRecord) {
    currentLevelRecord.cardsPlayed.push(playedCard);
  }

  game.lastActivity = Date.now();

  // If there were lower cards, that's a mistake!
  if (lowerCards.length > 0) {
    game.conflictCards = lowerCards;
    game.lives--;

    // Remove all lower cards from players' hands (they're lost)
    game.players.forEach(p => {
      p.cards = p.cards.filter(card => !lowerCards.includes(card));
    });

    // Add conflict cards to played pile (they count as played now)
    lowerCards.forEach(card => {
      game.playedCards.push({
        value: card,
        playedBy: null, // Lost due to conflict
        playedAt: Date.now(),
      });
    });

    if (game.lives <= 0) {
      game.phase = 'gameLost';
      if (currentLevelRecord) {
        currentLevelRecord.failed = true;
        currentLevelRecord.endedAt = Date.now();
      }
      await setGame(roomCode, game);
      return game;
    }

    // Check if level still completable
    if (allCardsPlayed(game)) {
      game.phase = 'levelComplete';
      handleLevelComplete(game);
    }

    await setGame(roomCode, game);
    return game;
  }

  // Check if all cards played successfully
  if (allCardsPlayed(game)) {
    game.phase = 'levelComplete';
    handleLevelComplete(game);
  }

  await setGame(roomCode, game);
  return game;
}

// Handle level completion
function handleLevelComplete(game: TheMindGameState): void {
  const currentLevelRecord = game.levels[game.levels.length - 1];
  if (currentLevelRecord) {
    currentLevelRecord.completed = true;
    currentLevelRecord.endedAt = Date.now();
  }

  // Check for rewards
  if (game.lifeRewardLevels.includes(game.currentLevel)) {
    game.lives = Math.min(game.lives + 1, game.maxLives);
  }
  if (game.shurikenRewardLevels.includes(game.currentLevel)) {
    game.shurikens = Math.min(game.shurikens + 1, game.maxShurikens);
  }

  // Check if game won
  if (game.currentLevel >= game.maxLevel) {
    game.phase = 'gameWon';
  }
}

// Next level
async function nextLevel(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game || game.phase !== 'levelComplete') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;

  game.currentLevel++;
  game.phase = 'dealing';
  game.conflictCards = [];
  dealCards(game);

  // Add level record
  game.levels.push({
    levelNumber: game.currentLevel,
    cardsPerPlayer: game.currentLevel,
    completed: false,
    failed: false,
    cardsPlayed: [],
    startedAt: Date.now(),
    endedAt: null,
  });

  game.lastActivity = Date.now();

  await setGame(roomCode, game);
  return game;
}

// Propose shuriken
async function proposeShuriken(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game || game.phase !== 'playing' || game.shurikens <= 0) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.cards.length === 0) return null;

  if (!game.shurikenProposers.includes(playerId)) {
    game.shurikenProposers.push(playerId);
    player.isProposingStar = true;
  }

  // Check if all players with cards are proposing
  const playersWithCards = game.players.filter(p => p.cards.length > 0);
  const allProposing = playersWithCards.every(p => game.shurikenProposers.includes(p.id));

  if (allProposing && playersWithCards.length > 0) {
    // Use shuriken
    game.shurikens--;
    game.shurikenActive = true;

    // Find lowest card and reveal it
    game.lowestCardInHands = findLowestCard(game.players);

    // Remove lowest card from each player
    game.players.forEach(p => {
      if (p.cards.length > 0) {
        const lowest = Math.min(...p.cards);
        const idx = p.cards.indexOf(lowest);
        if (idx !== -1) {
          // Add to played cards
          game.playedCards.push({
            value: lowest,
            playedBy: p.id,
            playedAt: Date.now(),
          });
          p.cards.splice(idx, 1);
        }
        p.isProposingStar = false;
      }
    });

    game.shurikenProposers = [];

    // Sort played cards
    game.playedCards.sort((a, b) => a.value - b.value);
    game.lastPlayedCard = game.lowestCardInHands;

    // Check if level complete
    if (allCardsPlayed(game)) {
      game.phase = 'levelComplete';
      handleLevelComplete(game);
    }
  }

  game.lastActivity = Date.now();
  await setGame(roomCode, game);
  return game;
}

// Cancel shuriken proposal
async function cancelShuriken(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game || game.phase !== 'playing') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  const idx = game.shurikenProposers.indexOf(playerId);
  if (idx !== -1) {
    game.shurikenProposers.splice(idx, 1);
    player.isProposingStar = false;
  }

  game.lastActivity = Date.now();
  await setGame(roomCode, game);
  return game;
}

// Reset game
async function resetGame(roomCode: string, playerId: string): Promise<TheMindGameState | null> {
  const game = await getGame(roomCode);
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;

  // Reset to lobby
  game.phase = 'lobby';
  game.currentLevel = 1;
  game.levels = [];
  game.playedCards = [];
  game.lastPlayedCard = null;
  game.lastPlayedBy = null;
  game.shurikenProposers = [];
  game.shurikenActive = false;
  game.conflictCards = [];
  game.lowestCardInHands = null;

  // Reset player cards
  game.players.forEach(p => {
    p.cards = [];
    p.isReady = false;
    p.isProposingStar = false;
  });

  game.lastActivity = Date.now();
  await setGame(roomCode, game);
  return game;
}

// API handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomCode, playerId, playerName, cardValue } = body;

    switch (action) {
      case 'create': {
        if (!playerName) {
          return NextResponse.json({ success: false, error: 'Se requiere nombre de jugador' });
        }
        const result = await createGame(playerName);
        return NextResponse.json({
          success: true,
          data: {
            game: getSanitizedGame(result.game, result.playerId),
            playerId: result.playerId,
          },
        });
      }

      case 'join': {
        if (!roomCode || !playerName) {
          return NextResponse.json({ success: false, error: 'Se requiere codigo de sala y nombre' });
        }
        const result = await joinGame(roomCode, playerName);
        if (!result) {
          return NextResponse.json({ success: false, error: 'No se pudo unir a la sala' });
        }
        return NextResponse.json({
          success: true,
          data: {
            game: getSanitizedGame(result.game, result.playerId),
            playerId: result.playerId,
          },
        });
      }

      case 'rejoin': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Se requiere codigo de sala y ID de jugador' });
        }
        const game = await rejoinGame(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se encontro la sala' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'get': {
        if (!roomCode) {
          return NextResponse.json({ success: false, error: 'Se requiere codigo de sala' });
        }
        const game = await getGame(roomCode);
        if (!game) {
          return NextResponse.json({ success: false, error: 'Sala no encontrada' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'start': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Se requiere codigo de sala y ID de jugador' });
        }
        const game = await startGame(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo iniciar el juego' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'ready': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await playerReady(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'Error al marcar listo' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'playCard': {
        if (!roomCode || !playerId || cardValue === undefined) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await playCard(roomCode, playerId, cardValue);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo jugar la carta' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'nextLevel': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await nextLevel(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo avanzar de nivel' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'proposeShuriken': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await proposeShuriken(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo proponer shuriken' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'cancelShuriken': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await cancelShuriken(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo cancelar propuesta' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'reset': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = await resetGame(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo reiniciar' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Accion no valida' });
    }
  } catch (error) {
    console.error('The Mind API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const playerId = searchParams.get('playerId');

  if (!roomCode) {
    return NextResponse.json({ success: false, error: 'Se requiere codigo de sala' });
  }

  const game = await getGame(roomCode);
  if (!game) {
    return NextResponse.json({ success: false, error: 'Sala no encontrada' });
  }

  return NextResponse.json({
    success: true,
    data: { game: getSanitizedGame(game, playerId || undefined) },
  });
}
