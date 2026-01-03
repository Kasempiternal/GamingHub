// Gaming Hub - Shared Game Types

// ============================================
// CODIGO SECRETO TYPES
// ============================================

export type Team = 'red' | 'blue';
export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';
export type Role = 'spymaster' | 'operative';
export type GamePhase = 'lobby' | 'playing' | 'finished';

export interface Card {
  word: string;
  type: CardType;
  revealed: boolean;
  revealedBy?: Team;
}

export interface Player {
  id: string;
  name: string;
  deviceId?: string;
  team: Team | null;
  role: Role | null;
  isHost: boolean;
}

export interface Clue {
  word: string;
  number: number;
  team: Team;
  timestamp: number;
}

export interface CardProposal {
  cardIndex: number;
  cardWord: string;
  proposedBy: string;
  proposedAt: number;
  acceptedBy: string[];
  rejectedBy: string[];
}

export type CardRevealResult = 'correct' | 'wrong' | 'neutral' | 'assassin' | null;

export interface LastReveal {
  cardIndex: number;
  result: CardRevealResult;
  revealedAt: number;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  cards: Card[];
  players: Player[];
  currentTurn: Team;
  startingTeam: Team;
  clues: Clue[];
  currentClue: Clue | null;
  guessesRemaining: number;
  redCardsRemaining: number;
  blueCardsRemaining: number;
  winner: Team | null;
  createdAt: number;
  lastActivity: number;
  currentPlayerTurn: string | null;
  redOperativeOrder: string[];
  blueOperativeOrder: string[];
  redOperativeIndex: number;
  blueOperativeIndex: number;
  cardProposal: CardProposal | null;
  lastReveal: LastReveal | null;
}

