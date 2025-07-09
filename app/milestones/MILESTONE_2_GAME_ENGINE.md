# Milestone 2: Core Game Engine
**Duration**: Week 3-4  
**Goal**: Complete game logic implementation

## Team Assignments

### Backend Developer 1: Game Engine & Deck Management
**Tasks:**
- [ ] Implement complete NotT game engine
- [ ] Create deck management system (Threat Deck, Reserves, Trophy Pile)
- [ ] Implement d13 dice rolling mechanics
- [ ] Create test resolution logic with fallout system
- [ ] Implement strike tracking and elimination
- [ ] Build endgame logic with Joker handling
- [ ] Create game state management system
- [ ] Implement action validation and game rules

**Deliverables:**
- ✅ Complete game engine with all NotT rules
- ✅ Deck management system (Threat Deck, Reserves, Trophy Pile)
- ✅ d13 dice rolling mechanics (d10 + d4)
- ✅ Test resolution with fallout system
- ✅ Strike tracking and elimination logic
- ✅ Endgame logic with Joker handling
- ✅ Game state persistence and management
- ✅ Action validation and rule enforcement

### Backend Developer 2: Real-time Game State Synchronization
**Tasks:**
- [ ] Implement real-time game state broadcasting
- [ ] Create game action event system
- [ ] Build player turn management
- [ ] Implement game phase transitions
- [ ] Create real-time dice roll broadcasting
- [ ] Build test result broadcasting
- [ ] Implement game state recovery
- [ ] Create game session management

**Deliverables:**
- ✅ Real-time game state updates
- ✅ Game action event system
- ✅ Player turn management
- ✅ Game phase transitions
- ✅ Real-time dice roll broadcasting
- ✅ Test result broadcasting
- ✅ Game state recovery system
- ✅ Game session management

### Frontend Developer 1: Game State Display & Basic UI
**Tasks:**
- [ ] Create game state display components
- [ ] Implement basic UI for game actions
- [ ] Build player status indicators
- [ ] Create game phase displays
- [ ] Implement basic card display
- [ ] Build dice roll interface
- [ ] Create test result displays
- [ ] Implement game board layout

**Deliverables:**
- ✅ Game state display components
- ✅ Basic UI for game actions
- ✅ Player status indicators
- ✅ Game phase displays
- ✅ Basic card display
- ✅ Dice roll interface
- ✅ Test result displays
- ✅ Game board layout

### Frontend Developer 2: Real-time Updates & Basic Animations
**Tasks:**
- [ ] Implement real-time UI updates
- [ ] Create basic animations for game events
- [ ] Build connection handling for game state
- [ ] Implement loading states and transitions
- [ ] Create error handling for game actions
- [ ] Build responsive game interface
- [ ] Implement game state synchronization
- [ ] Create basic visual feedback

**Deliverables:**
- ✅ Real-time UI updates
- ✅ Basic animations for game events
- ✅ Connection handling for game state
- ✅ Loading states and transitions
- ✅ Error handling for game actions
- ✅ Responsive game interface
- ✅ Game state synchronization
- ✅ Basic visual feedback

### Graphic Designer: Card Designs & Game Board Layout
**Tasks:**
- [ ] Design card layouts for all game cards
- [ ] Create game board visual design
- [ ] Design player status indicators
- [ ] Create dice visual designs
- [ ] Design game phase indicators
- [ ] Create visual feedback elements
- [ ] Design horror atmosphere elements
- [ ] Create responsive layout designs

**Deliverables:**
- ✅ Card layouts for all game cards
- ✅ Game board visual design
- ✅ Player status indicators
- ✅ Dice visual designs
- ✅ Game phase indicators
- ✅ Visual feedback elements
- ✅ Horror atmosphere elements
- ✅ Responsive layout designs

### Project Lead: Game Logic Validation & Testing Coordination
**Tasks:**
- [ ] Validate game logic implementation
- [ ] Coordinate testing of game mechanics
- [ ] Create test scenarios for all game rules
- [ ] Coordinate integration testing
- [ ] Validate real-time synchronization
- [ ] Create game flow documentation
- [ ] Coordinate bug fixes and improvements
- [ ] Plan AI Director implementation

**Deliverables:**
- ✅ Validated game logic implementation
- ✅ Test scenarios for all game rules
- ✅ Integration testing coordination
- ✅ Real-time synchronization validation
- ✅ Game flow documentation
- ✅ Bug fixes and improvements
- ✅ AI Director implementation plan

## Technical Specifications

### Game Engine Architecture
```typescript
// Core game engine interfaces
interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'ended';
  players: Player[];
  director: Player;
  threatDeck: Card[];
  reserves: {
    numberReserve: Card[];
    jackReserve: Card[];
    queenReserve: Card[];
    kingReserve: Card[];
    jokers: { red: Card; black: Card };
  };
  trophyPile: Card[];
  currentThreatCard: Card;
  gamePhase: 'setup' | 'playing' | 'endgame';
  strikes: Record<string, number>;
}

interface Player {
  id: string;
  username: string;
  character: Character;
  strikes: number;
  eliminated: boolean;
  connected: boolean;
}

interface Character {
  name: string;
  archetype: string;
  why: string;
  aptitude: 'power' | 'resolve' | 'intellect' | 'finesse';
}
```

