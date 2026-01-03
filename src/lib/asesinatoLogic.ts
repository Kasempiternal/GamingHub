// Asesinato en Hong Kong - Core Game Logic
// Based on Deception: Murder in Hong Kong

import { v4 as uuidv4 } from 'uuid';
import {
  getShuffledClueCards,
  getShuffledMeansCards,
  getRandomSceneTiles,
  getCauseOfDeathTile,
  getLocationTile,
  getAllSceneTiles,
} from '@/data/asesinatoCards';
import type {
  AsesinatoGameState,
  AsesinatoPlayer,
  AsesinatoRole,
  AsesinatoClueCard,
  AsesinatoMeansCard,
  AsesinatoSceneTile,
  AsesinatoAccusation,
  AsesinatoRound,
  ASESINATO_CONFIG,
  ASESINATO_AVATARS,
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

// Get random avatar from the mystery-themed set (using reliably-rendered emojis)
export function getRandomAvatar(usedAvatars: string[]): string {
  const avatars = [
    '🔍', '🔎', '🔬', '🧪', '💉', '🔪', '💀', '🦴',
    '🩸', '🧬', '📋', '🔦', '🎭', '🖤', '👁', '🌙'
  ];
  const available = avatars.filter(a => !usedAvatars.includes(a));
  if (available.length === 0) return avatars[Math.floor(Math.random() * avatars.length)];
  return available[Math.floor(Math.random() * available.length)];
}

// Create initial game state
export function createGame(hostName: string, deviceId?: string): AsesinatoGameState {
  const roomCode = generateRoomCode();
  const avatar = getRandomAvatar([]);

  const host: AsesinatoPlayer = {
    id: uuidv4(),
    name: hostName,
    deviceId,
    avatar,
    role: null,
    clueCards: [],
    meansCards: [],
    hasAccused: false,
    isHost: true,
  };

  const now = Date.now();

  return {
    roomCode,
    phase: 'lobby',
    players: [host],
    solution: null,
    sceneTiles: [],
    causeOfDeathTile: null,
    locationTile: null,
    availableSceneTiles: getAllSceneTiles(),
    currentRound: 0,
    maxRounds: 3,
    rounds: [],
    discussionDeadline: null,
    discussionDuration: 180000, // 3 minutes
    forensicReady: false,
    winner: null,
    winReason: null,
    allAccusations: [],
    createdAt: now,
    lastActivity: now,
  };
}

// Add a player to the game
export function addPlayer(
  game: AsesinatoGameState,
  playerName: string,
  deviceId?: string
): { game: AsesinatoGameState; player: AsesinatoPlayer } {
  const usedAvatars = game.players.map(p => p.avatar);
  const avatar = getRandomAvatar(usedAvatars);

  const player: AsesinatoPlayer = {
    id: uuidv4(),
    name: playerName,
    deviceId,
    avatar,
    role: null,
    clueCards: [],
    meansCards: [],
    hasAccused: false,
    isHost: false,
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

// Get role distribution based on player count
function getRoleDistribution(playerCount: number): { forensicScientist: number; murderer: number; accomplice: number; witness: number; investigator: number } {
  const distributions: Record<number, { forensicScientist: number; murderer: number; accomplice: number; witness: number; investigator: number }> = {
    4: { forensicScientist: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 2 },
    5: { forensicScientist: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 3 },
    6: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 0, investigator: 3 },
    7: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 3 },
    8: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 4 },
    9: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 5 },
    10: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 6 },
    11: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 7 },
    12: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 8 },
  };

  return distributions[playerCount] || distributions[12];
}

