-- Night of the Thirteenth Database Initialization
-- Enhanced schema for complete NotT game support

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    director_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'completed', 'cancelled', 'paused')),
    max_players INTEGER DEFAULT 5, -- 1 Director + 4 Players
    current_players INTEGER DEFAULT 0,
    game_phase VARCHAR(20) DEFAULT 'setup' CHECK (game_phase IN ('setup', 'night', 'dawn', 'ended')),
    current_round INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    game_state JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game players table
CREATE TABLE IF NOT EXISTS game_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('director', 'player')),
    player_number INTEGER, -- 1-4 for players, NULL for director
    character_name VARCHAR(100),
    character_stats JSONB DEFAULT '{}',
    strikes INTEGER DEFAULT 0,
    is_eliminated BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT FALSE,
    last_action_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, user_id),
    UNIQUE(game_id, player_number) WHERE player_number IS NOT NULL
);

-- ============================================================================
-- GAME MECHANICS TABLES
-- ============================================================================

-- Cards table (Threat Deck, Reserves, etc.)
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('threat', 'reserve', 'trophy', 'special')),
    card_name VARCHAR(100) NOT NULL,
    card_text TEXT,
    card_effects JSONB DEFAULT '{}',
    rarity VARCHAR(20) DEFAULT 'common',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game decks table (instances of cards in games)
CREATE TABLE IF NOT EXISTS game_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    deck_type VARCHAR(20) NOT NULL CHECK (deck_type IN ('threat', 'reserve', 'trophy')),
    card_id UUID REFERENCES cards(id),
    position INTEGER, -- Position in deck (NULL = in hand/discard)
    is_revealed BOOLEAN DEFAULT FALSE,
    is_discarded BOOLEAN DEFAULT FALSE,
    revealed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dice rolls table
CREATE TABLE IF NOT EXISTS dice_rolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id),
    roll_type VARCHAR(20) NOT NULL CHECK (roll_type IN ('d13', 'd10', 'd4', 'custom')),
    d10_result INTEGER CHECK (d10_result >= 1 AND d10_result <= 10),
    d4_result INTEGER CHECK (d4_result >= 1 AND d4_result <= 4),
    total_result INTEGER,
    is_success BOOLEAN,
    roll_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tests table (test resolution)
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id),
    test_type VARCHAR(50) NOT NULL,
    difficulty INTEGER NOT NULL,
    dice_roll_id UUID REFERENCES dice_rolls(id),
    is_success BOOLEAN,
    fallout_type VARCHAR(50),
    fallout_data JSONB DEFAULT '{}',
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Strikes table (player elimination tracking)
CREATE TABLE IF NOT EXISTS strikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id),
    strike_reason VARCHAR(100) NOT NULL,
    strike_source VARCHAR(50), -- 'test_failure', 'card_effect', 'director_action'
    source_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REAL-TIME COMMUNICATION TABLES
-- ============================================================================

-- Voice chat sessions
CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    session_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    voice_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Voice participants
CREATE TABLE IF NOT EXISTS voice_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_muted BOOLEAN DEFAULT FALSE,
    is_speaking BOOLEAN DEFAULT FALSE,
    audio_level DECIMAL(3,2) DEFAULT 0.0,
    voice_effects JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(voice_session_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'director', 'action')),
    message_text TEXT NOT NULL,
    message_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GAME EVENTS & HISTORY TABLES
-- ============================================================================

-- Game events table (detailed event logging)
CREATE TABLE IF NOT EXISTS game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table (session data for replay)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    session_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES users(id)
);

-- ============================================================================
-- STATISTICS & ANALYTICS TABLES
-- ============================================================================

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_directed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    survival_rate DECIMAL(5,2) DEFAULT 0.0,
    average_strikes DECIMAL(3,2) DEFAULT 0.0,
    total_dice_rolls INTEGER DEFAULT 0,
    successful_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Game statistics table
CREATE TABLE IF NOT EXISTS game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    total_rounds INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_dice_rolls INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    total_strikes INTEGER DEFAULT 0,
    game_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_director ON games(director_id);
CREATE INDEX IF NOT EXISTS idx_games_phase ON games(game_phase);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_players_role ON game_players(role);
CREATE INDEX IF NOT EXISTS idx_game_players_eliminated ON game_players(is_eliminated);

-- Game mechanics indexes
CREATE INDEX IF NOT EXISTS idx_game_decks_game_id ON game_decks(game_id);
CREATE INDEX IF NOT EXISTS idx_game_decks_type ON game_decks(deck_type);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_game_id ON dice_rolls(game_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_player_id ON dice_rolls(player_id);
CREATE INDEX IF NOT EXISTS idx_tests_game_id ON tests(game_id);
CREATE INDEX IF NOT EXISTS idx_tests_player_id ON tests(player_id);
CREATE INDEX IF NOT EXISTS idx_strikes_game_id ON strikes(game_id);
CREATE INDEX IF NOT EXISTS idx_strikes_player_id ON strikes(player_id);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_voice_participants_session ON voice_participants(voice_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Event and history indexes
CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_timestamp ON game_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_game_events_type ON game_events(event_type);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update game player count
CREATE OR REPLACE FUNCTION update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE games SET current_players = current_players + 1 WHERE id = NEW.game_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE games SET current_players = current_players - 1 WHERE id = OLD.game_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for player count updates
CREATE TRIGGER update_game_player_count_trigger
    AFTER INSERT OR DELETE ON game_players
    FOR EACH ROW EXECUTE FUNCTION update_game_player_count();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user stats when game ends
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO user_stats (user_id, games_played, games_won)
        VALUES (NEW.director_id, 1, CASE WHEN NEW.winner_id = NEW.director_id THEN 1 ELSE 0 END)
        ON CONFLICT (user_id) DO UPDATE SET
            games_played = user_stats.games_played + 1,
            games_won = user_stats.games_won + CASE WHEN NEW.winner_id = NEW.director_id THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user stats updates
CREATE TRIGGER update_user_stats_trigger
    AFTER UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default admin user
INSERT INTO users (username, email, password_hash, bio) VALUES 
('admin', 'admin@nott.local', crypt('admin123', gen_salt('bf')), 'System Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert default cards
INSERT INTO cards (card_type, card_name, card_text, rarity) VALUES
-- Threat cards
('threat', 'The Shadow', 'A dark figure lurks in the shadows...', 'common'),
('threat', 'The Whisper', 'Voices echo through the night...', 'common'),
('threat', 'The Hunt', 'Something is hunting you...', 'rare'),
('threat', 'The Curse', 'An ancient curse awakens...', 'epic'),
-- Reserve cards
('reserve', 'Flashlight', 'Provides light in darkness', 'common'),
('reserve', 'Holy Water', 'Protection against evil', 'rare'),
('reserve', 'Silver Bullet', 'Effective against supernatural threats', 'epic'),
-- Trophy cards
('trophy', 'Victory', 'Survived the night', 'common'),
('trophy', 'Hero', 'Saved others from danger', 'rare'),
('trophy', 'Legend', 'Became a legend of survival', 'epic')
ON CONFLICT DO NOTHING;