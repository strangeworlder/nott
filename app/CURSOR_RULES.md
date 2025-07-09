# Cursor Rules for NotT Development Team

## Project Overview
**Night of the Thirteenth (NotT)** - Multiplayer horror survival tabletop game
- **Frontend**: Vue 3 + TypeScript + Three.js + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express + Socket.io + PostgreSQL
- **VoIP**: WebRTC P2P + Web Audio API
- **Graphics**: Three.js + Vue Three + GSAP

## General Coding Standards

### File Naming Conventions
```
# Frontend Components (Vue)
components/
├── game/
│   ├── DiceRoller.vue
│   ├── ThreatCard.vue
│   ├── CharacterSheet.vue
│   └── DeckManager.vue
├── ui/
│   ├── Button.vue
│   ├── Modal.vue
│   └── Loading.vue
└── voice/
    ├── VoiceChat.vue
    └── AudioMixer.vue

# Backend Services
services/
├── GameEngine.ts
├── DeckManager.ts
├── DiceRoller.ts
├── WebRTCService.ts
└── SocketIOService.ts

# Database Models
models/
├── User.ts
├── Game.ts
├── Player.ts
└── GameAction.ts

# API Routes
routes/
├── auth.ts
├── games.ts
├── players.ts
└── voice.ts
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve"
  }
}
```

### Biome Configuration
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
      "*.bundle.js"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noConsoleLog": "warn"
      },
      "style": {
        "useConst": "error",
        "useBlockStatements": "error",
        "useShorthandArrayType": "error"
      },
      "complexity": {
        "noExcessiveCognitiveComplexity": "warn"
      },
      "performance": {
        "noDelete": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "es5",
      "semicolons": "always"
    }
  },
  "typescript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "es5",
      "semicolons": "always"
    }
  },
  "json": {
    "formatter": {
      "trailingComma": "none"
    }
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "format": "biome format --write .",
    "lint": "biome lint .",
    "check": "biome check --write .",
    "format:check": "biome format --write . --files-ignore-unknown=false",
    "lint:check": "biome lint . --files-ignore-unknown=false"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.3"
  }
}
```

## Frontend Standards (Vue 3 + TypeScript)

### Component Structure
```typescript
// Always use Composition API with <script setup>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'

// Props with explicit types
interface Props {
  gameId: string
  playerId: string
  isDirector?: boolean
}

const props = defineProps<Props>()

// Emits with explicit types
interface Emits {
  (e: 'dice-rolled', result: { d10: number; d4: number }): void
  (e: 'test-submitted', test: TestData): void
}

const emit = defineEmits<Emits>()

// Reactive data
const isLoading = ref(false)
const gameState = ref<GameState | null>(null)

// Computed properties
const canRollDice = computed(() => {
  return gameState.value?.currentPlayer === props.playerId
})

// Methods
const rollDice = async (): Promise<void> => {
  isLoading.value = true
  try {
    const result = await diceService.rollD13()
    emit('dice-rolled', result)
  } catch (error) {
    console.error('Dice roll failed:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialize component
})
</script>

<template>
  <div class="dice-roller">
    <!-- Template content -->
  </div>
</template>

<style scoped>
.dice-roller {
  /* Component styles */
}
</style>
```

### Store Structure (Pinia)
```typescript
// stores/gameStore.ts
import { defineStore } from 'pinia'
import type { GameState, Player, Card } from '@/types'

interface GameStoreState {
  currentGame: GameState | null
  players: Player[]
  currentPlayer: string | null
  isLoading: boolean
  error: string | null
}

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({
    currentGame: null,
    players: [],
    currentPlayer: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isDirector: (state) => (playerId: string): boolean => {
      return state.currentGame?.director.id === playerId
    },
    
    canPerformAction: (state) => (action: string): boolean => {
      // Game logic for action validation
      return true
    }
  },

  actions: {
    async joinGame(gameId: string): Promise<void> {
      this.isLoading = true
      try {
        const game = await gameService.joinGame(gameId)
        this.currentGame = game
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error'
      } finally {
        this.isLoading = false
      }
    },

    async rollDice(): Promise<{ d10: number; d4: number }> {
      if (!this.currentGame) throw new Error('No active game')
      
      const result = await diceService.rollD13()
      // Update game state
      return result
    }
  }
})
```

### Three.js Integration
```typescript
// components/game/DiceRoller3D.vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { useThree } from '@tresjs/core'