export interface KeyCard {
  positions: CardType[];
  startingTeam: Team;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// IMPOSTOR GAME TYPES
// ============================================

export type ImpostorRole = 'civilian' | 'impostor';
export type ImpostorPhase = 'lobby' | 'description' | 'discussion' | 'voting' | 'reveal' | 'finished';

export interface ImpostorPlayer {
  id: string;
  name: string;
  deviceId?: string;
  avatar: string;
  role: ImpostorRole | null;
  word: string | null;
  hint: string | null;
  hasDescribed: boolean;
  hasVoted: boolean;
  votedFor: string | null;
  isEliminated: boolean;
  isHost: boolean;
  points: number;
}

export interface ImpostorVote {
  voterId: string;
  targetId: string;
  timestamp: number;
}

export interface ImpostorRound {
  roundNumber: number;
  eliminatedPlayer: string | null;
  votes: ImpostorVote[];
  startedAt: number;
  endedAt: number | null;
}

export interface ImpostorWordPair {
  civilian: string;
  impostor: string;
  hint: string;
  category: string;
}

export interface ImpostorGameState {
  roomCode: string;
  phase: ImpostorPhase;
  players: ImpostorPlayer[];
  currentWordPair: ImpostorWordPair | null;
  rounds: ImpostorRound[];
  currentRound: number;
  currentSpeaker: string | null;
  speakerOrder: string[];
  speakerIndex: number;
  votingResults: Record<string, number>;
  winner: 'civilians' | 'impostors' | null;
  winReason: string | null;
  impostorCount: number;
  createdAt: number;
  lastActivity: number;
  // Reveal animation state
  revealingPlayer: string | null;
  lastKickedPlayer: string | null;
}

// Avatar options for Impostor game
export const AVATARS = [
  '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
  '🐵', '🐔', '🐧', '🐦', '🦉', '🦅', '🐺', '🐗',
  '🦝', '🐻', '🐶', '🐱', '🐰', '🐹', '🐭', '🦄'
];

// ============================================
// THE MIND GAME TYPES
// ============================================

export type TheMindPhase = 'lobby' | 'dealing' | 'playing' | 'levelComplete' | 'levelFailed' | 'gameWon' | 'gameLost';

export interface TheMindPlayer {
  id: string;
  name: string;
  deviceId?: string;
  cards: number[];
  isHost: boolean;
  isReady: boolean;
  isProposingStar: boolean;
}

export interface TheMindCard {
  value: number;
  playedBy: string | null;
  playedAt: number | null;
}

export interface TheMindLevel {
  levelNumber: number;
  cardsPerPlayer: number;
  completed: boolean;
  failed: boolean;
  cardsPlayed: TheMindCard[];
  startedAt: number;
  endedAt: number | null;
}

export interface TheMindGameState {
  roomCode: string;
  phase: TheMindPhase;
  players: TheMindPlayer[];
  currentLevel: number;
  maxLevel: number;
  lives: number;
  maxLives: number;
  shurikens: number;
  maxShurikens: number;
  levels: TheMindLevel[];
  playedCards: TheMindCard[];
  lastPlayedCard: number | null;
  lastPlayedBy: string | null;
  lowestCardInHands: number | null; // For shuriken reveal
  shurikenProposers: string[];
  shurikenActive: boolean;
  conflictCards: number[]; // Cards that caused the conflict
  createdAt: number;
  lastActivity: number;
  // Reward levels (when players earn extra lives/shurikens)
  lifeRewardLevels: number[];
  shurikenRewardLevels: number[];
}

// The Mind game configuration by player count
export const THE_MIND_CONFIG: Record<number, { lives: number; shurikens: number; levels: number; lifeRewards: number[]; shurikenRewards: number[] }> = {
  2: { lives: 2, shurikens: 1, levels: 12, lifeRewards: [3, 6, 9], shurikenRewards: [2, 5, 8] },
  3: { lives: 3, shurikens: 1, levels: 10, lifeRewards: [3, 6, 9], shurikenRewards: [2, 5, 8] },
  4: { lives: 4, shurikens: 1, levels: 8, lifeRewards: [3, 6], shurikenRewards: [2, 5] },
};

// ============================================
// SCOUT GAME TYPES
// ============================================

export type ScoutPhase = 'lobby' | 'orientation' | 'playing' | 'roundEnd' | 'gameEnd';
export type ScoutPlayType = 'single' | 'set' | 'run';

// Card with dual numbers (top and bottom)
export interface ScoutCard {
  id: string;
  topValue: number;      // 1-10
  bottomValue: number;   // 1-10
  orientation: 'up' | 'down'; // Which value is currently active
}

export interface ScoutPlayer {
  id: string;
  name: string;
  deviceId?: string;
  hand: ScoutCard[];           // Cards in hand (ORDER MATTERS - cannot rearrange!)
  capturedCards: number;       // Count of cards captured from beating plays
  scoutTokensReceived: number; // Tokens received when others scout from you
  hasUsedScoutAndShow: boolean; // Can only use once per round
  isHost: boolean;
  hasConfirmedHand: boolean;   // Confirmed hand orientation at round start
  hasPassed: boolean;          // Passed this turn cycle
}

// Current play on the table
export interface ScoutCurrentPlay {
  cards: ScoutCard[];          // The cards currently on the table
  playerId: string;            // Who played them
  playType: ScoutPlayType;     // single, set, or run
  value: number;               // The effective value (highest for sets, lowest for runs)
}

// Round score
export interface ScoutRoundScore {
  playerId: string;
  playerName: string;
  capturedCards: number;       // +1 each
  scoutTokens: number;         // +1 each
  cardsRemaining: number;      // -1 each (except round ender)
  isRoundEnder: boolean;       // No penalty for remaining cards
  roundScore: number;          // Total for this round
}

// Full round record
export interface ScoutRound {
  roundNumber: number;
  startingPlayerId: string;
  scores: ScoutRoundScore[];
  endedBy: string | null;      // Who ended the round (emptied hand or all passed)
  startedAt: number;
  endedAt: number | null;
}

export interface ScoutGameState {
  roomCode: string;
  phase: ScoutPhase;
  players: ScoutPlayer[];
  currentPlay: ScoutCurrentPlay | null;  // Current cards to beat
  currentPlayerIndex: number;            // Whose turn it is
  rounds: ScoutRound[];
  currentRound: number;
  totalRounds: number;                   // Equal to player count
  totalScores: Record<string, number>;   // Cumulative scores per player
  startingPlayerIndex: number;           // Rotates each round
  passCount: number;                     // How many players have passed consecutively
  createdAt: number;
  lastActivity: number;
  winner: string | null;                 // Player ID of winner
  lastAction: {                          // For animations
    type: 'show' | 'scout' | 'scoutAndShow' | null;
    playerId: string | null;
    timestamp: number;
  } | null;
}

// SCOUT game configuration by player count
export const SCOUT_CONFIG: Record<number, {
  totalCards: number;
  cardsPerPlayer: number;
  removedCards: string; // Description of which cards to remove
}> = {
  3: { totalCards: 36, cardsPerPlayer: 12, removedCards: 'Remove all cards with 10' },
  4: { totalCards: 44, cardsPerPlayer: 11, removedCards: 'Remove card with 9-10' },
  5: { totalCards: 45, cardsPerPlayer: 9, removedCards: 'Use all 45 cards' },
};

// The 45 SCOUT cards (number pairs)
// Each card has two numbers, one on each end
export const SCOUT_DECK: Array<{ top: number; bottom: number }> = [
  // All pairs from 1-10 where top <= bottom (45 total)
  { top: 1, bottom: 1 }, { top: 1, bottom: 2 }, { top: 1, bottom: 3 }, { top: 1, bottom: 4 }, { top: 1, bottom: 5 },
  { top: 1, bottom: 6 }, { top: 1, bottom: 7 }, { top: 1, bottom: 8 }, { top: 1, bottom: 9 }, { top: 1, bottom: 10 },
  { top: 2, bottom: 2 }, { top: 2, bottom: 3 }, { top: 2, bottom: 4 }, { top: 2, bottom: 5 }, { top: 2, bottom: 6 },
  { top: 2, bottom: 7 }, { top: 2, bottom: 8 }, { top: 2, bottom: 9 }, { top: 2, bottom: 10 },
  { top: 3, bottom: 3 }, { top: 3, bottom: 4 }, { top: 3, bottom: 5 }, { top: 3, bottom: 6 }, { top: 3, bottom: 7 },
  { top: 3, bottom: 8 }, { top: 3, bottom: 9 }, { top: 3, bottom: 10 },
  { top: 4, bottom: 4 }, { top: 4, bottom: 5 }, { top: 4, bottom: 6 }, { top: 4, bottom: 7 }, { top: 4, bottom: 8 },
  { top: 4, bottom: 9 }, { top: 4, bottom: 10 },
  { top: 5, bottom: 5 }, { top: 5, bottom: 6 }, { top: 5, bottom: 7 }, { top: 5, bottom: 8 }, { top: 5, bottom: 9 }, { top: 5, bottom: 10 },
  { top: 6, bottom: 6 }, { top: 6, bottom: 7 }, { top: 6, bottom: 8 }, { top: 6, bottom: 9 }, { top: 6, bottom: 10 },
  { top: 7, bottom: 7 }, { top: 7, bottom: 8 }, { top: 7, bottom: 9 }, { top: 7, bottom: 10 },
  { top: 8, bottom: 8 }, { top: 8, bottom: 9 }, { top: 8, bottom: 10 },
  { top: 9, bottom: 9 }, { top: 9, bottom: 10 },
  { top: 10, bottom: 10 },
];

// ============================================
// HIPSTER GAME TYPES
// ============================================

export type HipsterPhase = 'lobby' | 'collecting' | 'playing' | 'finished';
export type HipsterTurnPhase = 'listening' | 'guessing' | 'intercepting' | 'bonus' | 'result';

export interface HipsterIntercept {
  playerId: string;
  position: number;        // Where interceptor thinks song goes
  timestamp: number;
}

export interface HipsterSong {
  id: string;                    // iTunes track ID (itunes_xxx)
  title: string;
  artist: string;
  albumArt: string;              // Album cover URL
  releaseYear: number;           // Extracted from release_date
  previewUrl: string;            // 30-second preview URL from iTunes
  addedBy: string;               // Player ID who contributed this song
  addedAt: number;               // Timestamp
}

export interface HipsterTimelineCard {
  song: HipsterSong;
  position: number;              // Index in timeline (0-based)
  placedAt: number;              // Timestamp when placed
}

export interface HipsterPlayer {
  id: string;
  name: string;
  deviceId?: string;
  avatar: string;                // Emoji avatar
  isHost: boolean;
  timeline: HipsterTimelineCard[];  // Cards in player's timeline
  tokens: number;                   // Hitster tokens earned
  contributedSongs: string[];       // Song IDs this player added
  isReady: boolean;                 // Ready to start (collection phase)
  songsAdded: number;               // Count of songs added to pool
}

export interface HipsterBonusGuess {
  artist: string;
  title: string;
}

// Two-phase intercept sub-phases
export type HipsterInterceptPhase = 'deciding' | 'selecting';

export interface HipsterCurrentTurn {
  playerId: string;
  song: HipsterSong;
  phase: HipsterTurnPhase;
  guessedPosition: number | null;   // Where player thinks song goes
  isCorrect: boolean | null;
  bonusGuess: HipsterBonusGuess | null;
  bonusCorrect: boolean | null;
  startedAt: number;
  guessDeadline: number | null;        // Unix timestamp when player must guess by (60s timer)
  bonusDeadline: number | null;        // Unix timestamp when bonus guess expires (30s timer)
  // Intercept phase fields
  intercepts: HipsterIntercept[];      // List of intercepts from other players
  interceptDeadline: number | null;    // Unix timestamp when intercept DECIDING phase ends
  interceptWinner: string | null;      // Player ID who won via intercept (null if original wins)
  // Two-phase intercept fields
  interceptPhase: HipsterInterceptPhase | null;  // 'deciding' (10s to claim) or 'selecting' (10s to pick position)
  interceptingPlayerId: string | null;            // Who claimed the intercept
  selectingDeadline: number | null;               // Unix timestamp when SELECTING phase ends
}

export interface HipsterGameState {
  roomCode: string;
  phase: HipsterPhase;
  players: HipsterPlayer[];
  songPool: HipsterSong[];          // All collected songs
  usedSongs: string[];              // Song IDs already played
  currentTurn: HipsterCurrentTurn | null;
  currentPlayerIndex: number;
  turnOrder: string[];              // Player IDs in turn order

