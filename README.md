# NotT (Night of the Thirteenth)

A multiplayer horror survival tabletop game with a game engine simulator for testing and balancing.

## 🎮 About NotT

NotT is a complex 6-player multiplayer horror survival tabletop game that combines traditional tabletop mechanics with modern web technologies. Players work together to survive a night of supernatural horror while managing resources, solving mysteries, and dealing with betrayal mechanics.

This repository contains both the **full multiplayer game application** and a **game engine simulator** for testing and balancing game mechanics.

## 🚀 Quick Start

### Option 1: Full Multiplayer Game (Recommended)

The easiest way to get started is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd nott

# Start the development environment
cd app
docker-compose up -d

# Access the application
# Frontend: http://localhost:3013
# Backend API: http://localhost:4013
```

### Option 2: Game Engine Simulator

For testing and balancing game mechanics:

```bash
# Clone the repository
git clone <repository-url>
cd nott

# Start the simulator server
./start-server.sh

# Access the simulator
# Open: http://localhost:8000
```

## 📁 Project Structure

```
nott/
├── app/                    # Full multiplayer game application
│   ├── frontend/          # Vue 3 + TypeScript frontend
│   ├── backend/           # Node.js + Express backend
│   ├── docker-compose.yml # Development environment
│   └── README.md         # Detailed documentation
├── js/                    # Game engine simulator
│   ├── game.js           # Core game logic
│   ├── uiController.js   # User interface controller
│   ├── gameConfig.js     # Game configuration
│   └── core/             # Core game components
├── index.html             # Simulator web interface
├── start-server.sh        # Simulator server script
├── docs/                  # Project documentation
├── milestones/            # Development milestones
└── README.md             # This file
```

## 🛠️ Technology Stack

- **Frontend**: Vue 3 + TypeScript + Three.js + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io + TypeScript
- **Database**: PostgreSQL + Redis
- **Real-time**: WebRTC + TURN server
- **Infrastructure**: Docker + Nginx
- **Code Quality**: Biome (formatting + linting)

## 🎯 Key Features

### Full Multiplayer Game
- **6-player multiplayer** horror survival gameplay
- **Real-time communication** via WebRTC and Socket.io
- **3D game board** with Three.js
- **Dynamic dice rolling** and card mechanics
- **Voice chat** integration
- **Performance monitoring** and profiling
- **Comprehensive testing** suite

### Game Engine Simulator
- **Game balance testing** and statistical analysis
- **Configurable game parameters** (strikes, rounds, players)
- **Face card modifier testing** (Jack, Queen, King effects)
- **Reserve deck distribution** analysis
- **Trophy pile mechanics** simulation
- **Threat deck configuration** testing
- **Success/failure rate** calculations

## 📚 Documentation

For detailed documentation, see:
- **[App README](app/README.md)** - Complete setup and development guide
- **[Docker Development Guide](app/DOCKER_DEVELOPMENT.md)** - Docker-specific instructions
- **[Implementation Plan](app/IMPLEMENTATION_PLAN.md)** - Development roadmap
- **[Cursor Rules](app/CURSOR_RULES.md)** - Development guidelines

## 🐳 Development

### Prerequisites
- Docker and Docker Compose (for multiplayer game)
- Node.js 24.3.0 (for local development)
- Python 3.x (for simulator)

### Quick Commands

#### Multiplayer Game
```bash
# Start development environment
cd app && docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Run tests
cd app/frontend && npm test
cd app/backend && npm test

# Code quality
cd app && npm run format
cd app && npm run lint
```

#### Game Engine Simulator
```bash
# Start simulator server
./start-server.sh

# Or with custom port
./start-server.sh -p 8080

# Access simulator
# Open: http://localhost:8000
```

## 🧪 Testing

```bash
# Run all tests
cd app && npm test

# Frontend tests
cd app/frontend && npm test

# Backend tests
cd app/backend && npm test
```

## 🔧 Port Configuration

The application uses the **xx13** port convention:
- **3013**: Frontend (Vue.js)
- **4013**: Backend (Express API)
- **8013**: Nginx reverse proxy
- **5432**: PostgreSQL
- **6379**: Redis
- **3478**: TURN server (WebRTC)

## 📈 Performance & Security

- **Frontend**: <2MB bundle, FCP<1.5s, 60fps desktop
- **Backend**: API<100ms, DB<50ms, mem<512MB
- **Security**: HTTPS, JWT+refresh rotation, Zod validation, rate limiting

## 🤝 Contributing

1. Follow the coding standards in `app/CURSOR_RULES.md`
2. Use Biome for formatting and linting
3. Write unit tests for new features
4. Follow the Git workflow: `feature/<desc>`, `bugfix/<desc>`

## 📄 License

[Add your license information here]

---

**NotT** - Where survival meets betrayal in the darkness of the thirteenth night. 