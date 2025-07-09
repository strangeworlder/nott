# Development Guidelines

This document outlines the development standards and best practices for the NotT project.

## 🏗️ Project Structure

```
nott-game/
├── frontend/                 # Vue 3 frontend application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   │   ├── game/       # Game-specific components
│   │   │   ├── ui/         # UI components
│   │   │   └── voice/      # Voice chat components
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── types/          # TypeScript types
│   └── package.json
├── shared/                  # Shared types and utilities
├── docs/                    # Documentation
└── package.json            # Root package.json
```

## 🔧 Development Environment Setup

### Node.js Version Management

We use **Node.js 24.3.0** (LTS) for this project. To ensure all team members use the same version:

#### Install NVM (Node Version Manager)

**Linux/macOS:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Windows:**
```bash
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows
```

#### Setup Project Node Version

```bash
# Navigate to project directory
cd nott-game

# Install and use the correct Node.js version
nvm install 24.3.0
nvm use 24.3.0

# Set as default (optional)
nvm alias default 24.3.0
```

#### Verify Installation

```bash
node --version  # Should show v24.3.0
npm --version   # Should show 10.x.x
```

### Automatic Version Switching

The project includes a `.nvmrc` file that automatically switches to the correct Node.js version:

```bash
# When entering the project directory
nvm use

# Or manually
nvm use $(cat .nvmrc)
```

## 🎯 Coding Standards

### File Naming
- **Components**: PascalCase (e.g., `GameScene.vue`)
- **Services**: camelCase (e.g., `gameService.ts`)
- **Types**: PascalCase (e.g., `Player.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Vue 3 Components
```vue
<template>
  <!-- Template content -->
</template>

<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue'

// Props
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

// Emits
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete'): void
}

const emit = defineEmits<Emits>()

// Reactive data
const loading = ref(false)
const data = ref([])

// Computed
const filteredData = computed(() => {
  return data.value.filter(item => item.active)
})

// Methods
const handleClick = () => {
  emit('update', 'new value')
}

// Lifecycle
onMounted(() => {
  // Initialize component
})
</script>

<style scoped>
/* Component styles */
</style>
```

### TypeScript Standards
```typescript
// Use strict typing
interface Player {
  id: string
  username: string
  role: 'director' | 'player'
  isConnected: boolean
}

// Use type guards
function isPlayer(obj: any): obj is Player {
  return obj && typeof obj.id === 'string' && typeof obj.username === 'string'
}

// Use enums for constants
enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

// Use utility types
type PartialPlayer = Partial<Player>
type PlayerWithoutId = Omit<Player, 'id'>
```

### API Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Success response
{
  success: true,
  data: { id: '1', name: 'Game 1' },
  message: 'Game created successfully'
}

// Error response
{
  success: false,
  error: 'GAME_NOT_FOUND',
  message: 'Game not found'
}
```

## 🎨 UI/UX Guidelines

### Horror Theme Colors
```css
/* Primary colors */
--blood-red: #ef4444;
--night-black: #020617;
--night-gray: #1e293b;

/* Semantic colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Component Patterns
```vue
<!-- Button component -->
<button 
  class="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-semibold rounded-lg 
         transition-all duration-300 transform hover:scale-105 blood-border"
  :disabled="loading"
>
  {{ loading ? 'Loading...' : 'Submit' }}
</button>

<!-- Card component -->
<div class="bg-night-800/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
  <h3 class="text-lg font-semibold mb-4 text-white">{{ title }}</h3>
  <slot />
</div>
```

## 🧪 Testing Standards

### Unit Tests
```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameComponent from '@/components/game/GameComponent.vue'