  // Music player state (host only)
  musicReady: boolean;              // Host has confirmed audio works

  // Game settings
  songsPerPlayer: number;           // Default: 10
  cardsToWin: number;               // Default: 10

  winner: string | null;            // Player ID of winner
  createdAt: number;
  lastActivity: number;
}

// Spotify API response types
export interface SpotifyTrackSearch {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number }[];
    release_date: string;
  };
  preview_url: string | null;
  uri: string;
}

// Hipster game configuration
export const HIPSTER_CONFIG = {
  minPlayers: 2,
  maxPlayers: 12,
  defaultSongsPerPlayer: 5,     // Each player adds 5 songs, system adds 5 random per player
  defaultCardsToWin: 10,
  minSongsPerPlayer: 3,
  maxSongsPerPlayer: 10,
  randomSongsPerPlayer: 5,      // Random songs from curated catalog
  listenDuration: 30000,        // 30 seconds to listen
  guessDuration: 60000,         // 60 seconds to guess position
  bonusDuration: 30000,         // 30 seconds for bonus guess
};

// Avatars for Hipster (music themed)
export const HIPSTER_AVATARS = [
  '🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🎤', '🎧',
  '🎵', '🎶', '🎼', '🪗', '🪘', '🎚️', '🎛️', '📻'
];

