// Impostor Game - Core Game Logic

import { v4 as uuidv4 } from 'uuid';
import { getRandomWordPair } from '@/data/impostorWords';
import type {
  ImpostorGameState,
  ImpostorPlayer,
  ImpostorRole,
  ImpostorPhase,
  ImpostorWordPair,
  ImpostorRound,
  AVATARS
} from '@/types/game';

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get random avatar
export function getRandomAvatar(usedAvatars: string[]): string {
  const avatars = [
    '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
    '🐵', '🐔', '🐧', '🦉', '🦅', '🐺', '🐗',
    '🦝', '🐻', '🐶', '🐱', '🐰', '🐹', '🐭', '🦄'
  ];
  const available = avatars.filter(a => !usedAvatars.includes(a));
  if (available.length === 0) return avatars[Math.floor(Math.random() * avatars.length)];
  return available[Math.floor(Math.random() * available.length)];
}

// Create initial game state
export function createGame(hostName: string): ImpostorGameState {
  const roomCode = generateRoomCode();
  const avatar = getRandomAvatar([]);

  const host: ImpostorPlayer = {
    id: uuidv4(),
    name: hostName,
    avatar,
    role: null,
    word: null,
    hint: null,
    hasDescribed: false,
    hasVoted: false,
    votedFor: null,
    isEliminated: false,
    isHost: true,
    points: 0,
  };

  const now = Date.now();

  return {
    roomCode,
    phase: 'lobby',
    players: [host],
    currentWordPair: null,
    rounds: [],
    currentRound: 0,
    currentSpeaker: null,
    speakerOrder: [],
    speakerIndex: 0,
    votingResults: {},
    winner: null,
    winReason: null,
    impostorCount: 1,
    mrWhiteCount: 0,
    createdAt: now,
    lastActivity: now,
    revealingPlayer: null,
    lastKickedPlayer: null,
  };
}

