// Game Types
export interface Player {
  id: string;
  username: string;
  role: 'director' | 'player';
  isConnected: boolean;
  isReady: boolean;
  character?: Character;
  position?: Position;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  stats: CharacterStats;
  abilities: Ability[];
  isAlive: boolean;
}

export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  sanity: number;
  health: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Game {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  director: Player;
  currentTurn: number;
  maxTurns: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiceRoll {
  id: string;
  playerId: string;
  diceType: 'd6' | 'd13';
  result: number;
  timestamp: Date;
  modifiers: DiceModifier[];
}

export interface DiceModifier {
  type: 'advantage' | 'disadvantage' | 'bonus' | 'penalty';
  value: number;
  source: string;
}

export interface Card {
  id: string;
  name: string;
  type: 'event' | 'item' | 'trap' | 'monster';
  description: string;
  effect: string;
  imageUrl?: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  shuffleCount: number;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Socket Events
export interface SocketEvents {
  // Connection events
  'user:connect': (userId: string) => void;
  'user:disconnect': (userId: string) => void;

  // Game events
  'game:join': (gameId: string, player: Player) => void;
  'game:leave': (gameId: string, playerId: string) => void;
  'game:start': (gameId: string) => void;
  'game:end': (gameId: string, winner: string) => void;

  // Player events
  'player:ready': (gameId: string, playerId: string) => void;
  'player:move': (gameId: string, playerId: string, position: Position) => void;
  'player:action': (gameId: string, playerId: string, action: string) => void;

  // Dice events
  'dice:roll': (gameId: string, roll: DiceRoll) => void;
  'dice:result': (gameId: string, result: DiceRoll) => void;

  // Card events
  'card:draw': (gameId: string, playerId: string, card: Card) => void;
  'card:play': (gameId: string, playerId: string, card: Card) => void;
  'card:discard': (gameId: string, playerId: string, card: Card) => void;

  // Voice events
  'voice:join': (gameId: string, playerId: string) => void;
  'voice:leave': (gameId: string, playerId: string) => void;
  'voice:signal': (gameId: string, from: string, to: string, signal: any) => void;
}

// WebRTC Types
export interface VoiceConnection {
  peerId: string;
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  volume: number;
}

export interface VoiceSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