// ============================================
// TIMES UP GAME TYPES (¡Tiempo!)
// ============================================

export type TimesUpPhase = 'lobby' | 'round1' | 'round2' | 'round3' | 'roundEnd' | 'finished';
export type TimesUpTeam = 'orange' | 'blue';
export type TimesUpCategory = 'celebrity' | 'fiction' | 'sports' | 'historical' | 'music';

export interface TimesUpCard {
  id: string;
  name: string;
  category: TimesUpCategory;
  guessedInRound?: number;  // Which round was it guessed (1, 2, or 3)
  guessedBy?: TimesUpTeam;  // Which team guessed it
}

export interface TimesUpPlayer {
  id: string;
  name: string;
  deviceId?: string;
  avatar: string;
  team: TimesUpTeam | null;
  isHost: boolean;
  cardsGuessedThisGame: number;  // Total cards guessed by this player
}

export interface TimesUpTurn {
  playerId: string;
  team: TimesUpTeam;
  startedAt: number;           // Unix timestamp when turn started
  endsAt: number;              // Unix timestamp when turn ends (startedAt + 30000)
  cardsGuessed: number;        // Cards guessed this turn
  currentCardIndex: number;    // Index in remainingCards array
  isActive: boolean;           // Is the turn currently active
}

export interface TimesUpRoundScore {
  round: number;
  orangeScore: number;
  blueScore: number;
}

export interface TimesUpGameState {
  roomCode: string;
  phase: TimesUpPhase;
  players: TimesUpPlayer[];

  // Card deck
  allCards: TimesUpCard[];           // All cards for this game (30-40)
  remainingCards: TimesUpCard[];     // Cards not yet guessed this round
  guessedCards: TimesUpCard[];       // Cards guessed this round