// Assign roles to players
function assignRoles(players: AsesinatoPlayer[]): AsesinatoPlayer[] {
  const playerCount = players.length;
  const distribution = getRoleDistribution(playerCount);

  // Create role array
  const roles: AsesinatoRole[] = [];
  for (let i = 0; i < distribution.forensicScientist; i++) roles.push('forensicScientist');
  for (let i = 0; i < distribution.murderer; i++) roles.push('murderer');
  for (let i = 0; i < distribution.accomplice; i++) roles.push('accomplice');
  for (let i = 0; i < distribution.witness; i++) roles.push('witness');
  for (let i = 0; i < distribution.investigator; i++) roles.push('investigator');

  // Shuffle roles
  const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

  // Assign to players
  return players.map((player, index) => ({
    ...player,
    role: shuffledRoles[index],
  }));
}

// Deal cards to players
function dealCards(players: AsesinatoPlayer[]): AsesinatoPlayer[] {
  const clueCards = getShuffledClueCards();
  const meansCards = getShuffledMeansCards();

  const cardsPerPlayer = 4;

  return players.map((player, index) => ({
    ...player,
    clueCards: clueCards.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer),
    meansCards: meansCards.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer),
  }));
}

// Start the game
export function startGame(game: AsesinatoGameState): { game: AsesinatoGameState; error?: string } {
  if (game.players.length < 4) {
    return { game, error: 'Se necesitan al menos 4 jugadores' };
  }

  if (game.players.length > 12) {
    return { game, error: 'Máximo 12 jugadores' };
  }

  // Assign roles
  let playersWithRoles = assignRoles(game.players);

  // Deal cards
  playersWithRoles = dealCards(playersWithRoles);

  return {
    game: {
      ...game,
      phase: 'roleReveal',
      players: playersWithRoles,
      lastActivity: Date.now(),
    },
  };
}

// Proceed from role reveal to murder selection
export function proceedToMurderSelection(game: AsesinatoGameState): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'roleReveal') {
    return { game, error: 'No se puede avanzar en esta fase' };
  }

  return {
    game: {
      ...game,
      phase: 'murderSelection',
      lastActivity: Date.now(),
    },
  };
}

// Murderer selects the solution (1 clue card + 1 means card from their own cards)
export function selectMurderSolution(
  game: AsesinatoGameState,
  murdererId: string,
  clueCardId: string,
  meansCardId: string
): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'murderSelection') {
    return { game, error: 'No es el momento de seleccionar el crimen' };
  }

  const murderer = game.players.find(p => p.id === murdererId);
  if (!murderer) {
    return { game, error: 'Jugador no encontrado' };
  }

  if (murderer.role !== 'murderer') {
    return { game, error: 'Solo el asesino puede seleccionar el crimen' };
  }

  // Verify the cards belong to the murderer
  const hasClueCard = murderer.clueCards.some(c => c.id === clueCardId);
  const hasMeansCard = murderer.meansCards.some(c => c.id === meansCardId);

  if (!hasClueCard || !hasMeansCard) {
    return { game, error: 'Debes seleccionar cartas de tu propia mano' };
  }

  // Set up scene tiles for round 1
  const usedTileIds: string[] = [];
  const sceneTiles = getRandomSceneTiles(4, usedTileIds);
  const causeOfDeathTile = getCauseOfDeathTile();
  const locationTile = getLocationTile();

  // Update available tiles (remove used ones)
  const usedIds = [causeOfDeathTile.id, locationTile.id, ...sceneTiles.map(t => t.id)];
  const availableSceneTiles = game.availableSceneTiles.filter(t => !usedIds.includes(t.id));

  return {
    game: {
      ...game,
      phase: 'clueGiving',
      solution: {
        murdererPlayerId: murdererId,
        keyEvidenceId: clueCardId,
        meansOfMurderId: meansCardId,
      },
      sceneTiles,
      causeOfDeathTile,
      locationTile,
      availableSceneTiles,
      currentRound: 1,
      forensicReady: false,
      rounds: [{
        roundNumber: 1,
        sceneTilesRevealed: sceneTiles.map(t => t.id),
        replacedTileId: null,
        accusations: [],
        startedAt: Date.now(),
        endedAt: null,
      }],
      lastActivity: Date.now(),
    },
  };
}

