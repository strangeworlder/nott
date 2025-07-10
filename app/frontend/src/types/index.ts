// NotT Type Definitions
// Comprehensive type system for the horror tabletop game

// ============================================================================
// CORE GAME TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Game {
  id: string;
  name: string;
  director_id: string;
  status: GameStatus;
  max_players: number;
  current_players: number;
  settings: GameSettings;
  created_at: Date;
  updated_at: Date;
}

export type GameStatus = 'lobby' | 'active' | 'completed' | 'cancelled';

export interface GameSettings {
  horror_level: 'mild' | 'moderate' | 'intense' | 'extreme';
  game_duration: number; // minutes
  max_strikes: number;
  enable_voice_chat: boolean;
  enable_3d_dice: boolean;
  enable_sound_effects: boolean;
  enable_ambient_audio: boolean;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  role: PlayerRole;
  character_name?: string;
  character_stats: CharacterStats;
  is_ready: boolean;
  joined_at: Date;
}

export type PlayerRole = 'director' | 'player';

export interface CharacterStats {
  health: number;
  sanity: number;
  strength: number;
  agility: number;
  intelligence: number;
  perception: number;
  willpower: number;
}

// ============================================================================
// GAME MECHANICS TYPES
// ============================================================================

export interface DiceRoll {
  id: string;
  game_id: string;
  player_id: string;
  dice_type: DiceType;
  results: number[];
  total: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface Test {
  id: string;
  game_id: string;
  player_id: string;
  test_type: TestType;
  difficulty: number;
  roll_result: number;
  success: boolean;
  critical_success: boolean;
  critical_failure: boolean;
  timestamp: Date;
}

export type TestType =
  | 'strength'
  | 'agility'
  | 'intelligence'
  | 'perception'
  | 'willpower'
  | 'sanity';

export interface Strike {
  id: string;
  game_id: string;
  player_id: string;
  strike_type: StrikeType;
  description: string;
  severity: StrikeSeverity;
  timestamp: Date;
}

export type StrikeType = 'injury' | 'trauma' | 'madness' | 'death';
export type StrikeSeverity = 'minor' | 'moderate' | 'severe' | 'critical';

// ============================================================================
// CARD SYSTEM TYPES
// ============================================================================

export interface Card {
  id: string;
  card_type: CardType;
  name: string;
  description: string;
  image_url?: string;
  rarity: CardRarity;
  effects: CardEffect[];
}

export type CardType = 'item' | 'event' | 'trap' | 'monster' | 'location' | 'spell';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface CardEffect {
  type: EffectType;
  value: number;
  description: string;
  conditions?: Record<string, unknown>;
}

export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'special';

export interface GameDeck {
  id: string;
  game_id: string;
  deck_type: DeckType;
  cards: Card[];
  shuffled: boolean;
  position: number;
}

export type DeckType = 'main' | 'encounter' | 'treasure' | 'trap' | 'event';

// ============================================================================
// REAL-TIME COMMUNICATION TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  game_id: string;
  player_id: string;
  message_type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type MessageType = 'text' | 'system' | 'dice' | 'test' | 'strike' | 'card';

export interface VoiceChatSession {
  id: string;
  game_id: string;
  participants: string[];
  start_time: Date;
  end_time?: Date;
  status: VoiceChatStatus;
}

export type VoiceChatStatus = 'connecting' | 'active' | 'disconnected' | 'ended';

// ============================================================================
// API INTERFACE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_at: Date;
}

// ============================================================================
// SOCKET.IO EVENT TYPES
// ============================================================================