// Add a player to the game
export function addPlayer(game: ImpostorGameState, playerName: string): { game: ImpostorGameState; player: ImpostorPlayer } {
  const usedAvatars = game.players.map(p => p.avatar);
  const avatar = getRandomAvatar(usedAvatars);

  const player: ImpostorPlayer = {
    id: uuidv4(),
    name: playerName,
    avatar,
    role: null,
    word: null,
    hint: null,
    hasDescribed: false,
    hasVoted: false,
    votedFor: null,
    isEliminated: false,
    isHost: false,
    points: 0,
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

// Calculate impostor count based on player count
export function calculateRoles(playerCount: number): { impostorCount: number; mrWhiteCount: number } {
  if (playerCount <= 4) {
    return { impostorCount: 1, mrWhiteCount: 0 };
  } else if (playerCount <= 6) {
    return { impostorCount: 1, mrWhiteCount: 0 };
  } else if (playerCount <= 8) {
    return { impostorCount: 2, mrWhiteCount: 0 };
  } else if (playerCount <= 10) {
    return { impostorCount: 2, mrWhiteCount: 1 };
  } else {
    return { impostorCount: 3, mrWhiteCount: 1 };
  }
}

// Assign roles to players
function assignRoles(players: ImpostorPlayer[], wordPair: ImpostorWordPair, impostorCount: number, mrWhiteCount: number): ImpostorPlayer[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  return shuffled.map((player, index) => {
    let role: ImpostorRole;
    let word: string | null;
    let hint: string | null;

    if (index < impostorCount) {
      role = 'impostor';
      word = wordPair.impostor;
      hint = wordPair.hint;
    } else if (index < impostorCount + mrWhiteCount) {
      role = 'mr-white';
      word = null;
      hint = wordPair.hint;
    } else {
      role = 'civilian';
      word = wordPair.civilian;
      hint = null;
    }

    return {
      ...player,
      role,
      word,
      hint,
      hasDescribed: false,
      hasVoted: false,
      votedFor: null,
    };
  });
}

// Start the game
export function startGame(game: ImpostorGameState): { game: ImpostorGameState; error?: string } {
  if (game.players.length < 3) {
    return { game, error: 'Se necesitan al menos 3 jugadores' };
  }

  const { impostorCount, mrWhiteCount } = calculateRoles(game.players.length);
  const wordPair = getRandomWordPair();
  const playersWithRoles = assignRoles(game.players, wordPair, impostorCount, mrWhiteCount);

  // Create random speaker order
  const activePlayers = playersWithRoles.filter(p => !p.isEliminated);
  const speakerOrder = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);

  return {
    game: {
      ...game,
      phase: 'description',
      players: playersWithRoles,
      currentWordPair: wordPair,
      impostorCount,
      mrWhiteCount,
      currentRound: 1,
      speakerOrder,
      speakerIndex: 0,
      currentSpeaker: speakerOrder[0],
      rounds: [{
        roundNumber: 1,
        eliminatedPlayer: null,
        votes: [],
        startedAt: Date.now(),
        endedAt: null,
      }],
      lastActivity: Date.now(),
    },
  };
}

// Player gives their description
export function giveDescription(game: ImpostorGameState, playerId: string): { game: ImpostorGameState; error?: string } {
  const player = game.players.find(p => p.id === playerId);

  if (!player) {
    return { game, error: 'Jugador no encontrado' };
  }

  if (player.isEliminated) {
    return { game, error: 'Has sido eliminado' };
  }

  if (game.currentSpeaker !== playerId) {
    return { game, error: 'No es tu turno para describir' };
  }

  // Mark player as having described
  const updatedPlayers = game.players.map(p =>
    p.id === playerId ? { ...p, hasDescribed: true } : p
  );

  // Move to next speaker
  const nextIndex = game.speakerIndex + 1;

  // Check if all players have described
  if (nextIndex >= game.speakerOrder.length) {
    // Move to discussion phase
    return {
      game: {
        ...game,
        players: updatedPlayers,
        phase: 'discussion',
        currentSpeaker: null,
        speakerIndex: 0,
        lastActivity: Date.now(),
      },
    };
  }

  // Move to next speaker
  return {
    game: {
      ...game,
      players: updatedPlayers,
      speakerIndex: nextIndex,
      currentSpeaker: game.speakerOrder[nextIndex],
      lastActivity: Date.now(),
    },
  };
}

// Start voting phase
export function startVoting(game: ImpostorGameState): { game: ImpostorGameState; error?: string } {
  if (game.phase !== 'discussion') {
    return { game, error: 'No se puede iniciar votacion ahora' };
  }

  // Reset votes
  const updatedPlayers = game.players.map(p => ({
    ...p,
    hasVoted: false,
    votedFor: null,
  }));

  return {
    game: {
      ...game,
      players: updatedPlayers,
      phase: 'voting',
      votingResults: {},
      lastActivity: Date.now(),
    },
  };
}

// Player votes for someone
export function castVote(game: ImpostorGameState, voterId: string, targetId: string): { game: ImpostorGameState; allVoted: boolean; error?: string } {
  const voter = game.players.find(p => p.id === voterId);
  const target = game.players.find(p => p.id === targetId);

  if (!voter || voter.isEliminated) {
    return { game, allVoted: false, error: 'No puedes votar' };
  }

  if (!target || target.isEliminated) {
    return { game, allVoted: false, error: 'Objetivo invalido' };
  }

  if (voter.hasVoted) {
    return { game, allVoted: false, error: 'Ya has votado' };
  }

  if (voterId === targetId) {
    return { game, allVoted: false, error: 'No puedes votar por ti mismo' };
  }

  // Update voter
  const updatedPlayers = game.players.map(p =>
    p.id === voterId ? { ...p, hasVoted: true, votedFor: targetId } : p
  );

  // Update voting results
  const newVotingResults = { ...game.votingResults };
  newVotingResults[targetId] = (newVotingResults[targetId] || 0) + 1;

  // Update current round with vote
  const currentRound = game.rounds[game.rounds.length - 1];
  const updatedRound: ImpostorRound = {
    ...currentRound,
    votes: [...currentRound.votes, { voterId, targetId, timestamp: Date.now() }],
  };
  const updatedRounds = [...game.rounds.slice(0, -1), updatedRound];

  // Check if all active players have voted
  const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
  const allVoted = activePlayers.every(p => p.hasVoted);

  return {
    game: {
      ...game,
      players: updatedPlayers,
      votingResults: newVotingResults,
      rounds: updatedRounds,
      lastActivity: Date.now(),
    },
    allVoted,
  };
}

// Reveal voting results and eliminate player
export function revealVotes(game: ImpostorGameState): { game: ImpostorGameState; eliminatedPlayer: ImpostorPlayer | null; gameEnded: boolean } {
  // Find player with most votes
  let maxVotes = 0;
  let eliminatedId: string | null = null;
  let tie = false;

  for (const [playerId, votes] of Object.entries(game.votingResults)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminatedId = playerId;
      tie = false;
    } else if (votes === maxVotes) {
      tie = true;
    }
  }

  // If tie, no one is eliminated (or random, but we'll skip for simplicity)
  if (tie || !eliminatedId || maxVotes === 0) {
    return {
      game: {
        ...game,
        phase: 'reveal',
        revealingPlayer: null,
        lastActivity: Date.now(),
      },
      eliminatedPlayer: null,
      gameEnded: false,
    };
  }

  // Eliminate the player
  const eliminatedPlayer = game.players.find(p => p.id === eliminatedId);
  const updatedPlayers = game.players.map(p =>
    p.id === eliminatedId ? { ...p, isEliminated: true } : p
  );

  // Update round
  const currentRound = game.rounds[game.rounds.length - 1];
  const updatedRound: ImpostorRound = {
    ...currentRound,
    eliminatedPlayer: eliminatedId,
    endedAt: Date.now(),
  };
  const updatedRounds = [...game.rounds.slice(0, -1), updatedRound];

  // Check win conditions
  const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
  const remainingImpostors = remainingPlayers.filter(p => p.role === 'impostor' || p.role === 'mr-white');
  const remainingCivilians = remainingPlayers.filter(p => p.role === 'civilian');

  let winner: 'civilians' | 'impostors' | null = null;
  let winReason: string | null = null;

  // Impostors win if they equal or outnumber civilians
  if (remainingImpostors.length >= remainingCivilians.length && remainingImpostors.length > 0) {
    winner = 'impostors';
    winReason = 'Los impostores dominan';
  }
  // Civilians win if all impostors are eliminated
  else if (remainingImpostors.length === 0) {
    winner = 'civilians';
    winReason = 'Todos los impostores fueron eliminados';
  }

  return {
    game: {
      ...game,
      players: updatedPlayers,
      rounds: updatedRounds,
      phase: 'reveal',
      revealingPlayer: eliminatedId,
      lastKickedPlayer: eliminatedId,
      winner,
      winReason,
      lastActivity: Date.now(),
    },
    eliminatedPlayer: eliminatedPlayer || null,
    gameEnded: winner !== null,
  };
}

