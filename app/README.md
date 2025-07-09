# Night of the Thirteenth (NotT) - Multiplayer Horror Survival Game

A complex multiplayer horror survival tabletop game built with Vue 3, Three.js, WebRTC, Socket.io, PostgreSQL, Redis, and Tailwind CSS.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Node.js 24.3.0 (for local development)

### Development Environment

1. **Start all services with Docker:**
   ```bash
   # Start development environment
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

2. **Access the application:**
   - **Frontend**: http://localhost:3013
   - **Backend API**: http://localhost:4013
   - **Nginx Proxy**: http://localhost:8013
   - **Database**: localhost:5432
   - **Redis**: localhost:6379
   - **TURN Server**: localhost:3478

### Production Environment

1. **Build and start production services:**
   ```bash
   # Build and start production environment
   docker-compose -f docker-compose.prod.yml up -d --build
   
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

2. **Access the application:**
   - **Frontend**: http://localhost:3013
   - **Backend API**: http://localhost:4013
   - **Nginx Proxy**: http://localhost:8013

## 🛠️ Local Development

### Prerequisites
- Node.js 24.3.0
- PostgreSQL 15+
- Redis 7+

### Setup

1. **Install dependencies:**
   ```bash
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on port 3013
   npm run dev:backend   # Backend on port 4013
   ```

3. **Set up database (optional):**
   ```bash
   # Start database services
   docker-compose up -d postgres redis
   ```

## 📁 Project Structure

```
app/
├── frontend/                 # Vue 3 + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── Dockerfile          # Production Dockerfile
│   └── Dockerfile.dev      # Development Dockerfile
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── socket/         # Socket.io handlers
│   │   ├── db/            # Database connection
│   │   └── config/        # Configuration
│   ├── Dockerfile          # Production Dockerfile
│   └── Dockerfile.dev      # Development Dockerfile
├── docker-compose.yml      # Development Docker Compose (default)
├── docker-compose.prod.yml # Production Docker Compose
├── nginx.conf             # Development nginx config (default)
├── nginx.prod.conf        # Production nginx config
└── package.json           # Root package.json
```

## 🔧 Port Configuration

The application uses the **xx13** port convention to avoid conflicts:

- **3013**: Frontend (Vue.js development server)
- **4013**: Backend (Express API server)
- **8013**: Nginx reverse proxy
- **5432**: PostgreSQL database
- **6379**: Redis cache
- **3478**: TURN server (WebRTC)

## 🎮 Game Features

### Core Gameplay
- **6-player multiplayer** horror survival tabletop game
- **Real-time communication** via WebRTC and Socket.io
- **3D game board** with Three.js
- **Dynamic dice rolling** and card mechanics
- **Voice chat** integration

### Technical Stack
- **Frontend**: Vue 3 + TypeScript + Three.js + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io + TypeScript
- **Database**: PostgreSQL + Redis
- **Real-time**: WebRTC + TURN server
- **Infrastructure**: Docker + Nginx

## 🐳 Docker Commands

### Development
```bash
# Start development environment
docker-compose up -d

# Stop development environment
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service]
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service]
```

### Database Management
```bash
# Start only database services
docker-compose up -d postgres redis

# Reset database
docker-compose down -v
docker-compose up -d postgres redis
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run tests with coverage
npm run test:coverage
```

## 🔍 Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Auto-fix linting issues
npm run check
```

## 📊 Monitoring

### Health Checks
- **Frontend**: http://localhost:3013
- **Backend**: http://localhost:4013/health
- **Nginx**: http://localhost:8013/health

### Database Status
```bash
# Check PostgreSQL
docker-compose exec postgres psql -U nott_user -d nott_dev

# Check Redis
docker-compose exec redis redis-cli ping

# Check TURN server
docker-compose exec coturn turnutils_uclient -v -t -u nott_user -w nott_password coturn:3478
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3013, 4013, 8013 are available
2. **Database connection**: Start PostgreSQL and Redis containers
3. **Node modules**: Run `npm install` in both frontend and backend
4. **Docker issues**: Rebuild containers with `--build` flag

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f coturn
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Team

6-person development team working on a complex multiplayer horror survival tabletop game.

---

**Night of the Thirteenth** - Where survival is just the beginning... 🎮👻