### Database Schema Extensions
```sql
-- Game state table
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id),
    state_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game actions table
CREATE TABLE game_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id),
    player_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player characters table
CREATE TABLE player_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id),
    player_id UUID REFERENCES users(id),
    character_data JSONB NOT NULL,
    strikes INTEGER DEFAULT 0,
    eliminated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Game Events
```typescript
// Socket.io game events
socket.emit('roll_dice', { gameId: string, playerId: string })
socket.emit('submit_test', { 
  gameId: string, 
  playerId: string, 
  testType: string,
  aptitude?: string 
})
socket.emit('resolve_test', { 
  gameId: string, 
  success: boolean, 
  fallout: number,
  result: any 
})

// Game state events
socket.on('game_state_update', GameState)
socket.on('dice_rolled', { 
  playerId: string, 
  result: number, 
  d10: number, 
  d4: number 
})
socket.on('test_result', { 
  success: boolean, 
  fallout: number, 
  newThreatCard: Card 
})
```

## Game Logic Implementation

### Deck Management
```typescript
class DeckManager {
  // Threat Deck construction
  buildThreatDeck(): Card[] {
    // 2s, 3s, 4s + 1 Jack
    // Aces face up on top
  }
  
  // Reserves setup
  setupReserves(): Reserves {
    // Number Reserve, Face Card Reserves, Jokers
  }
  
  // Trophy Pile management
  updateTrophyPile(card: Card): void {
    // Add defeated cards to trophy pile
  }
}
```

### Dice System
```typescript
class DiceRoller {
  rollD13(): { result: number; d10: number; d4: number } {
    const d10 = Math.floor(Math.random() * 10); // 0-9
    const d4 = Math.floor(Math.random() * 4) + 1; // 1-4
    const result = d10 + d4; // 1-13
    return { result, d10, d4 };
  }
  
  applyAptitudeBonus(aptitude: string, suit: string, fallout: number): number {
    // Apply ±1 to fallout die if aptitude matches suit
  }
}
```

### Test Resolution
```typescript
class TestResolver {
  resolveTest(diceResult: number, difficulty: number, fallout: number): TestResult {
    const success = diceResult >= difficulty;
    const falloutResult = this.getFalloutResult(fallout, success);
    
    return {
      success,
      fallout: falloutResult,
      strikes: this.calculateStrikes(success, falloutResult),
      newThreatCard: this.getNextThreatCard()
    };
  }
}
```

## Integration Points

### Game Engine Integration
- [ ] Game state persistence in database
- [ ] Real-time state synchronization
- [ ] Action validation and processing
- [ ] Error handling and recovery
- [ ] Game session management

### Frontend Integration
- [ ] Real-time UI updates
- [ ] Game action submission
- [ ] Visual feedback for actions
- [ ] Error handling and user feedback
- [ ] Loading states and transitions

## Testing Strategy

### Unit Tests
- [ ] Game engine logic
- [ ] Deck management
- [ ] Dice rolling mechanics
- [ ] Test resolution
- [ ] Strike tracking

### Integration Tests
- [ ] Complete game flow
- [ ] Real-time synchronization
- [ ] Game state persistence
- [ ] Action validation

### Game Logic Tests
- [ ] All NotT rules implemented correctly
- [ ] Edge cases and error conditions
- [ ] Game state transitions
- [ ] Endgame scenarios

## Success Criteria

### Functional Requirements
- [ ] All NotT game rules implemented
- [ ] Real-time game state synchronization
- [ ] Complete game flow from setup to end
- [ ] Accurate test resolution and fallout
- [ ] Proper strike tracking and elimination

### Performance Requirements
- [ ] Game state updates < 100ms
- [ ] Dice rolling response < 50ms
- [ ] Real-time synchronization reliable
- [ ] Database operations optimized

### Quality Requirements
- [ ] All game rules tested and validated
- [ ] Real-time synchronization stable
- [ ] Game state consistency maintained
- [ ] Error handling comprehensive

## Celebration Demo

**What to demonstrate:**
1. Complete single-player game with AI Director
2. All game mechanics working correctly
3. Real-time state synchronization
4. Visual feedback for all actions
5. Game flow from setup to endgame

**Demo script:**
1. Start a new game with AI Director
2. Show character creation process
3. Demonstrate dice rolling mechanics
4. Show test resolution with fallout
5. Demonstrate strike tracking
6. Show endgame with Joker handling
7. Complete a full game session

## Next Milestone Preparation

### Handoff Items
- [ ] Game engine ready for multiplayer integration
- [ ] Real-time system ready for player interactions
- [ ] UI components ready for player interfaces
- [ ] Database ready for multiplayer game data
- [ ] Testing framework ready for multiplayer testing

### Dependencies for Milestone 3
- [ ] Multiplayer game logic can use existing engine
- [ ] Socket.io ready for player-specific events
- [ ] Frontend ready for player-specific UI
- [ ] Database ready for multiplayer game sessions
- [ ] Build system ready for multiplayer features 