interface Props {
  diceCount?: number
  onRollComplete?: (result: { d10: number; d4: number }) => void
}

const props = withDefaults(defineProps<Props>(), {
  diceCount: 2
})

const { scene, camera, renderer } = useThree()
const diceMeshes = ref<THREE.Mesh[]>([])

const createDice = (): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  })
  return new THREE.Mesh(geometry, material)
}

const rollDice = async (): Promise<{ d10: number; d4: number }> => {
  // Physics-based dice rolling
  return { d10: 5, d4: 3 }
}

onMounted(() => {
  // Initialize 3D scene
})

onUnmounted(() => {
  // Cleanup Three.js resources
})
</script>
```

## Backend Standards (Node.js + TypeScript)

### Service Structure
```typescript
// services/GameEngine.ts
import type { GameState, Player, Card, GameAction } from '@/types'

export class GameEngine {
  private gameState: GameState

  constructor(initialState: GameState) {
    this.gameState = initialState
  }

  public async processAction(action: GameAction): Promise<GameActionResult> {
    try {
      // Validate action
      this.validateAction(action)
      
      // Process action based on type
      switch (action.type) {
        case 'roll_dice':
          return await this.handleDiceRoll(action)
        case 'submit_test':
          return await this.handleTestSubmission(action)
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      throw new GameEngineError(`Action processing failed: ${error}`)
    }
  }

  private validateAction(action: GameAction): void {
    if (!action.playerId) {
      throw new ValidationError('Player ID is required')
    }
    
    if (!this.gameState.players.find(p => p.id === action.playerId)) {
      throw new ValidationError('Player not found in game')
    }
  }

  private async handleDiceRoll(action: GameAction): Promise<GameActionResult> {
    const result = this.rollD13()
    return {
      success: true,
      result,
      gameState: this.gameState
    }
  }

  private rollD13(): { result: number; d10: number; d4: number } {
    const d10 = Math.floor(Math.random() * 10) // 0-9
    const d4 = Math.floor(Math.random() * 4) + 1 // 1-4
    const result = d10 + d4 // 1-13
    return { result, d10, d4 }
  }
}
```

### API Route Structure
```typescript
// routes/games.ts
import { Router } from 'express'
import type { Request, Response } from 'express'
import { GameController } from '@/controllers/GameController'
import { validateGameAction } from '@/middleware/validation'
import { authenticateToken } from '@/middleware/auth'

const router = Router()
const gameController = new GameController()

// GET /games/:id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const game = await gameController.getGame(id)
    res.json({ success: true, data: game })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// POST /games/:id/action
router.post('/:id/action', 
  authenticateToken, 
  validateGameAction, 
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const action = req.body
      const result = await gameController.processAction(id, action)
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid action' 
      })
    }
  }
)

export default router
```

### Socket.io Event Handling
```typescript
// services/SocketIOService.ts
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
import type { GameAction, GameState } from '@/types'

export class SocketIOService {
  private io: Server
  private gameRooms: Map<string, GameRoom> = new Map()

