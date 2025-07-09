// ============================================================================
// CORE DATABASE TYPES
// ============================================================================

export interface User {
	id: string;
	username: string;
	email: string;
	password_hash: string;
	bio?: string;
	avatar_url?: string;
	is_online: boolean;
	last_seen: Date;
	created_at: Date;
	updated_at: Date;
}

export interface Game {
	id: string;
	name: string;
	director_id: string;
	status: "lobby" | "active" | "completed" | "cancelled" | "paused";
	max_players: number;
	current_players: number;
	game_phase: "setup" | "night" | "dawn" | "ended";
	current_round: number;
	settings: Record<string, unknown>;
	game_state: Record<string, unknown>;
	started_at?: Date;
	ended_at?: Date;
	winner_id?: string;
	created_at: Date;
	updated_at: Date;
}

export interface GamePlayer {
	id: string;
	game_id: string;
	user_id: string;
	role: "director" | "player";
	player_number?: number; // 1-4 for players, null for director
	character_name?: string;
	character_stats: Record<string, unknown>;
	strikes: number;
	is_eliminated: boolean;
	is_ready: boolean;
	is_connected: boolean;
	last_action_at?: Date;
	joined_at: Date;
}

// ============================================================================
// GAME MECHANICS TYPES
// ============================================================================

export interface Card {
	id: string;
	card_type: "threat" | "reserve" | "trophy" | "special";
	card_name: string;
	card_text?: string;
	card_effects: Record<string, unknown>;
	rarity: "common" | "rare" | "epic" | "legendary";
	is_active: boolean;
	created_at: Date;
}

export interface GameDeck {
	id: string;
	game_id: string;
	deck_type: "threat" | "reserve" | "trophy";
	card_id: string;
	position?: number; // Position in deck (null = in hand/discard)
	is_revealed: boolean;
	is_discarded: boolean;
	revealed_at?: Date;
	created_at: Date;
}

export interface DiceRoll {
	id: string;
	game_id: string;
	player_id: string;
	roll_type: "d13" | "d10" | "d4" | "custom";
	d10_result?: number;
	d4_result?: number;
	total_result?: number;
	is_success?: boolean;
	roll_data: Record<string, unknown>;
	created_at: Date;
}

export interface Test {
	id: string;
	game_id: string;
	player_id: string;
	test_type: string;
	difficulty: number;
	dice_roll_id: string;
	is_success: boolean;
	fallout_type?: string;
	fallout_data: Record<string, unknown>;
	resolved_at: Date;
	created_at: Date;
}

export interface Strike {
	id: string;
	game_id: string;
	player_id: string;
	strike_reason: string;
	strike_source?: "test_failure" | "card_effect" | "director_action";
	source_data: Record<string, unknown>;
	created_at: Date;
}

// ============================================================================
// REAL-TIME COMMUNICATION TYPES
// ============================================================================

export interface VoiceSession {
	id: string;
	game_id: string;
	session_name: string;
	is_active: boolean;
	voice_settings: Record<string, unknown>;
	created_at: Date;
	ended_at?: Date;
}

export interface VoiceParticipant {
	id: string;
	voice_session_id: string;
	user_id: string;
	is_muted: boolean;
	is_speaking: boolean;
	audio_level: number;
	voice_effects: Record<string, unknown>;
	joined_at: Date;
	left_at?: Date;
}

export interface ChatMessage {
	id: string;
	game_id: string;
	user_id?: string;
	message_type: "chat" | "system" | "director" | "action";
	message_text: string;
	message_data: Record<string, unknown>;
	created_at: Date;
}

// ============================================================================
// GAME EVENTS & HISTORY TYPES
// ============================================================================

export interface GameEvent {
	id: string;
	game_id: string;
	player_id?: string;
	event_type: string;
	event_data: Record<string, unknown>;
	timestamp: Date;
}

export interface GameSession {
	id: string;
	game_id: string;
	session_data: Record<string, unknown>;
	started_at: Date;
	ended_at?: Date;
	winner_id?: string;
}

// ============================================================================
// STATISTICS & ANALYTICS TYPES
// ============================================================================

