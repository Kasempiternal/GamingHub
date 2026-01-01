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

export default {};