// Forensic Scientist selects an option on a scene tile
export function selectSceneTileOption(
  game: AsesinatoGameState,
  playerId: string,
  tileId: string,
  optionIndex: number
): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'clueGiving') {
    return { game, error: 'No es el momento de dar pistas' };
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensicScientist') {
    return { game, error: 'Solo el Científico Forense puede seleccionar pistas' };
  }

  // Find the tile to update
  const updateTile = (tile: AsesinatoSceneTile | null): AsesinatoSceneTile | null => {
    if (!tile || tile.id !== tileId || tile.isLocked) return tile;
    return { ...tile, selectedOption: optionIndex };
  };

  const updatedSceneTiles = game.sceneTiles.map(t =>
    t.id === tileId && !t.isLocked ? { ...t, selectedOption: optionIndex } : t
  );

  return {
    game: {
      ...game,
      sceneTiles: updatedSceneTiles,
      causeOfDeathTile: updateTile(game.causeOfDeathTile),
      locationTile: updateTile(game.locationTile),
      lastActivity: Date.now(),
    },
  };
}

// Forensic Scientist indicates they're done placing clues
export function confirmClues(
  game: AsesinatoGameState,
  playerId: string
): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'clueGiving') {
    return { game, error: 'No es el momento de confirmar pistas' };
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensicScientist') {
    return { game, error: 'Solo el Científico Forense puede confirmar' };
  }

  // Lock all current tiles
  const lockTile = (tile: AsesinatoSceneTile | null): AsesinatoSceneTile | null => {
    if (!tile) return null;
    return { ...tile, isLocked: true };
  };

  const lockedSceneTiles = game.sceneTiles.map(t => ({ ...t, isLocked: true }));

  return {
    game: {
      ...game,
      phase: 'discussion',
      sceneTiles: lockedSceneTiles,
      causeOfDeathTile: lockTile(game.causeOfDeathTile),
      locationTile: lockTile(game.locationTile),
      forensicReady: true,
      discussionDeadline: Date.now() + game.discussionDuration,
      lastActivity: Date.now(),
    },
  };
}

// Replace a scene tile (rounds 2-3)
export function replaceSceneTile(
  game: AsesinatoGameState,
  playerId: string,
  oldTileId: string,
  newTileId: string
): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'clueGiving') {
    return { game, error: 'No es el momento de reemplazar fichas' };
  }

  if (game.currentRound < 2) {
    return { game, error: 'Solo puedes reemplazar fichas en las rondas 2 y 3' };
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensicScientist') {
    return { game, error: 'Solo el Científico Forense puede reemplazar fichas' };
  }

  // Find the new tile in available tiles
  const newTile = game.availableSceneTiles.find(t => t.id === newTileId);
  if (!newTile) {
    return { game, error: 'Ficha no disponible' };
  }

  // Check if current round already has a replacement
  const currentRound = game.rounds[game.rounds.length - 1];
  if (currentRound.replacedTileId) {
    return { game, error: 'Ya reemplazaste una ficha esta ronda' };
  }

  // Replace the old tile with the new one
  const updatedSceneTiles = game.sceneTiles.map(t =>
    t.id === oldTileId ? { ...newTile, selectedOption: null, isLocked: false } : t
  );

  // Update available tiles
  const oldTile = game.sceneTiles.find(t => t.id === oldTileId);
  const updatedAvailableTiles = game.availableSceneTiles
    .filter(t => t.id !== newTileId)
    .concat(oldTile ? [{ ...oldTile, selectedOption: null, isLocked: false }] : []);

  // Update round
  const updatedRounds = [...game.rounds];
  updatedRounds[updatedRounds.length - 1] = {
    ...currentRound,
    replacedTileId: newTileId,
    sceneTilesRevealed: [...currentRound.sceneTilesRevealed, newTileId],
  };

  return {
    game: {
      ...game,
      sceneTiles: updatedSceneTiles,
      availableSceneTiles: updatedAvailableTiles,
      rounds: updatedRounds,
      lastActivity: Date.now(),
    },
  };
}

