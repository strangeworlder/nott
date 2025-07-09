# NotT Backend

A Node.js/Express backend with TypeScript for the NotT game, featuring comprehensive input validation with Zod, JWT authentication, and PostgreSQL database.

## Features

- **Zod Validation**: Type-safe input validation with comprehensive schemas
- **JWT Authentication**: Secure token-based authentication with middleware
- **PostgreSQL Database**: Robust data storage with migrations and seeding
- **TypeScript**: Full type safety throughout the application
- **Docker Support**: Containerized development and production environments
- **Unit Testing**: Comprehensive test coverage with Vitest

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   cd app/backend
   npm install
   ```

2. **Start the development environment:**
   ```bash
   # From app/ directory
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker exec -it nott-backend npm run db:migrate
   ```

4. **Seed the database:**
   ```bash
   docker exec -it nott-backend npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   docker exec -it nott-backend npm run dev
   ```

The API will be available at `http://localhost:4000/api`

## API Documentation

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com", 
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Username: 3-50 characters, alphanumeric with underscores/hyphens
- Email: Valid email format, max 255 characters
- Password: 8-100 characters, must contain lowercase, uppercase, and number

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "player1", 
    "email": "player1@example.com"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Profile Endpoints

All user endpoints are prefixed with `/api/users`

#### Get Current Profile (Protected)
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "My bio",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Validation Rules:**
- Username: Optional, 3-50 characters, alphanumeric with underscores/hyphens
- Email: Optional, valid email format, max 255 characters
- Bio: Optional, max 500 characters
- Avatar URL: Optional, valid URL format, max 500 characters

#### Search Users (Public)
```http
GET /api/users/search?query=player&limit=10
```

#### Get User by ID (Public)
```http
GET /api/users/:id
```

## Zod Validation System

The backend uses Zod for comprehensive input validation with the following features:

### Validation Middleware

```typescript
import { validate, schemas } from '../middleware/validation';

// Validate request body
router.post('/register', validate(schemas.auth.register), register);

// Validate query parameters
router.get('/search', validate(schemas.user.search, 'query'), searchUsers);

// Validate URL parameters
router.get('/:id', validate(schemas.user.getById, 'params'), getUserById);
```

### Available Schemas

#### Authentication Schemas
- `schemas.auth.register`: User registration validation
- `schemas.auth.login`: User login validation

#### User Schemas
- `schemas.user.updateProfile`: Profile update validation
- `schemas.user.search`: User search validation
- `schemas.user.getById`: User ID validation

#### Game Schemas (Future)
- `schemas.game.create`: Game creation validation
- `schemas.game.update`: Game update validation
- `schemas.game.join`: Game join validation

#### Utility Schemas
- `schemas.pagination`: Pagination parameters
- `schemas.uuid`: UUID validation

### Custom Validation Helpers

```typescript
import { validateData, safeValidate, formatZodError } from '../middleware/validation';

// Type-safe validation
const validatedData = validateData(schema, input);

// Safe validation (returns null on failure)
const result = safeValidate(schema, input);

// Format error messages
const errorMessage = formatZodError(zodError);
```

## JWT Authentication

### Middleware

```typescript
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';

// Require authentication
router.get('/profile', authenticateToken, getProfile);

// Optional authentication
router.get('/public', optionalAuth, publicEndpoint);

// Role-based authorization
router.post('/game/:id/join', authenticateToken, requireRole('player'), joinGame);
```

### Token Usage

Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Token Structure

```json
{
  "id": "user-uuid",
  "username": "player1",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: User accounts and profiles
- `games`: Game sessions and metadata
- `game_players`: Player participation in games
- `cards`: Game cards and deck management
- `dice_rolls`: Dice roll history and results
- `tests`: Game test mechanics
- `strikes`: Strike system for game balance
- `voice_chat`: Voice chat session management
- `chat_messages`: Text chat history
- `game_events`: Real-time game events
- `sessions`: User session tracking
- `statistics`: Game analytics and metrics

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://nott_user:nott_password@localhost:5432/nott_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis (for future real-time features)
REDIS_URL=redis://localhost:6379

# WebRTC (for future voice chat)
TURN_SERVER_URL=stun:stun.l.google.com:19302
TURN_USERNAME=nott_user
TURN_PASSWORD=nott_password
```

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:reset      # Reset database

# Code formatting and linting
npm run format        # Format code with Biome
npm run lint          # Lint code with Biome
npm run check         # Format and lint
```

## Testing

The backend uses Vitest for testing with comprehensive coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- validation.test.ts
```

### Test Structure

- `__tests__/`: Test files organized by feature
- `middleware/__tests__/`: Middleware tests
- `controllers/__tests__/`: Controller tests
- `services/__tests__/`: Service tests

## Docker Development

The backend is containerized for consistent development environments:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Execute commands in container
docker exec -it nott-backend npm run db:migrate

# Stop services
docker-compose down
```

## Production Deployment

For production deployment, use the production Docker Compose configuration:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security Features

- **Input Validation**: Comprehensive Zod schemas prevent invalid data
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for frontend domain
- **Rate Limiting**: Express rate limiting middleware
- **Helmet**: Security headers middleware
- **SQL Injection Protection**: Parameterized queries with pg

## Error Handling

The application uses a centralized error handling system:

```typescript
import { createError } from '../middleware/errorHandler';

// Create custom errors
throw createError('User not found', 404);
throw createError('Validation error: Invalid email', 400);
```

## Contributing

1. Follow the TypeScript and Biome configuration
2. Write unit tests for new features
3. Use Zod schemas for all input validation
4. Follow the established middleware patterns
5. Update documentation for new endpoints

## License

MIT License - see LICENSE file for details. 