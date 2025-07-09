# NotT Frontend Development Environment

A Vue 3 + TypeScript + Three.js horror-themed tabletop game frontend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for containerized development)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📦 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run dev:debug        # Start with debug logging
npm run type-check       # TypeScript type checking
```

### Building
```bash
npm run build            # Production build
npm run build:preview    # Preview build
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
npm run test:run         # Run tests once
```

### Code Quality
```bash
npm run format           # Format code with Biome
npm run lint             # Lint code with Biome
npm run lint:fix         # Fix linting issues
npm run check            # Format and lint
npm run validate         # Type check + lint + format
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm run clean:all        # Clean everything including node_modules
```

## 🛠️ Development Environment

### Environment Configuration
The app uses environment variables for configuration. Create `.env.development` for local development:

```env
VITE_APP_TITLE=NotT Development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:4013
VITE_SOCKET_URL=http://localhost:4013
VITE_DEBUG=true
VITE_ENABLE_DEVTOOLS=true
```

### Development Features
- **Hot Module Replacement (HMR)**: Instant updates during development
- **TypeScript**: Strict type checking with `noImplicitAny`
- **Biome**: Fast linting and formatting
- **Vitest**: Unit testing with coverage
- **Source Maps**: Debug-friendly builds
- **Proxy Configuration**: API and Socket.io proxying

### Development Utilities
- **Debug Logging**: `devLog.info()`, `devLog.debug()`
- **Performance Monitoring**: `performance.time()`, `performance.mark()`
- **Mock Data**: Development mock data available
- **Keyboard Shortcuts**: Ctrl+Shift+D for debug mode

## 🏗️ Project Structure

```
src/
├── components/          # Vue components
│   ├── ui/             # UI components
│   ├── game/           # Game-specific components
│   └── layout/         # Layout components
├── config/             # Configuration
├── stores/             # Pinia stores
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── assets/             # Static assets
└── tests/              # Test setup and utilities
```

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and store testing
- **Mock Setup**: Comprehensive mocking for external dependencies

### Running Tests
```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 🐳 Docker Development

### Using Docker
```bash
# Build and run development container
docker-compose up frontend

# Or build manually
docker build -f Dockerfile.dev -t nott-frontend-dev .
docker run -p 3000:3000 -v $(pwd):/app nott-frontend-dev
```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- Vue plugin setup
- Path aliases
- Development server proxy
- Build optimization
- Test configuration

### TypeScript Configuration (`tsconfig.json`)
- Strict type checking
- Path mapping
- Module resolution
- Development types

### Biome Configuration (`biome.json`)
- Code formatting
- Linting rules
- Performance optimizations
- Style enforcement

## 🚨 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**TypeScript errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

**Biome formatting issues**
```bash
# Reset Biome cache
npm run clean
npm run format
```

**Test failures**
```bash
# Clear test cache
npm run clean
npm run test
```

## 📚 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Biome linting rules
- Use design system components
- Write unit tests for new features

### Performance
- Use Vue 3 Composition API
- Optimize bundle size with manual chunks
- Monitor performance with dev tools
- Use lazy loading for routes

### Testing
- Write tests for all components
- Mock external dependencies
- Test error scenarios
- Maintain good coverage

## 🔗 Related Documentation

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Biome Documentation](https://biomejs.dev/)
- [Vitest Documentation](https://vitest.dev/) 