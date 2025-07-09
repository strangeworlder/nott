# NotT Multi-User Application Implementation Plan

## Project Overview

**Night of the Thirteenth (NotT)** - A real-time multiplayer horror survival tabletop game where 1 Director manages the game state and 4 Players attempt to survive until dawn.

## Team Structure

### Core Team (6 People)
- **Project Lead** (You) - Overall coordination and game design
- **Graphic Designer** - UI/UX design, game assets, visual effects
- **Frontend Developer 1** - Vue.js components, UI implementation
- **Frontend Developer 2** - Graphics engine, animations, real-time features
- **Backend Developer 1** - Game engine, business logic, API development
- **Backend Developer 2** - VoIP, real-time communication, infrastructure

## Technology Stack

### Frontend (Vue.js 3)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Framework**: Tailwind CSS + Headless UI (for UI components)
- **Graphics Engine**: Three.js + Vue Three (3D graphics engine)
- **Real-time Communication**: Socket.io client
- **VoIP**: WebRTC P2P with audio processing
- **Audio Processing**: Web Audio API for voice effects
- **Animations**: Vue Transition + CSS animations + GSAP (for complex animations)
- **Icons**: Heroicons
- **Graphics Rendering**: WebGL via Three.js with custom shaders

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with Socket.io
- **Database**: PostgreSQL (for game persistence)
- **Real-time**: Socket.io
- **VoIP**: WebRTC P2P with TURN/STUN servers
- **Authentication**: JWT tokens
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Infrastructure
- **Deployment**: Docker + Docker Compose
- **Environment**: Development/Production configs
- **Logging**: Winston
- **Monitoring**: Basic health checks

## Application Architecture

### Core Components

#### 1. Game Engine
- **Game State Management**: Central game logic handling
- **Deck Management**: Threat Deck, Reserves, Trophy Pile
- **Dice System**: d13 implementation (d10 + d4)
- **Test Resolution**: Success/failure logic with fallout
- **Strike System**: Player elimination tracking
- **Endgame Logic**: Joker handling and win conditions

#### 2. Real-time Communication
- **Room Management**: Game sessions with unique IDs
- **Player Connections**: Director + 4 Players per room
- **Event Broadcasting**: Real-time game state updates
- **Action Validation**: Server-side action verification
- **VoIP Integration**: Audio rooms with WebRTC
- **Voice Effects**: Horror atmosphere audio processing

#### 3. User Interface
- **Director Dashboard**: Deck management, threat card display, player monitoring
- **Player Interface**: Character sheet, dice roller, action buttons
- **Shared Game Board**: Real-time game state visualization
- **Chat System**: In-game communication

## Database Schema