// Make an accusation
export function makeAccusation(
  game: AsesinatoGameState,
  accuserId: string,
  targetPlayerId: string,
  clueCardId: string,
  meansCardId: string
): { game: AsesinatoGameState; isCorrect: boolean; error?: string } {
  if (game.phase !== 'discussion') {
    return { game, isCorrect: false, error: 'No es el momento de acusar' };
  }

  const accuser = game.players.find(p => p.id === accuserId);
  if (!accuser) {
    return { game, isCorrect: false, error: 'Jugador no encontrado' };
  }

  // Forensic Scientist cannot accuse
  if (accuser.role === 'forensicScientist') {
    return { game, isCorrect: false, error: 'El Científico Forense no puede acusar' };
  }

  // Check if player has already accused
  if (accuser.hasAccused) {
    return { game, isCorrect: false, error: 'Ya usaste tu acusación' };
  }

  const target = game.players.find(p => p.id === targetPlayerId);
  if (!target) {
    return { game, isCorrect: false, error: 'Jugador objetivo no encontrado' };
  }

  // Verify the cards belong to the target
  const targetClueCard = target.clueCards.find(c => c.id === clueCardId);
  const targetMeansCard = target.meansCards.find(c => c.id === meansCardId);

  if (!targetClueCard || !targetMeansCard) {
    return { game, isCorrect: false, error: 'Las cartas no pertenecen a ese jugador' };
  }

  // Check if accusation is correct
  const isCorrect = game.solution !== null &&
    targetPlayerId === game.solution.murdererPlayerId &&
    clueCardId === game.solution.keyEvidenceId &&
    meansCardId === game.solution.meansOfMurderId;

  // Create accusation record
  const accusation: AsesinatoAccusation = {
    accuserId,
    accuserName: accuser.name,
    targetPlayerId,
    targetPlayerName: target.name,
    clueCardId,
    clueCardName: targetClueCard.name,
    meansCardId,
    meansCardName: targetMeansCard.name,
    isCorrect,
    timestamp: Date.now(),
  };

  // Update player's hasAccused status
  const updatedPlayers = game.players.map(p =>
    p.id === accuserId ? { ...p, hasAccused: true } : p
  );

  // Update round accusations
  const updatedRounds = [...game.rounds];
  const currentRound = updatedRounds[updatedRounds.length - 1];
  updatedRounds[updatedRounds.length - 1] = {
    ...currentRound,
    accusations: [...currentRound.accusations, accusation],
  };

  // All accusations list
  const allAccusations = [...game.allAccusations, accusation];

  // If correct, investigators win
  if (isCorrect) {
    return {
      game: {
        ...game,
        phase: 'finished',
        players: updatedPlayers,
        rounds: updatedRounds,
        allAccusations,
        winner: 'investigators',
        winReason: `${accuser.name} identificó correctamente al asesino y el crimen`,
        lastActivity: Date.now(),
      },
      isCorrect,
    };
  }

  // Check if all eligible players have used their accusations
  const eligiblePlayers = updatedPlayers.filter(p =>
    p.role !== 'forensicScientist' && p.role !== 'murderer' && p.role !== 'accomplice'
  );
  const allAccused = eligiblePlayers.every(p => p.hasAccused);

  if (allAccused) {
    return {
      game: {
        ...game,
        phase: 'finished',
        players: updatedPlayers,
        rounds: updatedRounds,
        allAccusations,
        winner: 'murderer',
        winReason: 'Todos los investigadores fallaron en sus acusaciones',
        lastActivity: Date.now(),
      },
      isCorrect,
    };
  }

  return {
    game: {
      ...game,
      players: updatedPlayers,
      rounds: updatedRounds,
      allAccusations,
      lastActivity: Date.now(),
    },
    isCorrect,
  };
}