  constructor(io: Server) {
    this.io = io
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`)

      socket.on('join_game', (data: { gameId: string; playerId: string }) => {
        this.handleJoinGame(socket, data)
      })

      socket.on('game_action', (action: GameAction) => {
        this.handleGameAction(socket, action)
      })

      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }

  private handleJoinGame(socket: Socket, data: { gameId: string; playerId: string }): void {
    const { gameId, playerId } = data
    
    socket.join(gameId)
    socket.data.gameId = gameId
    socket.data.playerId = playerId

    // Notify other players
    socket.to(gameId).emit('player_joined', { playerId, socketId: socket.id })
  }

  private async handleGameAction(socket: Socket, action: GameAction): Promise<void> {
    try {
      const gameId = socket.data.gameId
      if (!gameId) {
        socket.emit('error', { message: 'Not in a game' })
        return
      }

      // Process action through game engine
      const result = await this.processGameAction(gameId, action)
      
      // Broadcast result to all players in game
      this.io.to(gameId).emit('game_action_result', result)
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Action failed' 
      })
    }
  }
}
```

## Database Standards

### Model Structure
```typescript
// models/Game.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm'
import type { User } from './User'
import type { Player } from './Player'

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50 })
  status: 'waiting' | 'playing' | 'ended'

  @ManyToOne(() => User, { nullable: false })
  director: User

  @OneToMany(() => Player, player => player.game)
  players: Player[]

  @Column({ type: 'jsonb' })
  gameState: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

### Repository Pattern
```typescript
// repositories/GameRepository.ts
import { Repository } from 'typeorm'
import { Game } from '@/models/Game'
import type { CreateGameDto, UpdateGameDto } from '@/types'

export class GameRepository {
  constructor(private repository: Repository<Game>) {}

  async create(data: CreateGameDto): Promise<Game> {
    const game = this.repository.create(data)
    return await this.repository.save(game)
  }

  async findById(id: string): Promise<Game | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['director', 'players']
    })
  }

  async updateGameState(id: string, gameState: Record<string, any>): Promise<void> {
    await this.repository.update(id, { gameState })
  }
}
```

## WebRTC Standards

### WebRTC Service
```typescript
// services/WebRTCService.ts
export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private signalingServer: WebSocket

  constructor(signalingServerUrl: string) {
    this.signalingServer = new WebSocket(signalingServerUrl)
    this.setupSignaling()
  }

  async initializeVoice(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
    } catch (error) {
      throw new Error(`Failed to get user media: ${error}`)
    }
  }

  async connectToPeer(peerId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
      ]
    })

    // Add local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingServer.send(JSON.stringify({
          type: 'ice_candidate',
          to: peerId,
          candidate: event.candidate
        }))
      }
    }

    this.peerConnections.set(peerId, peerConnection)
  }

  private setupSignaling(): void {
    this.signalingServer.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'offer':
          await this.handleOffer(message)
          break
        case 'answer':
          await this.handleAnswer(message)
          break
        case 'ice_candidate':
          await this.handleIceCandidate(message)
          break
      }
    }
  }
}
```

## Error Handling Standards

### Custom Error Classes
```typescript
// errors/GameErrors.ts
export class GameEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameEngineError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class WebRTCError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WebRTCError'
  }
}
```

### Error Handling Middleware
```typescript
// middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express'
import { GameEngineError, ValidationError, WebRTCError } from '@/errors'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error)

  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  } else if (error instanceof GameEngineError) {
    res.status(422).json({
      success: false,
      error: error.message
    })
  } else if (error instanceof WebRTCError) {
    res.status(503).json({
      success: false,
      error: error.message
    })
  } else {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
```

## Testing Standards

### Unit Test Structure
```typescript
// tests/services/GameEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '@/services/GameEngine'
import type { GameState, GameAction } from '@/types'

describe('GameEngine', () => {
  let gameEngine: GameEngine
  let mockGameState: GameState

  beforeEach(() => {
    mockGameState = {
      id: 'test-game',
      status: 'playing',
      players: [],
      director: { id: 'director-1', username: 'Director' },
      threatDeck: [],
      reserves: { numberReserve: [], jackReserve: [], queenReserve: [], kingReserve: [], jokers: { red: null, black: null } },
      trophyPile: [],
      currentThreatCard: null,
      gamePhase: 'playing',
      strikes: {}
    }
    gameEngine = new GameEngine(mockGameState)
  })

  describe('rollD13', () => {
    it('should return result between 1 and 13', () => {
      const result = gameEngine.rollD13()
      expect(result.result).toBeGreaterThanOrEqual(1)
      expect(result.result).toBeLessThanOrEqual(13)
    })

    it('should return d10 between 0 and 9', () => {
      const result = gameEngine.rollD13()
      expect(result.d10).toBeGreaterThanOrEqual(0)
      expect(result.d10).toBeLessThanOrEqual(9)
    })

    it('should return d4 between 1 and 4', () => {
      const result = gameEngine.rollD13()
      expect(result.d4).toBeGreaterThanOrEqual(1)
      expect(result.d4).toBeLessThanOrEqual(4)
    })
  })
})
```

## Git Workflow Standards

### Branch Naming
```
feature/milestone-1-authentication
feature/milestone-2-game-engine
feature/milestone-3-multiplayer
feature/milestone-4-graphics
feature/milestone-5-voip
feature/milestone-6-production
bugfix/voice-connection-issue
hotfix/critical-security-patch
```

### Commit Message Format
```
feat: add user authentication system
fix: resolve WebRTC connection issues
docs: update API documentation
test: add game engine unit tests
refactor: improve Three.js performance
style: update UI component styling
```

## Performance Standards

### Frontend Performance
- **Bundle size**: < 2MB initial load
- **First contentful paint**: < 1.5s
- **Graphics performance**: 60fps on desktop, 30fps on mobile
- **WebRTC latency**: < 50ms

### Backend Performance
- **API response time**: < 100ms
- **Database queries**: < 50ms
- **Socket.io events**: < 10ms
- **Memory usage**: < 512MB per instance

## Security Standards

### Authentication
- Use JWT tokens with expiration
- Implement refresh token rotation
- Validate all user inputs
- Use HTTPS in production

### Data Validation
- Validate all API inputs with Zod
- Sanitize user-generated content
- Use parameterized queries for database
- Implement rate limiting

## Documentation Standards

### Code Comments
```typescript
/**
 * Rolls a d13 die (d10 + d4) for NotT game mechanics
 * @returns Object containing the total result and individual die values
 * @throws GameEngineError if dice rolling fails
 */
rollD13(): { result: number; d10: number; d4: number } {
  // Implementation
}
```

### README Structure
```markdown
# Component/Service Name

Brief description of what this component/service does.

## Usage

```typescript
// Example usage code
```

## Props/Parameters

- `prop1`: Description
- `prop2`: Description

## Events/Methods

- `event1`: Description
- `method1`: Description

## Dependencies

- Dependency 1
- Dependency 2
```

## Code Quality Tools

### Biome (Recommended)
**Why Biome over ESLint + Prettier:**
- **10-100x faster** than ESLint + Prettier
- **Single tool** for linting, formatting, and organizing imports
- **Rust-based** for maximum performance
- **Excellent TypeScript support** for Vue 3 + Node.js
- **Built-in formatter** - no separate Prettier needed
- **Unified configuration** for frontend and backend
- **Better IDE integration** with Cursor

### Development Workflow with Biome
```bash
# Install Biome
npm install --save-dev @biomejs/biome

# Format and lint all files
npm run check

# Format only
npm run format

# Lint only
npm run lint

# Pre-commit hook (add to package.json)
{
  "husky": {
    "hooks": {
      "pre-commit": "biome check --write ."
    }
  }
}
```

### VS Code/Cursor Integration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[vue]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

## Cursor-Specific Rules

### AI Assistant Prompts
When using Cursor's AI assistant:
1. **Always specify the context**: "In the NotT game project, using Vue 3 + TypeScript..."
2. **Reference existing patterns**: "Follow the same pattern as the DiceRoller component..."
3. **Include type information**: "Create a function that returns a Promise<GameState>..."
4. **Specify error handling**: "Include proper error handling with custom error classes..."

### Code Generation Guidelines
1. **Use TypeScript strict mode** for all new code
2. **Follow Vue 3 Composition API** with `<script setup>`
3. **Include proper error handling** with custom error classes
4. **Add unit tests** for all business logic
5. **Use consistent naming** following the established patterns
6. **Include JSDoc comments** for complex functions
7. **Follow the established file structure** and naming conventions

### Review Checklist
Before committing code:
- [ ] Biome formatting and linting passed
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Unit tests included
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Accessibility features included
- [ ] Cross-browser compatibility tested

This comprehensive set of Cursor rules ensures uniform coding standards across your entire development team, making collaboration smooth and maintaining high code quality throughout the NotT project.
