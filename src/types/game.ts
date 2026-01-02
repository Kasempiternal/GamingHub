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

export type ImpostorRole = 'civilian' | 'impostor' | 'mr-white';
export type ImpostorPhase = 'lobby' | 'description' | 'discussion' | 'voting' | 'reveal' | 'finished';

export interface ImpostorPlayer {
  id: string;
  name: string;
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
  mrWhiteCount: number;
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

export interface HipsterCurrentTurn {
  playerId: string;
  song: HipsterSong;
  phase: HipsterTurnPhase;
  guessedPosition: number | null;   // Where player thinks song goes
  isCorrect: boolean | null;
  bonusGuess: HipsterBonusGuess | null;
  bonusCorrect: boolean | null;
  startedAt: number;
  // Intercept phase fields
  intercepts: HipsterIntercept[];      // List of intercepts from other players
  interceptDeadline: number | null;    // Unix timestamp when intercept phase ends
  interceptWinner: string | null;      // Player ID who won via intercept (null if original wins)
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

export default {};
