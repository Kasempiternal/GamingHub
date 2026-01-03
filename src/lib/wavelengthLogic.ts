// Wavelength (Longitud de Onda) - Game Logic
// Pure functions for game state management

import type {
  WavelengthGameState,
  WavelengthPlayer,
  WavelengthRound,
  WavelengthTeam,
  WavelengthSpectrumCard,
} from '@/types/game';
import { WAVELENGTH_CONFIG, WAVELENGTH_AVATARS } from '@/types/game';
import { getRandomCard } from './wavelengthCards';

// Generate a random room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate a unique player ID
function generatePlayerId(): string {
  return `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get a random avatar
function getRandomAvatar(usedAvatars: string[]): string {
  const available = WAVELENGTH_AVATARS.filter(a => !usedAvatars.includes(a));
  if (available.length === 0) {
    return WAVELENGTH_AVATARS[Math.floor(Math.random() * WAVELENGTH_AVATARS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Create a new game
export function createGame(hostName: string, deviceId?: string): WavelengthGameState {
  const usedAvatars: string[] = [];
  const hostAvatar = getRandomAvatar(usedAvatars);

  const host: WavelengthPlayer = {
    id: generatePlayerId(),
    name: hostName,
    deviceId,
    avatar: hostAvatar,
    team: null,
    isHost: true,
    isPsychic: false,
  };

  return {
    roomCode: generateRoomCode(),
    phase: 'lobby',
    players: [host],
    redTeam: [],
    blueTeam: [],
    redScore: 0,
    blueScore: 0,
    targetScore: WAVELENGTH_CONFIG.targetScore,
    currentRound: null,
    rounds: [],
    currentTeam: 'red', // Red always starts
    redPsychicIndex: 0,
    bluePsychicIndex: 0,
    usedCardIds: [],
    winner: null,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
}

// Add a player to the game
export function addPlayer(
  game: WavelengthGameState,
  name: string,
  deviceId?: string
): { game: WavelengthGameState; player: WavelengthPlayer } {
  const usedAvatars = game.players.map(p => p.avatar);
  const avatar = getRandomAvatar(usedAvatars);

  const player: WavelengthPlayer = {
    id: generatePlayerId(),
    name,
    deviceId,
    avatar,
    team: null,
    isHost: false,
    isPsychic: false,
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

// Join a team
export function joinTeam(
  game: WavelengthGameState,
  playerId: string,
  team: WavelengthTeam
): WavelengthGameState {
  // Remove from both teams first
  const newRedTeam = game.redTeam.filter(id => id !== playerId);
  const newBlueTeam = game.blueTeam.filter(id => id !== playerId);

  // Add to selected team
  if (team === 'red') {
    newRedTeam.push(playerId);
  } else {
    newBlueTeam.push(playerId);
  }

  return {
    ...game,
    redTeam: newRedTeam,
    blueTeam: newBlueTeam,
    players: game.players.map(p =>
      p.id === playerId ? { ...p, team } : p
    ),
    lastActivity: Date.now(),
  };
}

// Start the game
export function startGame(game: WavelengthGameState): { game: WavelengthGameState; error?: string } {
  if (game.redTeam.length < WAVELENGTH_CONFIG.minPlayersPerTeam) {
    return { game, error: `El equipo rojo necesita al menos ${WAVELENGTH_CONFIG.minPlayersPerTeam} jugadores` };
  }
  if (game.blueTeam.length < WAVELENGTH_CONFIG.minPlayersPerTeam) {
    return { game, error: `El equipo azul necesita al menos ${WAVELENGTH_CONFIG.minPlayersPerTeam} jugadores` };
  }

  // Start first round
  const { game: gameWithRound } = startNewRound(game);

  return {
    game: {
      ...gameWithRound,
      phase: 'psychicClue',
      lastActivity: Date.now(),
    },
  };
}

// Start a new round
function startNewRound(game: WavelengthGameState): { game: WavelengthGameState } {
  const currentTeam = game.currentTeam;
  const teamMembers = currentTeam === 'red' ? game.redTeam : game.blueTeam;
  const psychicIndex = currentTeam === 'red' ? game.redPsychicIndex : game.bluePsychicIndex;

  // Get psychic for this round
  const psychicId = teamMembers[psychicIndex % teamMembers.length];

  // Get a random spectrum card
  const spectrumCard = getRandomCard(game.usedCardIds);

  // Generate random target position (0-100)
  const targetPosition = Math.floor(Math.random() * 101);

  const newRound: WavelengthRound = {
    roundNumber: game.rounds.length + 1,
    psychicId,
    psychicTeam: currentTeam,
    spectrumCard,
    targetPosition,
    clue: null,
    teamGuess: null,
    counterGuess: null,
    pointsAwarded: 0,
    counterPointAwarded: false,
    startedAt: Date.now(),
    endedAt: null,
  };

  // Update psychic status
  const updatedPlayers = game.players.map(p => ({
    ...p,
    isPsychic: p.id === psychicId,
  }));

  return {
    game: {
      ...game,
      currentRound: newRound,
      players: updatedPlayers,
      usedCardIds: [...game.usedCardIds, spectrumCard.id],
      lastActivity: Date.now(),
    },
  };
}

// Submit a clue (psychic only)
export function submitClue(
  game: WavelengthGameState,
  playerId: string,
  clue: string
): { game: WavelengthGameState; error?: string } {
  if (!game.currentRound) {
    return { game, error: 'No hay ronda activa' };
  }

  if (game.currentRound.psychicId !== playerId) {
    return { game, error: 'Solo el psíquico puede dar pistas' };
  }

  if (game.phase !== 'psychicClue') {
    return { game, error: 'No es momento de dar pistas' };
  }

  const trimmedClue = clue.trim();
  if (!trimmedClue || trimmedClue.length < 1) {
    return { game, error: 'La pista no puede estar vacía' };
  }

  return {
    game: {
      ...game,
      currentRound: {
        ...game.currentRound,
        clue: trimmedClue,
      },
      phase: 'teamGuess',
      lastActivity: Date.now(),
    },
  };
}

// Submit team guess
export function submitTeamGuess(
  game: WavelengthGameState,
  guess: number
): { game: WavelengthGameState; error?: string } {
  if (!game.currentRound) {
    return { game, error: 'No hay ronda activa' };
  }

  if (game.phase !== 'teamGuess') {
    return { game, error: 'No es momento de adivinar' };
  }

  // Clamp guess to 0-100
  const clampedGuess = Math.max(0, Math.min(100, Math.round(guess)));

  return {
    game: {
      ...game,
      currentRound: {
        ...game.currentRound,
        teamGuess: clampedGuess,
      },
      phase: 'counterGuess',
      lastActivity: Date.now(),
    },
  };
}

// Submit counter guess (opposing team)
export function submitCounterGuess(
  game: WavelengthGameState,
  direction: 'left' | 'right'
): { game: WavelengthGameState; error?: string } {
  if (!game.currentRound) {
    return { game, error: 'No hay ronda activa' };
  }

  if (game.phase !== 'counterGuess') {
    return { game, error: 'No es momento de contra-adivinar' };
  }

  return {
    game: {
      ...game,
      currentRound: {
        ...game.currentRound,
        counterGuess: direction,
      },
      phase: 'reveal',
      lastActivity: Date.now(),
    },
  };
}

// Calculate points based on guess accuracy
function calculatePoints(targetPosition: number, guess: number): number {
  const distance = Math.abs(targetPosition - guess);

  if (distance <= WAVELENGTH_CONFIG.bullseyeRange) {
    return 4; // Bullseye!
  } else if (distance <= WAVELENGTH_CONFIG.closeRange) {
    return 3; // Close
  } else if (distance <= WAVELENGTH_CONFIG.okRange) {
    return 2; // OK
  }
  return 0; // Miss
}

// Check if counter guess is correct
function isCounterGuessCorrect(
  targetPosition: number,
  teamGuess: number,
  counterGuess: 'left' | 'right'
): boolean {
  if (targetPosition === teamGuess) {
    return false; // Exact hit, no counter point
  }

  const targetIsLeft = targetPosition < teamGuess;
  return (targetIsLeft && counterGuess === 'left') || (!targetIsLeft && counterGuess === 'right');
}

// Reveal results and calculate scores
export function revealResult(game: WavelengthGameState): {
  game: WavelengthGameState;
  pointsAwarded: number;
  counterPointAwarded: boolean;
} {
  if (!game.currentRound || game.currentRound.teamGuess === null) {
    return { game, pointsAwarded: 0, counterPointAwarded: false };
  }

  const { targetPosition, teamGuess, counterGuess, psychicTeam } = game.currentRound;

  // Calculate points
  const pointsAwarded = calculatePoints(targetPosition, teamGuess);

  // Check counter guess (only if team didn't get 4 points)
  let counterPointAwarded = false;
  if (pointsAwarded < 4 && counterGuess) {
    counterPointAwarded = isCounterGuessCorrect(targetPosition, teamGuess, counterGuess);
  }

  // Update scores
  let newRedScore = game.redScore;
  let newBlueScore = game.blueScore;

  if (psychicTeam === 'red') {
    newRedScore += pointsAwarded;
    if (counterPointAwarded) {
      newBlueScore += 1;
    }
  } else {
    newBlueScore += pointsAwarded;
    if (counterPointAwarded) {
      newRedScore += 1;
    }
  }

  // Check for winner
  let winner: WavelengthTeam | null = null;
  if (newRedScore >= game.targetScore && newBlueScore >= game.targetScore) {
    // Both reached target - highest wins
    winner = newRedScore > newBlueScore ? 'red' : 'blue';
  } else if (newRedScore >= game.targetScore) {
    winner = 'red';
  } else if (newBlueScore >= game.targetScore) {
    winner = 'blue';
  }

  const updatedRound: WavelengthRound = {
    ...game.currentRound,
    pointsAwarded,
    counterPointAwarded,
    endedAt: Date.now(),
  };

  return {
    game: {
      ...game,
      currentRound: updatedRound,
      rounds: [...game.rounds, updatedRound],
      redScore: newRedScore,
      blueScore: newBlueScore,
      winner,
      phase: winner ? 'finished' : 'roundEnd',
      lastActivity: Date.now(),
    },
    pointsAwarded,
    counterPointAwarded,
  };
}

// Start next round
export function nextRound(game: WavelengthGameState): { game: WavelengthGameState; error?: string } {
  if (game.phase !== 'roundEnd') {
    return { game, error: 'No es momento de continuar' };
  }

  if (game.winner) {
    return { game, error: 'El juego ha terminado' };
  }

  // Switch teams
  const nextTeam: WavelengthTeam = game.currentTeam === 'red' ? 'blue' : 'red';

  // Update psychic index for the team that just played
  let newRedIndex = game.redPsychicIndex;
  let newBlueIndex = game.bluePsychicIndex;

  if (game.currentTeam === 'red') {
    newRedIndex = (game.redPsychicIndex + 1) % game.redTeam.length;
  } else {
    newBlueIndex = (game.bluePsychicIndex + 1) % game.blueTeam.length;
  }

  const gameWithUpdatedIndexes: WavelengthGameState = {
    ...game,
    currentTeam: nextTeam,
    redPsychicIndex: newRedIndex,
    bluePsychicIndex: newBlueIndex,
  };

  // Start new round
  const { game: gameWithRound } = startNewRound(gameWithUpdatedIndexes);

  return {
    game: {
      ...gameWithRound,
      phase: 'psychicClue',
      lastActivity: Date.now(),
    },
  };
}

// Reset game to lobby
export function resetGame(game: WavelengthGameState): WavelengthGameState {
  return {
    ...game,
    phase: 'lobby',
    redScore: 0,
    blueScore: 0,
    currentRound: null,
    rounds: [],
    currentTeam: 'red',
    redPsychicIndex: 0,
    bluePsychicIndex: 0,
    usedCardIds: [],
    winner: null,
    players: game.players.map(p => ({ ...p, isPsychic: false })),
    lastActivity: Date.now(),
  };
}

// Rejoin player by name
export function rejoinPlayer(
  game: WavelengthGameState,
  playerName: string
): { game: WavelengthGameState; player: WavelengthPlayer | null; error?: string } {
  const existingPlayer = game.players.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (!existingPlayer) {
    return { game, player: null, error: 'Jugador no encontrado' };
  }

  return {
    game: { ...game, lastActivity: Date.now() },
    player: existingPlayer,
  };
}

// Skip counter guess (for faster gameplay or if opposing team doesn't want to guess)
export function skipCounterGuess(game: WavelengthGameState): { game: WavelengthGameState; error?: string } {
  if (!game.currentRound) {
    return { game, error: 'No hay ronda activa' };
  }

  if (game.phase !== 'counterGuess') {
    return { game, error: 'No es momento de contra-adivinar' };
  }

  return {
    game: {
      ...game,
      phase: 'reveal',
      lastActivity: Date.now(),
    },
  };
}
