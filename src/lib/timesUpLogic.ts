// Times Up (Tiempo!) Game - Core Game Logic

import { v4 as uuidv4 } from 'uuid';
import { getRandomCards } from '@/data/timesUpCards';
import type {
  TimesUpGameState,
  TimesUpPlayer,
  TimesUpTeam,
  TimesUpPhase,
  TimesUpCard,
  TimesUpTurn,
} from '@/types/game';
import { TIMESUP_CONFIG, TIMESUP_AVATARS } from '@/types/game';

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get random avatar from TIMESUP_AVATARS
export function getRandomAvatar(usedAvatars: string[]): string {
  const available = TIMESUP_AVATARS.filter(a => !usedAvatars.includes(a));
  if (available.length === 0) {
    return TIMESUP_AVATARS[Math.floor(Math.random() * TIMESUP_AVATARS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Create initial game state
export function createGame(hostName: string): TimesUpGameState {
  const roomCode = generateRoomCode();
  const avatar = getRandomAvatar([]);

  const host: TimesUpPlayer = {
    id: uuidv4(),
    name: hostName,
    avatar,
    team: null,
    isHost: true,
    cardsGuessedThisGame: 0,
  };

  const now = Date.now();

  return {
    roomCode,
    phase: 'lobby',
    players: [host],
    allCards: [],
    remainingCards: [],
    guessedCards: [],
    currentTurn: null,
    currentTeam: 'orange',
    turnOrder: [],
    currentTurnIndex: 0,
    orangeScore: 0,
    blueScore: 0,
    roundScores: [],
    currentRound: 0,
    winner: null,
    createdAt: now,
    lastActivity: now,
  };
}

// Add a player to the game
export function addPlayer(
  game: TimesUpGameState,
  playerName: string
): { game: TimesUpGameState; player: TimesUpPlayer } {
  const usedAvatars = game.players.map(p => p.avatar);
  const avatar = getRandomAvatar(usedAvatars);

  const player: TimesUpPlayer = {
    id: uuidv4(),
    name: playerName,
    avatar,
    team: null,
    isHost: false,
    cardsGuessedThisGame: 0,
  };

  return {
    game: {
      ...game,
      players: [...game.players, player],
      lastActivity: Date.now(),
    },
    player,
  };
}

// Set player team
export function setPlayerTeam(
  game: TimesUpGameState,
  playerId: string,
  team: TimesUpTeam | null
): TimesUpGameState {
  const updatedPlayers = game.players.map(p =>
    p.id === playerId ? { ...p, team } : p
  );

  return {
    ...game,
    players: updatedPlayers,
    lastActivity: Date.now(),
  };
}

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create alternating turn order (orange, blue, orange, blue...)
function createTurnOrder(players: TimesUpPlayer[]): string[] {
  const orangePlayers = shuffleArray(players.filter(p => p.team === 'orange'));
  const bluePlayers = shuffleArray(players.filter(p => p.team === 'blue'));

  const turnOrder: string[] = [];
  const maxLength = Math.max(orangePlayers.length, bluePlayers.length);

  for (let i = 0; i < maxLength * 2; i++) {
    if (i % 2 === 0) {
      // Orange turn
      const orangeIndex = Math.floor(i / 2) % orangePlayers.length;
      turnOrder.push(orangePlayers[orangeIndex].id);
    } else {
      // Blue turn
      const blueIndex = Math.floor(i / 2) % bluePlayers.length;
      turnOrder.push(bluePlayers[blueIndex].id);
    }
  }

  return turnOrder;
}

// Start the game
export function startGame(game: TimesUpGameState): { game: TimesUpGameState; error?: string } {
  const orangePlayers = game.players.filter(p => p.team === 'orange');
  const bluePlayers = game.players.filter(p => p.team === 'blue');

  if (orangePlayers.length < TIMESUP_CONFIG.minPlayersPerTeam) {
    return { game, error: `El equipo naranja necesita al menos ${TIMESUP_CONFIG.minPlayersPerTeam} jugadores` };
  }

  if (bluePlayers.length < TIMESUP_CONFIG.minPlayersPerTeam) {
    return { game, error: `El equipo azul necesita al menos ${TIMESUP_CONFIG.minPlayersPerTeam} jugadores` };
  }

  // Get random cards and convert to TimesUpCard format
  const cardData = getRandomCards(TIMESUP_CONFIG.cardsPerGame);
  const cards: TimesUpCard[] = cardData.map(c => ({
    id: uuidv4(),
    name: c.name,
    category: c.category,
    guessedInRound: undefined,
    guessedBy: undefined,
  }));

  // Create turn order alternating between teams
  const turnOrder = createTurnOrder(game.players);

  return {
    game: {
      ...game,
      phase: 'round1',
      allCards: cards,
      remainingCards: shuffleArray(cards),
      guessedCards: [],
      turnOrder,
      currentTurnIndex: 0,
      currentTeam: 'orange',
      currentRound: 1,
      orangeScore: 0,
      blueScore: 0,
      roundScores: [],
      currentTurn: null,
      lastActivity: Date.now(),
    },
  };
}

// Start a turn
export function startTurn(game: TimesUpGameState): { game: TimesUpGameState; error?: string } {
  if (game.remainingCards.length === 0) {
    return { game, error: 'No quedan cartas en esta ronda' };
  }

  const currentPlayerId = game.turnOrder[game.currentTurnIndex];
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);

  if (!currentPlayer || !currentPlayer.team) {
    return { game, error: 'Jugador no encontrado o sin equipo' };
  }

  const startedAt = Date.now();
  const endsAt = startedAt + TIMESUP_CONFIG.turnDuration;

  const turn: TimesUpTurn = {
    playerId: currentPlayerId,
    team: currentPlayer.team,
    startedAt,
    endsAt,
    cardsGuessed: 0,
    currentCardIndex: 0,
    isActive: true,
  };

  // Shuffle remaining cards at start of turn
  const shuffledCards = shuffleArray(game.remainingCards);

  return {
    game: {
      ...game,
      currentTurn: turn,
      currentTeam: currentPlayer.team,
      remainingCards: shuffledCards,
      lastActivity: Date.now(),
    },
  };
}

// Guess correct - card is guessed successfully
export function guessCorrect(game: TimesUpGameState): {
  game: TimesUpGameState;
  roundEnded: boolean;
  error?: string;
} {
  if (!game.currentTurn || !game.currentTurn.isActive) {
    return { game, roundEnded: false, error: 'No hay turno activo' };
  }

  if (game.remainingCards.length === 0) {
    return { game, roundEnded: false, error: 'No quedan cartas' };
  }

  const currentCard = game.remainingCards[0];
  const team = game.currentTurn.team;

  // Mark card as guessed
  const guessedCard: TimesUpCard = {
    ...currentCard,
    guessedInRound: game.currentRound,
    guessedBy: team,
  };

  // Update scores
  const newOrangeScore = team === 'orange' ? game.orangeScore + 1 : game.orangeScore;
  const newBlueScore = team === 'blue' ? game.blueScore + 1 : game.blueScore;

  // Update player stats
  const updatedPlayers = game.players.map(p =>
    p.id === game.currentTurn?.playerId
      ? { ...p, cardsGuessedThisGame: p.cardsGuessedThisGame + 1 }
      : p
  );

  // Update turn
  const updatedTurn: TimesUpTurn = {
    ...game.currentTurn,
    cardsGuessed: game.currentTurn.cardsGuessed + 1,
  };

  // Remove card from remaining and add to guessed
  const newRemainingCards = game.remainingCards.slice(1);
  const newGuessedCards = [...game.guessedCards, guessedCard];

  // Check if round ended (no more cards)
  const roundEnded = newRemainingCards.length === 0;

  return {
    game: {
      ...game,
      players: updatedPlayers,
      currentTurn: updatedTurn,
      remainingCards: newRemainingCards,
      guessedCards: newGuessedCards,
      orangeScore: newOrangeScore,
      blueScore: newBlueScore,
      lastActivity: Date.now(),
    },
    roundEnded,
  };
}

// Skip card - move current card to end of deck
export function skipCard(game: TimesUpGameState): { game: TimesUpGameState; error?: string } {
  if (!game.currentTurn || !game.currentTurn.isActive) {
    return { game, error: 'No hay turno activo' };
  }

  if (game.remainingCards.length === 0) {
    return { game, error: 'No quedan cartas' };
  }

  // Only allow skipping in round 1 (describe with any words)
  // In round 2 and 3, skipping is typically not allowed
  // But we'll allow it for better gameplay flow

  // Move first card to end
  const [skippedCard, ...rest] = game.remainingCards;
  const newRemainingCards = [...rest, skippedCard];

  return {
    game: {
      ...game,
      remainingCards: newRemainingCards,
      lastActivity: Date.now(),
    },
  };
}

// End turn
export function endTurn(game: TimesUpGameState): { game: TimesUpGameState; error?: string } {
  if (!game.currentTurn) {
    return { game, error: 'No hay turno activo' };
  }

  // Mark turn as inactive
  const updatedTurn: TimesUpTurn = {
    ...game.currentTurn,
    isActive: false,
  };

  // Move to next player in turn order
  const nextTurnIndex = (game.currentTurnIndex + 1) % game.turnOrder.length;
  const nextPlayerId = game.turnOrder[nextTurnIndex];
  const nextPlayer = game.players.find(p => p.id === nextPlayerId);

  // Determine next team (alternates)
  const nextTeam: TimesUpTeam = game.currentTeam === 'orange' ? 'blue' : 'orange';

  return {
    game: {
      ...game,
      currentTurn: updatedTurn,
      currentTurnIndex: nextTurnIndex,
      currentTeam: nextTeam,
      lastActivity: Date.now(),
    },
  };
}

// Start next round
export function startNextRound(game: TimesUpGameState): { game: TimesUpGameState; error?: string } {
  if (game.currentRound >= 3) {
    return { game, error: 'Ya se completaron las 3 rondas' };
  }

  // Save current round scores
  const roundScore = {
    round: game.currentRound,
    orangeScore: game.orangeScore,
    blueScore: game.blueScore,
  };

  const newRound = game.currentRound + 1;
  let newPhase: TimesUpPhase;

  switch (newRound) {
    case 2:
      newPhase = 'round2';
      break;
    case 3:
      newPhase = 'round3';
      break;
    default:
      newPhase = 'round1';
  }

  // Reset all cards' guessed status for new round
  // but keep tracking which round they were guessed in total scores
  const resetCards = game.allCards.map(c => ({
    ...c,
    guessedInRound: undefined,
    guessedBy: undefined,
  }));

  return {
    game: {
      ...game,
      phase: newPhase,
      currentRound: newRound,
      remainingCards: shuffleArray(resetCards),
      guessedCards: [],
      roundScores: [...game.roundScores, roundScore],
      currentTurn: null,
      lastActivity: Date.now(),
    },
  };
}

// End game and calculate winner
export function endGame(game: TimesUpGameState): TimesUpGameState {
  // Save final round score
  const finalRoundScore = {
    round: game.currentRound,
    orangeScore: game.orangeScore,
    blueScore: game.blueScore,
  };

  // Determine winner
  let winner: TimesUpTeam | null = null;
  if (game.orangeScore > game.blueScore) {
    winner = 'orange';
  } else if (game.blueScore > game.orangeScore) {
    winner = 'blue';
  }
  // If tied, winner is null (draw)

  return {
    ...game,
    phase: 'finished',
    winner,
    roundScores: [...game.roundScores, finalRoundScore],
    currentTurn: null,
    lastActivity: Date.now(),
  };
}

// Reset game to lobby state
export function resetGame(game: TimesUpGameState): TimesUpGameState {
  const resetPlayers = game.players.map(p => ({
    ...p,
    team: null,
    cardsGuessedThisGame: 0,
  }));

  return {
    ...game,
    phase: 'lobby',
    players: resetPlayers,
    allCards: [],
    remainingCards: [],
    guessedCards: [],
    currentTurn: null,
    currentTeam: 'orange',
    turnOrder: [],
    currentTurnIndex: 0,
    orangeScore: 0,
    blueScore: 0,
    roundScores: [],
    currentRound: 0,
    winner: null,
    lastActivity: Date.now(),
  };
}

// Rejoin existing player
export function rejoinPlayer(
  game: TimesUpGameState,
  playerName: string
): { game: TimesUpGameState; player: TimesUpPlayer | null; error?: string } {
  const existingPlayer = game.players.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (existingPlayer) {
    return {
      game: {
        ...game,
        lastActivity: Date.now(),
      },
      player: existingPlayer,
    };
  }

  // If in lobby, allow adding new player
  if (game.phase === 'lobby') {
    const { game: updatedGame, player } = addPlayer(game, playerName);
    return { game: updatedGame, player };
  }

  return {
    game,
    player: null,
    error: 'Jugador no encontrado. La partida ya esta en curso.',
  };
}

// Helper function to get current card (for display)
export function getCurrentCard(game: TimesUpGameState): TimesUpCard | null {
  if (!game.currentTurn || game.remainingCards.length === 0) {
    return null;
  }
  return game.remainingCards[0];
}

// Helper to check if turn time has expired
export function isTurnExpired(game: TimesUpGameState): boolean {
  if (!game.currentTurn || !game.currentTurn.isActive) {
    return false;
  }
  return Date.now() >= game.currentTurn.endsAt;
}

// Helper to get time remaining in turn (in milliseconds)
export function getTimeRemaining(game: TimesUpGameState): number {
  if (!game.currentTurn || !game.currentTurn.isActive) {
    return 0;
  }
  const remaining = game.currentTurn.endsAt - Date.now();
  return Math.max(0, remaining);
}

// Helper to get round description
export function getRoundDescription(round: number): string {
  switch (round) {
    case 1:
      return 'Describe con cualquier palabra (excepto el nombre)';
    case 2:
      return 'Solo UNA palabra permitida';
    case 3:
      return 'Solo mimica (sin palabras)';
    default:
      return '';
  }
}

// Helper to get team players
export function getTeamPlayers(game: TimesUpGameState, team: TimesUpTeam): TimesUpPlayer[] {
  return game.players.filter(p => p.team === team);
}

// Helper to check if teams are balanced enough to start
export function canStartGame(game: TimesUpGameState): { canStart: boolean; error?: string } {
  const orangePlayers = game.players.filter(p => p.team === 'orange');
  const bluePlayers = game.players.filter(p => p.team === 'blue');
  const unassigned = game.players.filter(p => p.team === null);

  if (unassigned.length > 0) {
    return { canStart: false, error: `${unassigned.length} jugador(es) sin equipo asignado` };
  }

  if (orangePlayers.length < TIMESUP_CONFIG.minPlayersPerTeam) {
    return { canStart: false, error: `El equipo naranja necesita al menos ${TIMESUP_CONFIG.minPlayersPerTeam} jugadores` };
  }

  if (bluePlayers.length < TIMESUP_CONFIG.minPlayersPerTeam) {
    return { canStart: false, error: `El equipo azul necesita al menos ${TIMESUP_CONFIG.minPlayersPerTeam} jugadores` };
  }

  return { canStart: true };
}