  // Current turn
  currentTurn: TimesUpTurn | null;
  currentTeam: TimesUpTeam;          // Which team's turn
  turnOrder: string[];               // Player IDs in turn order
  currentTurnIndex: number;          // Index in turnOrder

  // Scores
  orangeScore: number;               // Total orange team score
  blueScore: number;                 // Total blue team score
  roundScores: TimesUpRoundScore[];  // Score per round

  // Game state
  currentRound: number;              // 1, 2, or 3
  winner: TimesUpTeam | null;

  // Timestamps
  createdAt: number;
  lastActivity: number;
}

// Times Up game configuration
export const TIMESUP_CONFIG = {
  turnDuration: 30000,        // 30 seconds per turn
  cardsPerGame: 35,           // Number of cards in deck
  minPlayers: 4,              // Minimum players to start
  maxPlayers: 20,             // Maximum players
  minPlayersPerTeam: 2,       // Minimum per team to start
};

// Avatars for Times Up (time themed)
export const TIMESUP_AVATARS = [
  '⏰', '⏱️', '⌛', '⏳', '🕐', '🕑', '🕒', '🕓',
  '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛',
  '⚡', '🎯', '🏆', '🎪', '🎭', '🌟', '✨', '🔔'
];

// ============================================
// WAVELENGTH GAME TYPES (Longitud de Onda)
// ============================================

export type WavelengthPhase = 'lobby' | 'psychicClue' | 'teamGuess' | 'counterGuess' | 'reveal' | 'roundEnd' | 'finished';
export type WavelengthTeam = 'red' | 'blue';

export interface WavelengthSpectrumCard {
  id: string;
  leftConcept: string;   // e.g., "Frío"
  rightConcept: string;  // e.g., "Caliente"
}

export interface WavelengthPlayer {
  id: string;
  name: string;
  deviceId?: string;
  avatar: string;
  team: WavelengthTeam | null;
  isHost: boolean;
  isPsychic: boolean;  // Current round's psychic
}

export interface WavelengthRound {
  roundNumber: number;
  psychicId: string;
  psychicTeam: WavelengthTeam;
  spectrumCard: WavelengthSpectrumCard;
  targetPosition: number;         // 0-100 (hidden until reveal)
  clue: string | null;            // Psychic's clue
  teamGuess: number | null;       // 0-100
  counterGuess: 'left' | 'right' | null;  // Opposing team's guess
  pointsAwarded: number;          // 0, 2, 3, or 4
  counterPointAwarded: boolean;   // Did opposing team get 1 point?
  startedAt: number;
  endedAt: number | null;
}

export interface WavelengthGameState {
  roomCode: string;
  phase: WavelengthPhase;
  players: WavelengthPlayer[];

  // Teams
  redTeam: string[];              // Player IDs
  blueTeam: string[];             // Player IDs

  // Scores
  redScore: number;
  blueScore: number;
  targetScore: number;            // Default: 10

  // Current round
  currentRound: WavelengthRound | null;
  rounds: WavelengthRound[];

  // Turn tracking
  currentTeam: WavelengthTeam;
  redPsychicIndex: number;        // Rotates through red team
  bluePsychicIndex: number;       // Rotates through blue team

  // Deck
  usedCardIds: string[];          // Track used spectrum cards

  winner: WavelengthTeam | null;
  createdAt: number;
  lastActivity: number;
}

// Wavelength avatars (wave/frequency themed)
export const WAVELENGTH_AVATARS = [
  '📻', '📡', '🎚️', '🎛️', '📶', '〰️', '🌊', '⚡',
  '🔊', '🎵', '🎶', '🔉', '📢', '🎤', '🎧', '💫'
];

export const WAVELENGTH_CONFIG = {
  minPlayers: 4,
  maxPlayers: 12,
  minPlayersPerTeam: 2,
  targetScore: 10,
  // Scoring zones (center = target position)
  bullseyeRange: 5,    // ±5 = 4 points
  closeRange: 10,      // ±10 = 3 points
  okRange: 15,         // ±15 = 2 points
};

// ============================================
// ASESINATO EN HONG KONG GAME TYPES
// (Deception: Murder in Hong Kong clone)
// ============================================

export type AsesinatoRole = 'forensicScientist' | 'murderer' | 'accomplice' | 'witness' | 'investigator';
export type AsesinatoPhase = 'lobby' | 'roleReveal' | 'murderSelection' | 'clueGiving' | 'discussion' | 'finished';