// Start next round
export function startNextRound(game: ImpostorGameState): { game: ImpostorGameState; error?: string } {
  if (game.winner) {
    return { game, error: 'El juego ha terminado' };
  }

  // Get new word pair
  const wordPair = getRandomWordPair();

  // Assign new words to remaining players (keeping their roles)
  const updatedPlayers = game.players.map(p => {
    if (p.isEliminated) return p;

    return {
      ...p,
      word: p.role === 'civilian' ? wordPair.civilian : (p.role === 'impostor' ? wordPair.impostor : null),
      hint: p.role === 'mr-white' || p.role === 'impostor' ? wordPair.hint : null,
      hasDescribed: false,
      hasVoted: false,
      votedFor: null,
    };
  });

  // Create new speaker order from remaining players
  const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
  const speakerOrder = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);

  const newRoundNumber = game.currentRound + 1;

  return {
    game: {
      ...game,
      players: updatedPlayers,
      currentWordPair: wordPair,
      phase: 'description',
      currentRound: newRoundNumber,
      speakerOrder,
      speakerIndex: 0,
      currentSpeaker: speakerOrder[0],
      votingResults: {},
      revealingPlayer: null,
      rounds: [
        ...game.rounds,
        {
          roundNumber: newRoundNumber,
          eliminatedPlayer: null,
          votes: [],
          startedAt: Date.now(),
          endedAt: null,
        }
      ],
      lastActivity: Date.now(),
    },
  };
}

// End game and show results
export function endGame(game: ImpostorGameState): ImpostorGameState {
  // Calculate points
  const updatedPlayers = game.players.map(p => {
    let points = p.points;

    if (game.winner === 'civilians' && p.role === 'civilian' && !p.isEliminated) {
      points += 2;
    } else if (game.winner === 'impostors') {
      if (p.role === 'impostor' && !p.isEliminated) {
        points += 10;
      } else if (p.role === 'mr-white' && !p.isEliminated) {
        points += 6;
      }
    }

    return { ...p, points };
  });

  return {
    ...game,
    players: updatedPlayers,
    phase: 'finished',
    lastActivity: Date.now(),
  };
}

// Reset game for new round
export function resetGame(game: ImpostorGameState): ImpostorGameState {
  const resetPlayers = game.players.map(p => ({
    ...p,
    role: null,
    word: null,
    hint: null,
    hasDescribed: false,
    hasVoted: false,
    votedFor: null,
    isEliminated: false,
  }));

  return {
    ...game,
    phase: 'lobby',
    players: resetPlayers,
    currentWordPair: null,
    rounds: [],
    currentRound: 0,
    currentSpeaker: null,
    speakerOrder: [],
    speakerIndex: 0,
    votingResults: {},
    winner: null,
    winReason: null,
    revealingPlayer: null,
    lastKickedPlayer: null,
    lastActivity: Date.now(),
  };
}

// Rejoin existing player
export function rejoinPlayer(
  game: ImpostorGameState,
  playerName: string
): { game: ImpostorGameState; player: ImpostorPlayer | null; error?: string } {
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

  if (game.phase === 'lobby') {
    const { game: updatedGame, player } = addPlayer(game, playerName);
    return { game: updatedGame, player };
  }

  return { game, player: null, error: 'Jugador no encontrado. La partida ya esta en curso.' };
}