// Move to next round
export function nextRound(
  game: AsesinatoGameState,
  playerId: string
): { game: AsesinatoGameState; error?: string } {
  if (game.phase !== 'discussion') {
    return { game, error: 'No es el momento de avanzar la ronda' };
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensicScientist') {
    return { game, error: 'Solo el Científico Forense puede avanzar la ronda' };
  }

  // Check if this was the last round
  if (game.currentRound >= game.maxRounds) {
    return {
      game: {
        ...game,
        phase: 'finished',
        winner: 'murderer',
        winReason: 'Se acabaron las rondas sin resolver el crimen',
        lastActivity: Date.now(),
      },
    };
  }

  // End current round
  const updatedRounds = [...game.rounds];
  updatedRounds[updatedRounds.length - 1] = {
    ...updatedRounds[updatedRounds.length - 1],
    endedAt: Date.now(),
  };

  // Start new round
  const newRoundNumber = game.currentRound + 1;
  const newRound: AsesinatoRound = {
    roundNumber: newRoundNumber,
    sceneTilesRevealed: [],
    replacedTileId: null,
    accusations: [],
    startedAt: Date.now(),
    endedAt: null,
  };

  // Unlock tiles for FS to modify (only new ones)
  const unlockedSceneTiles = game.sceneTiles.map(t => ({
    ...t,
    isLocked: true, // Keep existing ones locked, but FS can replace one
  }));

  return {
    game: {
      ...game,
      phase: 'clueGiving',
      currentRound: newRoundNumber,
      rounds: [...updatedRounds, newRound],
      sceneTiles: unlockedSceneTiles,
      forensicReady: false,
      discussionDeadline: null,
      lastActivity: Date.now(),
    },
  };
}

// End game manually (if needed)
export function endGame(
  game: AsesinatoGameState,
  winner: 'investigators' | 'murderer',
  reason: string
): AsesinatoGameState {
  return {
    ...game,
    phase: 'finished',
    winner,
    winReason: reason,
    lastActivity: Date.now(),
  };
}

// Reset game for new round
export function resetGame(game: AsesinatoGameState): AsesinatoGameState {
  const resetPlayers = game.players.map(p => ({
    ...p,
    role: null,
    clueCards: [],
    meansCards: [],
    hasAccused: false,
  }));

  return {
    ...game,
    phase: 'lobby',
    players: resetPlayers,
    solution: null,
    sceneTiles: [],
    causeOfDeathTile: null,
    locationTile: null,
    availableSceneTiles: getAllSceneTiles(),
    currentRound: 0,
    rounds: [],
    discussionDeadline: null,
    forensicReady: false,
    winner: null,
    winReason: null,
    allAccusations: [],
    lastActivity: Date.now(),
  };
}

// Rejoin existing player
export function rejoinPlayer(
  game: AsesinatoGameState,
  playerName: string
): { game: AsesinatoGameState; player: AsesinatoPlayer | null; error?: string } {
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

  return { game, player: null, error: 'Jugador no encontrado. La partida ya está en curso.' };
}

// Get role display name in Spanish
export function getRoleName(role: AsesinatoRole): string {
  const names: Record<AsesinatoRole, string> = {
    forensicScientist: 'Científico Forense',
    murderer: 'Asesino',
    accomplice: 'Cómplice',
    witness: 'Testigo',
    investigator: 'Investigador',
  };
  return names[role];
}

// Get role description in Spanish
export function getRoleDescription(role: AsesinatoRole): string {
  const descriptions: Record<AsesinatoRole, string> = {
    forensicScientist: 'Conoces el crimen pero solo puedes comunicarte a través de las fichas de escena.',
    murderer: 'Selecciona tu arma y evidencia. Engaña a los investigadores para ganar.',
    accomplice: 'Conoces el crimen. Ayuda al asesino a desviar las sospechas sin revelar tu identidad.',
    witness: 'Viste al asesino y al cómplice (si existe), pero no conoces el crimen. ¡Cuidado con revelar demasiado!',
    investigator: 'Analiza las pistas del forense e identifica al asesino, la evidencia y el método.',
  };
  return descriptions[role];
}