export interface UserStats {
	id: string;
	user_id: string;
	games_played: number;
	games_won: number;
	games_directed: number;
	total_score: number;
	best_score: number;
	survival_rate: number;
	average_strikes: number;
	total_dice_rolls: number;
	successful_tests: number;
	failed_tests: number;
	updated_at: Date;
}

export interface GameStats {
	id: string;
	game_id: string;
	total_rounds: number;
	total_events: number;
	total_dice_rolls: number;
	total_tests: number;
	total_strikes: number;
	game_duration?: string;
	created_at: Date;
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

export interface GameState {
	current_phase: "setup" | "night" | "dawn" | "ended";
	current_round: number;
	active_threats: string[];
	revealed_cards: string[];
	player_states: Record<string, PlayerState>;
	director_actions: DirectorAction[];
	game_timer?: number;
}

export interface PlayerState {
	player_id: string;
	character_name: string;
	strikes: number;
	is_eliminated: boolean;
	is_ready: boolean;
	current_location?: string;
	inventory: string[];
	status_effects: StatusEffect[];
}

export interface DirectorAction {
	action_type: "reveal_card" | "apply_effect" | "narrate" | "voice_effect";
	target_player?: string;
	action_data: Record<string, unknown>;
	timestamp: Date;
}

export interface StatusEffect {
	effect_type: string;
	duration: number;
	intensity: number;
	description: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateGameRequest {
	name: string;
	director_id: string;
	max_players?: number;
	settings?: Record<string, unknown>;
}

export interface JoinGameRequest {
	game_id: string;
	user_id: string;
	role: "director" | "player";
	player_number?: number;
	character_name?: string;
}

export interface DiceRollRequest {
	game_id: string;
	player_id: string;
	roll_type: "d13" | "d10" | "d4" | "custom";
	test_type?: string;
	difficulty?: number;
}

export interface TestResolutionRequest {
	test_id: string;
	is_success: boolean;
	fallout_type?: string;
	fallout_data?: Record<string, unknown>;
}

export interface VoiceSessionRequest {
	game_id: string;
	session_name: string;
	voice_settings?: Record<string, unknown>;
}

export interface ChatMessageRequest {
	game_id: string;
	user_id?: string;
	message_type: "chat" | "system" | "director" | "action";
	message_text: string;
	message_data?: Record<string, unknown>;
}

// ============================================================================
// SOCKET.IO EVENT TYPES
// ============================================================================

export interface SocketEvents {
	// Connection events
	join_room: { game_id: string; user_id: string };
	leave_room: { game_id: string; user_id: string };
	player_connected: { game_id: string; user_id: string };
	player_disconnected: { game_id: string; user_id: string };

	// Game events
	game_state_update: { game_id: string; game_state: GameState };
	player_action: {
		game_id: string;
		player_id: string;
		action: string;
		data: Record<string, unknown>;
	};
	dice_roll: DiceRollRequest;
	test_resolution: TestResolutionRequest;
	strike_awarded: {
		game_id: string;
		player_id: string;
		reason: string;
		source: string;
	};

	// Director events
	director_action: { game_id: string; action: DirectorAction };
	reveal_card: { game_id: string; card_id: string; position?: number };
	apply_voice_effect: {
		game_id: string;
		target_player: string;
		effect: string;
	};

	// Voice chat events
	join_voice_room: { game_id: string; user_id: string };
	leave_voice_room: { game_id: string; user_id: string };
	voice_activity: {
		game_id: string;
		user_id: string;
		is_speaking: boolean;
		audio_level: number;
	};
	mute_player: { game_id: string; target_user_id: string; is_muted: boolean };

	// Chat events
	chat_message: ChatMessageRequest;
	system_message: {
		game_id: string;
		message: string;
		data?: Record<string, unknown>;
	};
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DatabaseResult<T> = {
	rows: T[];
	rowCount: number;
};

export type QueryResult<T> = Promise<DatabaseResult<T>>;

export interface DatabaseError {
	code: string;
	message: string;
	detail?: string;
	hint?: string;
}

export interface PaginationParams {
	page: number;
	limit: number;
	offset: number;
}

export interface SearchParams {
	query: string;
	filters?: Record<string, unknown>;
	sort?: Record<string, "asc" | "desc">;
	pagination?: PaginationParams;
}