### Tables
```sql
-- Users
users (id, username, email, created_at)

-- Games
games (id, director_id, status, created_at, ended_at, game_data)

-- Game Players
game_players (id, game_id, user_id, player_number, character_data, strikes, eliminated)

-- Game Actions
game_actions (id, game_id, player_id, action_type, action_data, timestamp)
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Game Management
- `POST /games` - Create new game
- `GET /games/:id` - Get game state
- `POST /games/:id/join` - Join game as player
- `POST /games/:id/start` - Start game (Director only)
- `POST /games/:id/action` - Submit game action

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

## Socket.io Events

### Connection Management
- `join_room` - Join game room
- `leave_room` - Leave game room
- `player_connected` - Player connection notification
- `player_disconnected` - Player disconnection notification

### Game Actions
- `roll_dice` - Player dice roll
- `submit_test` - Player test submission
- `resolve_test` - Server test resolution
- `update_game_state` - Broadcast game state changes
- `player_eliminated` - Player elimination notification
- `game_ended` - Game completion notification

### VoIP Events
- `join_voice_room` - Join audio room
- `leave_voice_room` - Leave audio room
- `voice_activity` - Voice activity detection
- `audio_effect_change` - Change voice effects
- `mute_player` - Mute/unmute player
- `voice_quality_update` - Update voice quality settings

### Director Actions
- `reveal_threat_card` - Reveal new threat card
- `manage_deck` - Deck management actions
- `narrate_event` - Director narration
- `apply_voice_effect` - Apply horror voice effects
- `control_audio_mix` - Control player audio levels

## Frontend Structure

### Vue Components

#### Core Components
- `App.vue` - Main application wrapper
- `GameRoom.vue` - Main game interface
- `DirectorDashboard.vue` - Director's control panel
- `PlayerInterface.vue` - Player's game interface
- `GameBoard.vue` - Shared game state display

#### Game Components
- `DiceRoller.vue` - Interactive 3D dice rolling with Three.js physics
- `ThreatCard.vue` - 3D card display with flip animations
- `CharacterSheet.vue` - Player character information
- `DeckManager.vue` - Director's deck management with drag & drop
- `ChatPanel.vue` - In-game chat
- `VoiceChat.vue` - WebRTC P2P controls and voice effects
- `AudioMixer.vue` - Director's audio mixing controls
- `GameBoard.vue` - 3D game board with atmospheric effects
- `CardRenderer.vue` - High-quality 3D card rendering with custom shaders

#### UI Components
- `Modal.vue` - Reusable modal component
- `Button.vue` - Styled button component
- `Card.vue` - Card display component
- `Loading.vue` - Loading states

### State Management (Pinia)

#### Stores
- `authStore` - User authentication state
- `gameStore` - Current game state
- `playerStore` - Player-specific data
- `uiStore` - UI state management

## Milestone-Based Development Phases

### 🎯 MILESTONE 1: Foundation & Authentication (Week 1-2)
**Goal**: Basic application structure with user authentication

**Team Assignments:**
- **Backend Dev 1**: User authentication API, database setup
- **Backend Dev 2**: Basic Socket.io server, room management
- **Frontend Dev 1**: Authentication UI, basic routing
- **Frontend Dev 2**: Project setup, build configuration
- **Graphic Designer**: Brand identity, color scheme, basic UI design
- **Project Lead**: Requirements refinement, team coordination

**Deliverables:**
- ✅ User registration/login system
- ✅ Basic game room creation
- ✅ Simple lobby interface
- ✅ Database schema implemented
- ✅ Basic Socket.io connection
- ✅ Project build pipeline working

**Celebration**: Demo of user registration and basic room creation

---

### 🎯 MILESTONE 2: Core Game Engine (Week 3-4)
**Goal**: Complete game logic implementation

**Team Assignments:**
- **Backend Dev 1**: Game engine, deck management, test resolution
- **Backend Dev 2**: Real-time game state synchronization
- **Frontend Dev 1**: Game state display, basic UI components
- **Frontend Dev 2**: Real-time updates, basic animations
- **Graphic Designer**: Card designs, game board layout
- **Project Lead**: Game logic validation, testing coordination

**Deliverables:**
- ✅ Complete game engine with all NotT rules
- ✅ Deck management system (Threat Deck, Reserves, Trophy Pile)
- ✅ d13 dice rolling mechanics
- ✅ Test resolution with fallout system
- ✅ Strike tracking and elimination
- ✅ Basic game board visualization
- ✅ Real-time game state updates

**Celebration**: Playable single-player demo with AI Director

---

### 🎯 MILESTONE 3: Multiplayer & Real-time Features (Week 5-6)
**Goal**: Full multiplayer functionality

**Team Assignments:**
- **Backend Dev 1**: Multiplayer game logic, action validation
- **Backend Dev 2**: Advanced Socket.io events, connection management
- **Frontend Dev 1**: Player interfaces, Director dashboard
- **Frontend Dev 2**: Real-time UI updates, connection handling
- **Graphic Designer**: Player avatars, status indicators
- **Project Lead**: Multiplayer testing, bug coordination

**Deliverables:**
- ✅ Full multiplayer game sessions
- ✅ Director controls and dashboard
- ✅ Player action submission and validation
- ✅ Real-time game state synchronization
- ✅ Player connection/disconnection handling
- ✅ Basic chat system
- ✅ Game session management

**Celebration**: Full multiplayer demo with 5 people playing

---

### 🎯 MILESTONE 4: Graphics & Visual Effects (Week 7-8)
**Goal**: Immersive 3D visual experience

**Team Assignments:**
- **Backend Dev 1**: Graphics data API, asset management
- **Backend Dev 2**: Asset serving, optimization
- **Frontend Dev 1**: UI polish, responsive design
- **Frontend Dev 2**: Three.js + Vue Three implementation, 3D dice physics, card animations
- **Graphic Designer**: 3D assets, textures, visual effects
- **Project Lead**: Visual quality review, performance testing

**Deliverables:**
- ✅ 3D dice rolling with Three.js physics engine
- ✅ 3D card flipping and manipulation with realistic materials
- ✅ Atmospheric lighting and particle effects
- ✅ High-quality 3D card rendering with custom shaders
- ✅ Responsive design for all screen sizes
- ✅ Smooth 3D animations and transitions
- ✅ Horror atmosphere visual effects with dynamic lighting

**Celebration**: 3D visual showcase demo with all graphics features

---

### 🎯 MILESTONE 5: VoIP & Audio (Week 9-10)
**Goal**: Real-time WebRTC P2P voice communication

**Team Assignments:**
- **Backend Dev 1**: WebRTC signaling server, TURN/STUN setup
- **Backend Dev 2**: Audio processing, connection management
- **Frontend Dev 1**: Voice chat UI, audio controls
- **Frontend Dev 2**: WebRTC P2P implementation, Web Audio API voice effects
- **Graphic Designer**: Audio UI design, voice indicators
- **Project Lead**: Audio quality testing, VoIP coordination

**Deliverables:**
- ✅ Real-time WebRTC P2P voice communication (<50ms latency)
- ✅ Voice activity detection and visual indicators
- ✅ Horror voice effects (echo, distortion, whispers)
- ✅ Director audio mixing controls
- ✅ Individual player mute/unmute
- ✅ Audio quality settings
- ✅ Voice recording functionality

**Celebration**: Full voice-enabled multiplayer demo with 5 players

---

### 🎯 MILESTONE 6: Polish & Production (Week 11-12)
**Goal**: Production-ready application

**Team Assignments:**
- **Backend Dev 1**: Performance optimization, error handling
- **Backend Dev 2**: Deployment setup, monitoring
- **Frontend Dev 1**: Final UI polish, accessibility
- **Frontend Dev 2**: Performance optimization, mobile support
- **Graphic Designer**: Final asset optimization, documentation
- **Project Lead**: Final testing, deployment coordination

**Deliverables:**
- ✅ Complete error handling and recovery
- ✅ Performance optimization (60fps graphics, <50ms VoIP latency)
- ✅ Mobile responsiveness
- ✅ Accessibility features
- ✅ Production deployment
- ✅ Comprehensive testing suite
- ✅ User documentation and tutorials

**Celebration**: Production launch and first public game session

## Key Features

### Director Features
- Real-time deck management
- Threat card revelation
- Player monitoring
- Game state control
- Narration tools
- Voice effect application (horror atmosphere)
- Audio mixing controls
- Voice recording management

### Player Features
- Character creation and management
- Interactive dice rolling
- Action submission
- Real-time game state viewing
- Chat communication
- Voice chat with quality controls
- Voice activity indicators
- Personal audio settings

### Shared Features
- Real-time game state updates
- 3D visual card and dice displays with Three.js physics
- Atmospheric lighting and particle effects
- Strike tracking with visual feedback
- Endgame progression with dramatic effects
- Game history with replay functionality
- Real-time WebRTC P2P voice communication
- Voice activity visualization
- Audio recording and playback

## Graphics Technology: Three.js + Vue Three (Selected)

### Implementation Strategy
**Best for:** Immersive 3D experience with atmospheric horror effects
- **Pros:**
  - Full 3D dice rolling with physics
  - Atmospheric lighting and shadows
  - Particle effects for horror atmosphere
  - Realistic card flipping and manipulation
  - WebGL acceleration for smooth performance
  - Familiar stack for the team
- **Implementation:**
  - **UI Components:** Tailwind CSS for standard interface elements
  - **Game Objects:** Three.js for 3D dice, cards, and atmospheric effects
  - **Animations:** GSAP for complex UI animations, Three.js for game objects
  - **Performance:** WebGL rendering with custom shaders

### Graphics Features for NotT
- **Atmospheric Effects:** Dynamic lighting, fog, particle systems
- **Card Rendering:** High-quality card textures with realistic materials
- **Dice Physics:** Realistic 3D dice rolling with collision detection
- **Horror Atmosphere:** Dynamic shadows, flickering lights, blood effects
- **Performance:** 60fps rendering with WebGL acceleration

### VoIP Technology: WebRTC P2P (Selected)

#### Implementation Strategy
**Best for:** Direct communication with minimal latency for 5-person games
- **Pros:**
  - Ultra-low latency (< 50ms)
  - No server audio processing
  - Direct peer connections
  - Built-in echo cancellation
  - Free to implement
  - Perfect for 5-person NotT games
- **Implementation:**
  - **Small Games (≤6 players):** WebRTC P2P for minimal latency
  - **Voice Effects:** Web Audio API for client-side processing
  - **Recording:** Client-side recording with WebRTC
  - **TURN/STUN:** Required for NAT traversal

### VoIP Features for NotT
- **Real-time Voice:** WebRTC peer-to-peer audio communication
- **Voice Effects:** Horror atmosphere audio processing (echo, distortion, whispers)
- **Director Controls:** Voice mixing and effect application
- **Audio Quality:** Adaptive bitrate and echo cancellation
- **Voice Activity:** Automatic detection and visual indicators
- **Recording:** Optional game session recording for replay
- **Spatial Audio:** 3D audio positioning for immersive horror

## Technical Considerations

### Security
- Input validation on all actions
- Server-side game state validation
- JWT token authentication
- Rate limiting on actions

### Performance
- Efficient real-time updates
- Optimized database queries
- Client-side state caching
- Minimal network traffic

### Scalability
- Room-based architecture
- Stateless game sessions
- Horizontal scaling capability
- Load balancing support

## Testing Strategy

### Unit Tests
- Game engine logic
- Dice rolling mechanics
- Test resolution
- Deck management

### Integration Tests
- API endpoints
- Socket.io events
- Database operations

### E2E Tests
- Complete game flow
- Multi-player scenarios
- Director-player interactions

## Deployment

### Development
- Docker Compose for local development
- Hot reload for frontend and backend
- Database migrations
- Environment configuration

### Production
- Docker containerization
- Reverse proxy (Nginx)
- SSL certificate management
- Database backup strategy
- Monitoring and logging

## Success Metrics

- **Performance**: < 100ms response time for game actions
- **Reliability**: 99.9% uptime
- **User Experience**: Intuitive interface for both Director and Players
- **Game Integrity**: Accurate implementation of all NotT rules
- **Real-time Sync**: < 50ms latency for state updates

## Risk Mitigation

- **Complex Game Logic**: Thorough testing of edge cases
- **Real-time Synchronization**: Robust error handling and reconnection logic
- **User Experience**: Extensive user testing and feedback
- **Performance**: Load testing with multiple concurrent games
- **Security**: Regular security audits and input validation

This implementation plan provides a comprehensive roadmap for building a robust, scalable multi-user NotT game application that faithfully recreates the tabletop experience in a digital format. 