export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;

  // Game events
  'game:join': (data: { game_id: string; user_id: string }) => void;
  'game:leave': (data: { game_id: string; user_id: string }) => void;
  'game:update': (data: { game: Game }) => void;
  'game:start': (data: { game_id: string }) => void;
  'game:end': (data: { game_id: string; winner_id?: string }) => void;

  // Player events
  'player:join': (data: { player: GamePlayer }) => void;
  'player:leave': (data: { player_id: string }) => void;
  'player:update': (data: { player: GamePlayer }) => void;
  'player:ready': (data: { player_id: string; ready: boolean }) => void;

  // Game mechanics events
  'dice:roll': (data: { roll: DiceRoll }) => void;
  'test:perform': (data: { test: Test }) => void;
  'strike:add': (data: { strike: Strike }) => void;
  'card:draw': (data: { card: Card; player_id: string }) => void;
  'card:play': (data: {
    card: Card;
    player_id: string;
    target?: string;
  }) => void;

  // Chat events
  'chat:message': (data: { message: ChatMessage }) => void;
  'voice:join': (data: { session_id: string; user_id: string }) => void;
  'voice:leave': (data: { session_id: string; user_id: string }) => void;
}

// ============================================================================
// THREE.JS TYPES
// ============================================================================

export interface ThreeJSConfig {
  scene: {
    fog_color: number;
    fog_near: number;
    fog_far: number;
    background_color: number;
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
  renderer: {
    antialias: boolean;
    alpha: boolean;
    shadow_map_enabled: boolean;
    shadow_map_type: number;
  };
  lighting: {
    ambient_intensity: number;
    point_light_intensity: number;
    point_light_color: number;
  };
}

export interface Dice3DConfig {
  geometry: 'box' | 'sphere' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  material: {
    color: number;
    metalness: number;
    roughness: number;
    emissive?: number;
  };
  physics: {
    mass: number;
    friction: number;
    restitution: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = Event> = (event: T) => void;

export type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>;

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export interface EnvironmentConfig {
  APP_ENV: string;
  APP_TITLE: string;
  APP_VERSION: string;
  API_BASE_URL: string;
  API_TIMEOUT: number;
  SOCKET_URL: string;
  SOCKET_TIMEOUT: number;
  ENABLE_DEBUG: boolean;
  ENABLE_LOGGING: boolean;
  ENABLE_HOT_RELOAD: boolean;
  ENABLE_SOURCE_MAPS: boolean;
  ENABLE_PROFILING: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  ENABLE_DEVTOOLS: boolean;
  ENABLE_ERROR_OVERLAY: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_PWA: boolean;
  ENABLE_OFFLINE_MODE: boolean;
  CDN_URL?: string;
  ASSET_PREFIX?: string;
  SENTRY_DSN?: string | null;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceObserver {
  onMetric: (metric: PerformanceMetric) => void;
}

// ============================================================================
// TESTING TYPES
// ============================================================================

export interface TestConfig {
  environment: 'jsdom' | 'node' | 'happy-dom';
  coverage: {
    provider: 'v8' | 'istanbul';
    reporter: string[];
    thresholds: {
      global: {
        branches: number;
        functions: number;
        lines: number;
        statements: number;
      };
    };
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError extends Error {
  code: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export type ErrorHandler = (error: AppError) => void;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export type Validator<T> = (value: T) => ValidationResult;

// ============================================================================
// STORE TYPES
// ============================================================================

export interface StoreState {
  user: Nullable<User>;
  game: Nullable<Game>;
  players: GamePlayer[];
  isLoading: boolean;
  error: Nullable<string>;
}

export interface StoreActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: () => void;
  updatePlayer: (playerId: string, updates: Partial<GamePlayer>) => void;
}

// ============================================================================
// ROUTER TYPES
// ============================================================================

export interface RouteMeta {
  title: string;
  description?: string;
  requiresAuth: boolean;
  roles?: string[];
  layout?: string;
}

export interface AppRoute {
  path: string;
  name: string;
  component: string;
  meta: RouteMeta;
  children?: AppRoute[];
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface ComponentProps {
  [key: string]: unknown;
}

export interface ComponentEmits {
  [key: string]: (...args: unknown[]) => void;
}

export interface ComponentSlots {
  [key: string]: () => unknown;
}

// ============================================================================
// DESIGN SYSTEM TYPES
// ============================================================================

export type ColorScheme = 'light' | 'dark' | 'horror' | 'blood';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'ghost';

export interface DesignToken {
  name: string;
  value: string | number;
  category: 'color' | 'typography' | 'spacing' | 'animation' | 'border' | 'shadow';
}
