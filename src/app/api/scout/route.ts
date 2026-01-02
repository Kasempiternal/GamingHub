import { NextRequest, NextResponse } from 'next/server';
import type { ScoutGameState, ScoutPlayer, ScoutCard, ScoutCurrentPlay, ScoutRound, ScoutRoundScore, ScoutPlayType } from '@/types/game';
import { SCOUT_DECK, SCOUT_CONFIG } from '@/types/game';

// In-memory storage
const games = new Map<string, ScoutGameState>();

// Generate 4-character room code
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
  return `scout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

// Get active value of a card based on orientation
function getActiveValue(card: ScoutCard): number {
  return card.orientation === 'up' ? card.topValue : card.bottomValue;
}

// Get deck for player count (remove cards as needed)
function getDeckForPlayerCount(playerCount: number): Array<{ top: number; bottom: number }> {
  if (playerCount === 3) {
    // Remove all cards with 10
    return SCOUT_DECK.filter(card => card.top !== 10 && card.bottom !== 10);
  } else if (playerCount === 4) {
    // Remove card with 9 and 10
    return SCOUT_DECK.filter(card => !(card.top === 9 && card.bottom === 10));
  }
  // 5 players: use all cards
  return [...SCOUT_DECK];
}

// Deal cards to players
function dealCards(game: ScoutGameState): void {
  const deck = getDeckForPlayerCount(game.players.length);
  const shuffled = shuffleArray(deck);

  const cardsPerPlayer = Math.floor(shuffled.length / game.players.length);
  let cardIndex = 0;

  game.players.forEach(player => {
    player.hand = [];
    for (let i = 0; i < cardsPerPlayer; i++) {
      const deckCard = shuffled[cardIndex++];
      player.hand.push({
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        topValue: deckCard.top,
        bottomValue: deckCard.bottom,
        orientation: 'up', // Default orientation
      });
    }
    player.capturedCards = 0;
    player.scoutTokensReceived = 0;
    player.hasUsedScoutAndShow = false;
    player.hasConfirmedHand = false;
    player.hasPassed = false;
  });

  game.currentPlay = null;
  game.passCount = 0;
}

// Check if cards form a valid set (all same active value)
function isValidSet(cards: ScoutCard[]): boolean {
  if (cards.length < 2) return false;
  const firstValue = getActiveValue(cards[0]);
  return cards.every(card => getActiveValue(card) === firstValue);
}

// Check if cards form a valid run (consecutive active values)
function isValidRun(cards: ScoutCard[]): boolean {
  if (cards.length < 2) return false;
  const values = cards.map(getActiveValue).sort((a, b) => a - b);
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) return false;
  }
  return true;
}

// Determine play type and value
function analyzePlay(cards: ScoutCard[]): { type: ScoutPlayType; value: number } | null {
  if (cards.length === 0) return null;

  if (cards.length === 1) {
    return { type: 'single', value: getActiveValue(cards[0]) };
  }

  if (isValidSet(cards)) {
    return { type: 'set', value: getActiveValue(cards[0]) };
  }

  if (isValidRun(cards)) {
    const values = cards.map(getActiveValue);
    return { type: 'run', value: Math.min(...values) }; // Lowest value in run
  }

  return null; // Invalid play
}

// Check if new play beats current play
function canBeat(newPlay: { type: ScoutPlayType; value: number; cardCount: number }, currentPlay: ScoutCurrentPlay | null): boolean {
  if (!currentPlay) return true; // First play of round

  const currentCount = currentPlay.cards.length;
  const newCount = newPlay.cardCount;

  // More cards always wins
  if (newCount > currentCount) return true;
  if (newCount < currentCount) return false;

  // Same number of cards - compare by type and value
  // Runs beat sets of same length
  if (newPlay.type === 'run' && currentPlay.playType === 'set') return true;
  if (newPlay.type === 'set' && currentPlay.playType === 'run') return false;

  // Same type - higher value wins
  return newPlay.value > currentPlay.value;
}

// Check if cards are adjacent in hand
function areCardsAdjacent(hand: ScoutCard[], cardIds: string[]): boolean {
  if (cardIds.length <= 1) return true;

  const indices = cardIds.map(id => hand.findIndex(c => c.id === id)).sort((a, b) => a - b);

  // Check for gaps
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
}

// Calculate round scores
function calculateRoundScores(game: ScoutGameState, roundEnderId: string): ScoutRoundScore[] {
  return game.players.map(player => {
    const isRoundEnder = player.id === roundEnderId;
    const cardsRemaining = isRoundEnder ? 0 : player.hand.length;
    const roundScore = player.capturedCards + player.scoutTokensReceived - cardsRemaining;

    return {
      playerId: player.id,
      playerName: player.name,
      capturedCards: player.capturedCards,
      scoutTokens: player.scoutTokensReceived,
      cardsRemaining: player.hand.length,
      isRoundEnder,
      roundScore,
    };
  });
}

// Get next player index
function getNextPlayerIndex(game: ScoutGameState): number {
  let next = (game.currentPlayerIndex + 1) % game.players.length;
  // Skip players who have no cards (shouldn't happen normally)
  let attempts = 0;
  while (game.players[next].hand.length === 0 && attempts < game.players.length) {
    next = (next + 1) % game.players.length;
    attempts++;
  }
  return next;
}

// Create new game
function createGame(playerName: string): { game: ScoutGameState; playerId: string } {
  const roomCode = generateRoomCode();
  const playerId = generatePlayerId();

  const player: ScoutPlayer = {
    id: playerId,
    name: playerName,
    hand: [],
    capturedCards: 0,
    scoutTokensReceived: 0,
    hasUsedScoutAndShow: false,
    isHost: true,
    hasConfirmedHand: false,
    hasPassed: false,
  };

  const game: ScoutGameState = {
    roomCode,
    phase: 'lobby',
    players: [player],
    currentPlay: null,
    currentPlayerIndex: 0,
    rounds: [],
    currentRound: 0,
    totalRounds: 0, // Set when game starts
    totalScores: {},
    startingPlayerIndex: 0,
    passCount: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    winner: null,
    lastAction: null,
  };

  games.set(roomCode, game);
  return { game, playerId };
}

// Join game
function joinGame(roomCode: string, playerName: string): { game: ScoutGameState; playerId: string } | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'lobby') return null;
  if (game.players.length >= 5) return null;

  const playerId = generatePlayerId();
  const player: ScoutPlayer = {
    id: playerId,
    name: playerName,
    hand: [],
    capturedCards: 0,
    scoutTokensReceived: 0,
    hasUsedScoutAndShow: false,
    isHost: false,
    hasConfirmedHand: false,
    hasPassed: false,
  };

  game.players.push(player);
  game.lastActivity = Date.now();

  return { game, playerId };
}

// Rejoin game
function rejoinGame(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  game.lastActivity = Date.now();
  return game;
}

// Start game
function startGame(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;
  if (game.players.length < 3 || game.players.length > 5) return null;

  // Initialize total rounds (equal to player count)
  game.totalRounds = game.players.length;
  game.currentRound = 1;
  game.startingPlayerIndex = 0;
  game.currentPlayerIndex = 0;

  // Initialize scores
  game.players.forEach(p => {
    game.totalScores[p.id] = 0;
  });

  // Deal cards and move to orientation phase
  dealCards(game);
  game.phase = 'orientation';

  // Add round record
  game.rounds.push({
    roundNumber: 1,
    startingPlayerId: game.players[0].id,
    scores: [],
    endedBy: null,
    startedAt: Date.now(),
    endedAt: null,
  });

  game.lastActivity = Date.now();
  return game;
}

// Flip entire hand orientation
function flipHand(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'orientation') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.hasConfirmedHand) return null;

  // Flip all cards in hand and reverse order
  player.hand = player.hand.reverse().map(card => ({
    ...card,
    orientation: card.orientation === 'up' ? 'down' : 'up',
  }));

  game.lastActivity = Date.now();
  return game;
}

// Confirm hand orientation
function confirmHand(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'orientation') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;

  player.hasConfirmedHand = true;
  game.lastActivity = Date.now();

  // Check if all players confirmed
  if (game.players.every(p => p.hasConfirmedHand)) {
    game.phase = 'playing';
  }

  return game;
}

// Show (play cards)
function show(roomCode: string, playerId: string, cardIds: string[]): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'playing') return null;

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return null;

  const player = game.players[playerIndex];

  // Validate cards are in hand
  const cards = cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as ScoutCard[];
  if (cards.length !== cardIds.length) return null;

  // Validate cards are adjacent
  if (!areCardsAdjacent(player.hand, cardIds)) return null;

  // Analyze the play
  const play = analyzePlay(cards);
  if (!play) return null;

  // Check if it beats current play
  if (!canBeat({ ...play, cardCount: cards.length }, game.currentPlay)) return null;

  // Calculate captured cards count from current play
  const capturedCount = game.currentPlay ? game.currentPlay.cards.length : 0;

  // Remove cards from hand
  player.hand = player.hand.filter(c => !cardIds.includes(c.id));

  // Add captured cards
  player.capturedCards += capturedCount;

  // Set new current play
  game.currentPlay = {
    cards,
    playerId: player.id,
    playType: play.type,
    value: play.value,
  };

  // Reset pass count
  game.passCount = 0;
  game.players.forEach(p => p.hasPassed = false);

  // Set last action for animation
  game.lastAction = {
    type: 'show',
    playerId: player.id,
    timestamp: Date.now(),
  };

  // Check if player emptied their hand (round ends)
  if (player.hand.length === 0) {
    endRound(game, player.id);
  } else {
    // Next player's turn
    game.currentPlayerIndex = getNextPlayerIndex(game);
  }

  game.lastActivity = Date.now();
  return game;
}

// Scout (take a card from current play)
function scout(roomCode: string, playerId: string, takeFromLeft: boolean, insertAtIndex: number): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'playing') return null;
  if (!game.currentPlay) return null;

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return null;

  const player = game.players[playerIndex];
  const currentPlayOwner = game.players.find(p => p.id === game.currentPlay!.playerId);

  // Take card from left or right of current play
  const takenCard = takeFromLeft
    ? game.currentPlay.cards[0]
    : game.currentPlay.cards[game.currentPlay.cards.length - 1];

  // Remove card from current play
  game.currentPlay.cards = takeFromLeft
    ? game.currentPlay.cards.slice(1)
    : game.currentPlay.cards.slice(0, -1);

  // Insert card into hand at specified position
  const clampedIndex = Math.max(0, Math.min(insertAtIndex, player.hand.length));
  player.hand.splice(clampedIndex, 0, takenCard);

  // Give scout token to current play owner
  if (currentPlayOwner) {
    currentPlayOwner.scoutTokensReceived++;
  }

  // If current play is now empty, remove it
  if (game.currentPlay.cards.length === 0) {
    game.currentPlay = null;
  } else {
    // Update play type/value
    const newPlay = analyzePlay(game.currentPlay.cards);
    if (newPlay) {
      game.currentPlay.playType = newPlay.type;
      game.currentPlay.value = newPlay.value;
    }
  }

  // Set last action for animation
  game.lastAction = {
    type: 'scout',
    playerId: player.id,
    timestamp: Date.now(),
  };

  // Mark player as having passed (scout counts as a pass for round-ending purposes)
  player.hasPassed = true;
  game.passCount++;

  // Check if all players have passed
  if (game.passCount >= game.players.length - 1 || !game.currentPlay) {
    // Round ends - the current play owner wins
    const roundEnderId = game.currentPlay?.playerId || game.players[game.startingPlayerIndex].id;
    endRound(game, roundEnderId);
  } else {
    // Next player's turn
    game.currentPlayerIndex = getNextPlayerIndex(game);
  }

  game.lastActivity = Date.now();
  return game;
}

// Scout and Show (combo action, once per round)
function scoutAndShow(roomCode: string, playerId: string, takeFromLeft: boolean, insertAtIndex: number, showCardIds: string[]): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'playing') return null;
  if (!game.currentPlay) return null;

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return null;

  const player = game.players[playerIndex];

  // Check if already used scout & show this round
  if (player.hasUsedScoutAndShow) return null;

  // First, do the scout part
  const currentPlayOwner = game.players.find(p => p.id === game.currentPlay!.playerId);
  const takenCard = takeFromLeft
    ? game.currentPlay.cards[0]
    : game.currentPlay.cards[game.currentPlay.cards.length - 1];

  game.currentPlay.cards = takeFromLeft
    ? game.currentPlay.cards.slice(1)
    : game.currentPlay.cards.slice(0, -1);

  // Insert card into hand
  const clampedIndex = Math.max(0, Math.min(insertAtIndex, player.hand.length));
  player.hand.splice(clampedIndex, 0, takenCard);

  // Give scout token
  if (currentPlayOwner) {
    currentPlayOwner.scoutTokensReceived++;
  }

  // Now do the show part
  const cards = showCardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as ScoutCard[];
  if (cards.length !== showCardIds.length) return null;

  if (!areCardsAdjacent(player.hand, showCardIds)) return null;

  const play = analyzePlay(cards);
  if (!play) return null;

  // Calculate what we need to beat (the remaining current play, or nothing if empty)
  const playToBeat = game.currentPlay.cards.length > 0 ? game.currentPlay : null;
  if (playToBeat) {
    const updatedPlay = analyzePlay(playToBeat.cards);
    if (updatedPlay && !canBeat({ ...play, cardCount: cards.length }, { ...playToBeat, playType: updatedPlay.type, value: updatedPlay.value })) {
      return null;
    }
  }

  // Captured cards from remaining current play
  const capturedCount = game.currentPlay.cards.length;

  // Remove shown cards from hand
  player.hand = player.hand.filter(c => !showCardIds.includes(c.id));

  // Add captured cards
  player.capturedCards += capturedCount;

  // Mark as used
  player.hasUsedScoutAndShow = true;

  // Set new current play
  game.currentPlay = {
    cards,
    playerId: player.id,
    playType: play.type,
    value: play.value,
  };

  // Reset pass count
  game.passCount = 0;
  game.players.forEach(p => p.hasPassed = false);

  // Set last action
  game.lastAction = {
    type: 'scoutAndShow',
    playerId: player.id,
    timestamp: Date.now(),
  };

  // Check if round ends
  if (player.hand.length === 0) {
    endRound(game, player.id);
  } else {
    game.currentPlayerIndex = getNextPlayerIndex(game);
  }

  game.lastActivity = Date.now();
  return game;
}

// End round
function endRound(game: ScoutGameState, roundEnderId: string): void {
  const scores = calculateRoundScores(game, roundEnderId);

  // Update current round record
  const currentRound = game.rounds[game.rounds.length - 1];
  if (currentRound) {
    currentRound.scores = scores;
    currentRound.endedBy = roundEnderId;
    currentRound.endedAt = Date.now();
  }

  // Add to total scores
  scores.forEach(score => {
    game.totalScores[score.playerId] = (game.totalScores[score.playerId] || 0) + score.roundScore;
  });

  game.phase = 'roundEnd';
}

// Start next round
function nextRound(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game || game.phase !== 'roundEnd') return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;

  // Check if game is over
  if (game.currentRound >= game.totalRounds) {
    // Determine winner
    let maxScore = -Infinity;
    let winnerId: string | null = null;

    Object.entries(game.totalScores).forEach(([pid, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winnerId = pid;
      }
    });

    game.winner = winnerId;
    game.phase = 'gameEnd';
  } else {
    // Start next round
    game.currentRound++;
    game.startingPlayerIndex = (game.startingPlayerIndex + 1) % game.players.length;
    game.currentPlayerIndex = game.startingPlayerIndex;

    // Deal new cards
    dealCards(game);
    game.phase = 'orientation';

    // Add round record
    game.rounds.push({
      roundNumber: game.currentRound,
      startingPlayerId: game.players[game.startingPlayerIndex].id,
      scores: [],
      endedBy: null,
      startedAt: Date.now(),
      endedAt: null,
    });
  }

  game.lastActivity = Date.now();
  return game;
}

// Reset game
function resetGame(roomCode: string, playerId: string): ScoutGameState | null {
  const game = games.get(roomCode.toUpperCase());
  if (!game) return null;

  const player = game.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;

  // Reset to lobby
  game.phase = 'lobby';
  game.currentRound = 0;
  game.rounds = [];
  game.currentPlay = null;
  game.totalScores = {};
  game.winner = null;
  game.lastAction = null;
  game.passCount = 0;

  // Reset players
  game.players.forEach(p => {
    p.hand = [];
    p.capturedCards = 0;
    p.scoutTokensReceived = 0;
    p.hasUsedScoutAndShow = false;
    p.hasConfirmedHand = false;
    p.hasPassed = false;
  });

  game.lastActivity = Date.now();
  return game;
}

// Sanitize game state (hide other players' hands in detail)
function getSanitizedGame(game: ScoutGameState, playerId?: string): ScoutGameState {
  return {
    ...game,
    players: game.players.map(player => ({
      ...player,
      // Hide other players' card values, but show count and card backs
      hand: player.id === playerId
        ? player.hand
        : player.hand.map(card => ({
            ...card,
            topValue: 0,
            bottomValue: 0,
          })),
    })),
  };
}

// API handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomCode, playerId, playerName, cardIds, takeFromLeft, insertAtIndex, showCardIds } = body;

    switch (action) {
      case 'create': {
        if (!playerName) {
          return NextResponse.json({ success: false, error: 'Se requiere nombre de jugador' });
        }
        const result = createGame(playerName);
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
        const result = joinGame(roomCode, playerName);
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
        const game = rejoinGame(roomCode, playerId);
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
        const game = games.get(roomCode.toUpperCase());
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
        const game = startGame(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo iniciar el juego' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'flipHand': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = flipHand(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo voltear la mano' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'confirmHand': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = confirmHand(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo confirmar la mano' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'show': {
        if (!roomCode || !playerId || !cardIds || !Array.isArray(cardIds)) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = show(roomCode, playerId, cardIds);
        if (!game) {
          return NextResponse.json({ success: false, error: 'Jugada no valida' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'scout': {
        if (!roomCode || !playerId || typeof takeFromLeft !== 'boolean' || typeof insertAtIndex !== 'number') {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = scout(roomCode, playerId, takeFromLeft, insertAtIndex);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo hacer scout' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'scoutAndShow': {
        if (!roomCode || !playerId || typeof takeFromLeft !== 'boolean' || typeof insertAtIndex !== 'number' || !showCardIds) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = scoutAndShow(roomCode, playerId, takeFromLeft, insertAtIndex, showCardIds);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo hacer scout & show' });
        }
        return NextResponse.json({
          success: true,
          data: { game: getSanitizedGame(game, playerId) },
        });
      }

      case 'nextRound': {
        if (!roomCode || !playerId) {
          return NextResponse.json({ success: false, error: 'Datos incompletos' });
        }
        const game = nextRound(roomCode, playerId);
        if (!game) {
          return NextResponse.json({ success: false, error: 'No se pudo continuar' });
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
        const game = resetGame(roomCode, playerId);
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
    console.error('Scout API error:', error);
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

  const game = games.get(roomCode.toUpperCase());
  if (!game) {
    return NextResponse.json({ success: false, error: 'Sala no encontrada' });
  }

  return NextResponse.json({
    success: true,
    data: { game: getSanitizedGame(game, playerId || undefined) },
  });
}
