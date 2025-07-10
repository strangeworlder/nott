// Socket.io client service tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock socket.io-client - must be at top level
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  })),
}));

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    token: 'mock-token',
    isAuthenticated: true,
  }),
}));

// Mock environment
vi.mock('@/config/environment', () => ({
  environment: {
    SOCKET_URL: 'http://localhost:4013',
    SOCKET_TIMEOUT: 5000,
    ENABLE_DEBUG: false,
  },
}));

// Import after mocks are set up
import { socketService } from '@/services/socket/socketService';
import { io } from 'socket.io-client';

describe('SocketService', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Reset service state
    socketService.disconnect();
    
    // Create a fresh mock socket for each test
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      connected: false,
    };
    
    // Reset the io mock to return our mock socket
    (io as any).mockReturnValue(mockSocket);
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection', () => {
    it('should connect to socket server', async () => {
      // Mock successful connection
      mockSocket.on.mockImplementation((event: string, callback: () => void) => {
        if (event === 'connect') {
          // Call the callback immediately to simulate successful connection
          callback();
        }
      });

      await socketService.connect();

      expect(io).toHaveBeenCalledWith('http://localhost:4013', expect.any(Object));
      expect(mockSocket.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // Mock connection error
      mockSocket.on.mockImplementation((event: string, callback: (error: Error) => void) => {
        if (event === 'connect_error') {
          // Call the callback immediately with an error
          callback(new Error('Connection failed'));
        }
      });

      await expect(socketService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('Game Actions', () => {
    it('should join a game', async () => {
      // Mock successful connection
      mockSocket.on.mockImplementation((event: string, callback: () => void) => {
        if (event === 'connect') {
          callback();
        }
      });

      await socketService.connect();
      
      // Ensure socket is marked as connected
      mockSocket.connected = true;
      socketService['state'].isConnected = true;

      // Mock successful game join
      mockSocket.emit.mockImplementation((event: string, data: any, callback: (response: any) => void) => {
        if (event === 'game:join') {
          // Call the callback immediately with success
          callback({ success: true });
        }
      });

      await socketService.joinGame('test-game-id', 'player');

      expect(mockSocket.emit).toHaveBeenCalledWith('game:join', {
        gameId: 'test-game-id',
        role: 'player',
      }, expect.any(Function));
    });

    it('should roll dice', () => {
      // Set up socket as connected by directly setting the socket property
      socketService['socket'] = mockSocket;
      socketService['state'].isConnected = true;
      mockSocket.connected = true;

      socketService.rollDice('d6', 2, 1);

      expect(mockSocket.emit).toHaveBeenCalledWith('dice:roll', {
        diceType: 'd6',
        count: 2,
        modifier: 1,
      });
    });

    it('should send chat message', () => {
      // Set up socket as connected by directly setting the socket property
      socketService['socket'] = mockSocket;
      socketService['state'].isConnected = true;
      mockSocket.connected = true;

      socketService.sendChatMessage('Hello, world!', 'player');

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:message', {
        message: 'Hello, world!',
        type: 'player',
      });
    });
  });

  describe('State Management', () => {
    it('should return current state', () => {
      const state = socketService.getState();
      
      expect(state).toHaveProperty('isConnected');
      expect(state).toHaveProperty('isConnecting');
      expect(state).toHaveProperty('isAuthenticated');
      expect(state).toHaveProperty('reconnectAttempts');
    });

    it('should check connection status', () => {
      socketService['state'].isConnected = true;
      expect(socketService.isConnected()).toBe(true);

      socketService['state'].isConnected = false;
      expect(socketService.isConnected()).toBe(false);
    });
  });
}); 