export interface AsesinatoClueCard {
  id: string;
  name: string;           // e.g., "Cuchillo", "Veneno", "Cuerda"
  category: string;       // e.g., "Arma", "Objeto", "Sustancia"
}

export interface AsesinatoMeansCard {
  id: string;
  name: string;           // e.g., "Apuñalado", "Envenenado", "Estrangulado"
  category: string;       // e.g., "Violento", "Silencioso", "Accidental"
}

export interface AsesinatoSceneTile {
  id: string;
  title: string;          // e.g., "Ubicación del Crimen"
  options: string[];      // e.g., ["Dormitorio", "Cocina", "Jardín", "Baño", "Garaje", "Sótano"]
  selectedOption: number | null;  // Index of selected option (0-5)
  isLocked: boolean;      // Can't change after round ends
}

export interface AsesinatoPlayer {
  id: string;
  name: string;
  deviceId?: string;
  avatar: string;
  role: AsesinatoRole | null;
  clueCards: AsesinatoClueCard[];     // 4 cards
  meansCards: AsesinatoMeansCard[];   // 4 cards
  hasAccused: boolean;                // Used their one accusation?
  isHost: boolean;
}

export interface AsesinatoAccusation {
  accuserId: string;
  accuserName: string;
  targetPlayerId: string;          // Whose cards they're accusing
  targetPlayerName: string;
  clueCardId: string;              // Which clue card
  clueCardName: string;
  meansCardId: string;             // Which means card
  meansCardName: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface AsesinatoSolution {
  murdererPlayerId: string;
  keyEvidenceId: string;           // The chosen clue card ID
  meansOfMurderId: string;         // The chosen means card ID
}

export interface AsesinatoRound {
  roundNumber: number;             // 1, 2, or 3
  sceneTilesRevealed: string[];    // IDs of tiles revealed this round
  replacedTileId: string | null;   // ID of tile replaced this round (rounds 2-3)
  accusations: AsesinatoAccusation[];
  startedAt: number;
  endedAt: number | null;
}

export interface AsesinatoGameState {
  roomCode: string;
  phase: AsesinatoPhase;
  players: AsesinatoPlayer[];

  // Solution (hidden from most players)
  solution: AsesinatoSolution | null;

  // Scene tiles (Forensic Scientist's communication tool)
  sceneTiles: AsesinatoSceneTile[];
  causeOfDeathTile: AsesinatoSceneTile | null;     // Special tile always shown
  locationTile: AsesinatoSceneTile | null;         // Special tile always shown

  // All scene tile options (for replacement)
  availableSceneTiles: AsesinatoSceneTile[];

  // Round tracking
  currentRound: number;
  maxRounds: number;                               // Always 3
  rounds: AsesinatoRound[];

  // Discussion timer (3 minutes, auto-advances)
  discussionDeadline: number | null;               // Unix timestamp
  discussionDuration: number;                      // Fixed 180000ms = 3 min

  // Clue giving state
  forensicReady: boolean;                          // FS has finished placing clues this round

  // Game result
  winner: 'investigators' | 'murderer' | null;
  winReason: string | null;
  allAccusations: AsesinatoAccusation[];          // All accusations made during game

  // Timestamps
  createdAt: number;
  lastActivity: number;
}

// Configuration
export const ASESINATO_CONFIG = {
  minPlayers: 4,
  maxPlayers: 12,
  clueCardsPerPlayer: 4,
  meansCardsPerPlayer: 4,
  maxRounds: 3,
  discussionDuration: 180000,     // 3 minutes (fixed, auto-advances)
  sceneTilesPerRound: [4, 1, 1],  // Round 1: 4 tiles, Round 2-3: 1 replacement each
  // Role distribution (with Accomplice @ 6+, Witness @ 7+)
  roles: {
    4: { forensicScientist: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 2 },
    5: { forensicScientist: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 3 },
    6: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 0, investigator: 3 },
    7: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 3 },
    8: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 4 },
    9: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 5 },
    10: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 6 },
    11: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 7 },
    12: { forensicScientist: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 8 },
  } as Record<number, { forensicScientist: number; murderer: number; accomplice: number; witness: number; investigator: number }>
};

// Avatars (detective/mystery themed) - using reliably-rendered emojis
export const ASESINATO_AVATARS = [
  '🔍', '🔎', '🔬', '🧪', '💉', '🔪', '💀', '🦴',
  '🩸', '🧬', '📋', '🔦', '🎭', '🖤', '👁', '🌙'
];

export default {};
