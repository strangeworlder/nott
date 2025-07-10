import { vi } from 'vitest';
import { setupAccessibilityTesting } from './utils/accessibility';

// Setup accessibility testing
setupAccessibilityTesting();

// Setup proper HTML structure for accessibility testing
document.documentElement.lang = 'en';
document.title = 'NotT - Horror Tabletop Game';

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:4013');
vi.stubEnv('VITE_SOCKET_URL', 'http://localhost:4013');

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    go: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
  }),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock WebRTC
Object.defineProperty(window, 'RTCPeerConnection', {
  value: vi.fn(),
  writable: true,
});

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
  },
  writable: true,
});

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(),
  writable: true,
});

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  AmbientLight: vi.fn(),
  PointLight: vi.fn(),
  Fog: vi.fn(),
  BoxGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  Mesh: vi.fn(),
  Vector3: vi.fn(),
  Euler: vi.fn(),
}));

// Mock Socket.io
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));