describe('GameComponent', () => {
  it('should render game board', () => {
    const wrapper = mount(GameComponent, {
      props: {
        gameId: 'test-game',
        playerRole: 'player',
      },
    })
    
    expect(wrapper.find('.game-board').exists()).toBe(true)
  })

  it('should emit dice roll event', async () => {
    const wrapper = mount(GameComponent)
    
    await wrapper.find('.dice-button').trigger('click')
    
    expect(wrapper.emitted('dice-rolled')).toBeTruthy()
  })
})
```

### Integration Tests
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/server'

describe('Game API', () => {
  it('should create a new game', async () => {
    const response = await request(app)
      .post('/api/game')
      .send({
        name: 'Test Game',
        maxPlayers: 5,
      })
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Test Game')
  })
})
```

## 🔧 Development Workflow

### Git Workflow
1. **Feature branches**: `feature/game-engine`
2. **Bug fixes**: `fix/dice-rolling`
3. **Hotfixes**: `hotfix/security-patch`

### Commit Messages
```
feat: add 3D dice rolling with physics
fix: resolve WebRTC connection issues
docs: update API documentation
test: add unit tests for game logic
refactor: improve component structure
```

### Code Review Checklist
- [ ] Code follows project standards
- [ ] TypeScript types are properly defined
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations are addressed

## 🚀 Performance Guidelines

### Frontend Optimization
- Use lazy loading for routes and components
- Implement virtual scrolling for large lists
- Optimize Three.js rendering with proper disposal
- Use Web Workers for heavy computations
- Implement proper caching strategies

### Backend Optimization
- Use connection pooling for database
- Implement Redis caching for frequently accessed data
- Use compression middleware
- Implement rate limiting
- Monitor memory usage and garbage collection

## 🔒 Security Guidelines

### Authentication
- Use JWT tokens with proper expiration
- Implement refresh token rotation
- Store sensitive data in environment variables
- Use HTTPS in production

### Input Validation
```typescript
import Joi from 'joi'

const gameSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  maxPlayers: Joi.number().min(2).max(5).required(),
  description: Joi.string().max(500).optional(),
})
```

### SQL Injection Prevention
```typescript
// Use parameterized queries
const result = await query(
  'SELECT * FROM games WHERE id = $1 AND status = $2',
  [gameId, 'active']
)
```

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Rolls a d13 die with optional modifiers
 * @param modifiers - Array of dice modifiers
 * @returns Promise resolving to roll result
 */
async function rollD13(modifiers: DiceModifier[] = []): Promise<DiceRoll> {
  // Implementation
}
```

### API Documentation
```typescript
/**
 * @api {post} /api/game Create a new game
 * @apiName CreateGame
 * @apiGroup Game
 * @apiParam {String} name Game name
 * @apiParam {Number} maxPlayers Maximum number of players
 * @apiSuccess {Object} data Game object
 * @apiError {String} error Error message
 */
```

## 🐛 Debugging Guidelines

### Frontend Debugging
```typescript
// Use Vue DevTools
// Enable source maps in development
// Use console.group for organized logging
console.group('Game State')
console.log('Players:', players.value)
console.log('Current Turn:', currentTurn.value)
console.groupEnd()
```

### Backend Debugging
```typescript
// Use structured logging
import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
})
```

## 📊 Monitoring and Logging

### Frontend Monitoring
- Track user interactions and errors
- Monitor WebRTC connection quality
- Log performance metrics
- Track game session duration

### Backend Monitoring
- Monitor API response times
- Track database query performance
- Monitor WebSocket connections
- Log authentication attempts

## 🎮 Game-Specific Guidelines

### Dice Rolling
- Use physics-based 3D dice
- Implement proper collision detection
- Add sound effects for immersion
- Support both d6 and d13 dice

### Voice Communication
- Implement proper WebRTC signaling
- Handle connection failures gracefully
- Add voice activity detection
- Support multiple audio codecs

### Real-time Synchronization
- Use Socket.io for real-time updates
- Implement proper state management
- Handle network disconnections
- Add reconnection logic

---

**Remember**: The goal is to create an immersive horror experience while maintaining code quality and performance. Always prioritize user experience and game atmosphere. 