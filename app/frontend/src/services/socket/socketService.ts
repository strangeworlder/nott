// Socket.io client service for NotT frontend
// Provides real-time communication with the backend

import { io, type Socket } from 'socket.io-client';
import { environment } from '@/config/environment';
import { useAuthStore } from '@/stores/auth';
import type { 
  Game, 
  GamePlayer, 
  Test, 
  Strike, 
  Card
} from '@/types';

// Socket connection state
export interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  currentGameId?: string | null;
  error?: string | null;
  reconnectAttempts: number;
  lastConnected?: Date;
}

// Socket event handlers
export interface SocketEventHandlers {
  // Connection events
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: string) => void;

  // Game events
  onGameJoin?: (data: { gameId: string; userId: string }) => void;
  onGameLeave?: (data: { gameId: string; userId: string }) => void;
  onGameUpdate?: (data: { game: Game }) => void;
  onGameStart?: (data: { gameId: string }) => void;
  onGameEnd?: (data: { gameId: string; winnerId?: string }) => void;

  // Player events
  onPlayerJoin?: (data: { player: GamePlayer }) => void;
  onPlayerLeave?: (data: { playerId: string }) => void;
  onPlayerUpdate?: (data: { player: GamePlayer }) => void;
  onPlayerReady?: (data: { playerId: string; ready: boolean }) => void;

  // Room events
  onRoomState?: (data: {
    gameId: string;
    name: string;
    status: string;
    maxPlayers: number;
    players: GamePlayer[];
    director?: GamePlayer;
    playerCount: number;
    settings: Record<string, unknown>;
  }) => void;
  onPlayerJoined?: (data: {
    userId: string;
    username: string;
    role: string;
    timestamp: Date;
  }) => void;
  onPlayerLeft?: (data: {
    userId: string;
    username: string;
    timestamp: Date;
  }) => void;

  // Game mechanics events
  onDiceRolled?: (data: {
    userId: string;
    username: string;
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    timestamp: Date;
  }) => void;
  onTestPerform?: (data: { test: Test }) => void;
  onStrikeAdd?: (data: { strike: Strike }) => void;
  onCardDraw?: (data: { card: Card; playerId: string }) => void;
  onCardPlayed?: (data: {
    userId: string;
    username: string;
    cardId: string;
    position?: number;
    timestamp: Date;
  }) => void;

  // Chat events
  onChatMessage?: (data: {
    userId: string;
    username: string;
    message: string;
    type: string;
    timestamp: Date;
  }) => void;

  // Director events
  onDirectorAction?: (data: {
    action: string;
    targetPlayer?: string;
    data?: Record<string, unknown>;
    timestamp: Date;
  }) => void;

  // Voice events
  onVoiceSignal?: (data: {
    from: string;
    signal: unknown;
    timestamp: Date;
  }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private state: SocketState = {
    isConnected: false,
    isConnecting: false,
    isAuthenticated: false,
    reconnectAttempts: 0,
  };
  private eventHandlers: SocketEventHandlers = {};
  private reconnectTimer: number | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  // Initialize socket connection
  async connect(): Promise<void> {
    if (this.socket?.connected || this.state.isConnecting) {
      return;
    }

    this.state.isConnecting = true;
    this.state.error = null;

    try {
      const authStore = useAuthStore();
      const token = authStore.token;

      if (!token) {
        throw new Error('Authentication token required');
      }

      // Create socket connection
      this.socket = io(environment.SOCKET_URL, {
        auth: { token },
        timeout: environment.SOCKET_TIMEOUT,
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: false, // We'll handle reconnection manually
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to server
      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not initialized'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, environment.SOCKET_TIMEOUT);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.handleConnect();
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.handleConnectError(error);
          reject(error);
        });

        this.socket!.connect();
      });

    } catch (error) {
      this.handleError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    } finally {
      this.state.isConnecting = false;
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.state = {
      isConnected: false,
      isConnecting: false,
      isAuthenticated: false,
      reconnectAttempts: 0,
    };

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Set event handlers
  setEventHandlers(handlers: SocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Join a game room
  async joinGame(gameId: string, role: 'player' | 'director' = 'player'): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('game:join', { gameId, role }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this.state.currentGameId = gameId;
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join game'));
        }
      });
    });
  }

  // Leave current game
  async leaveGame(): Promise<void> {
    if (!this.socket?.connected || !this.state.currentGameId) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('game:leave', {}, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this.state.currentGameId = null;
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave game'));
        }
      });
    });
  }

  // Set player ready status
  setPlayerReady(isReady: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('player:ready', isReady);
  }

  // Roll dice
  rollDice(diceType: string, count: number, modifier?: number): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('dice:roll', { diceType, count, modifier: modifier || 0 });
  }

  // Play a card
  playCard(cardId: string, position?: number): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('card:play', { cardId, position });
  }

  // Send chat message
  sendChatMessage(message: string, type: 'player' | 'system' = 'player'): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('chat:message', { message, type });
  }

  // Send game action
  sendGameAction(action: string, data?: Record<string, unknown>): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('game:action', { action, data });
  }

  // Send director action
  sendDirectorAction(action: string, targetPlayer?: string, data?: Record<string, unknown>): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('director:action', { action, targetPlayer, data });
  }

  // Send voice signal
  sendVoiceSignal(to: string, signal: unknown): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('voice:signal', { to, signal });
  }

  // Get current state
  getState(): SocketState {
    return { ...this.state };
  }

  // Check if connected
  isConnected(): boolean {
    return this.state.isConnected;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  // Private methods
  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    // Connection events
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
    this.socket.on('connect_error', (error) => this.handleConnectError(error));

    // Game events
    this.socket.on('game:update', (data) => this.handleGameUpdate(data));
    this.socket.on('game:start', (data) => this.handleGameStart(data));
    this.socket.on('game:end', (data) => this.handleGameEnd(data));

    // Room events
    this.socket.on('room:state', (data) => this.handleRoomState(data));
    this.socket.on('player:joined', (data) => this.handlePlayerJoined(data));
    this.socket.on('player:left', (data) => this.handlePlayerLeft(data));
    this.socket.on('player:ready', (data) => this.handlePlayerReady(data));

    // Game mechanics events
    this.socket.on('dice:rolled', (data) => this.handleDiceRolled(data));
    this.socket.on('card:played', (data) => this.handleCardPlayed(data));

    // Chat events
    this.socket.on('chat:message', (data) => this.handleChatMessage(data));

    // Director events
    this.socket.on('director:action', (data) => this.handleDirectorAction(data));

    // Voice events
    this.socket.on('voice:signal', (data) => this.handleVoiceSignal(data));

    // Error events
    this.socket.on('error', (data) => this.handleError(data.message));
  }

  private handleConnect(): void {
    this.state.isConnected = true;
    this.state.isAuthenticated = true;
    this.state.isConnecting = false;
    this.state.error = null;
    this.state.lastConnected = new Date();
    this.state.reconnectAttempts = 0;

    if (this.eventHandlers.onConnect) {
      this.eventHandlers.onConnect();
    }

    if (environment.ENABLE_DEBUG) {
      console.log('[Socket] Connected successfully');
    }
  }

  private handleDisconnect(reason: string): void {
    this.state.isConnected = false;
    this.state.isAuthenticated = false;

    if (this.eventHandlers.onDisconnect) {
      this.eventHandlers.onDisconnect(reason);
    }

    if (environment.ENABLE_DEBUG) {
      console.log('[Socket] Disconnected:', reason);
    }

    // Attempt reconnection if not manually disconnected
    if (reason !== 'io client disconnect') {
      this.attemptReconnect();
    }
  }

  private handleConnectError(error: Error): void {
    this.state.isConnecting = false;
    this.state.error = error.message;

    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(error.message);
    }

    if (environment.ENABLE_DEBUG) {
      console.error('[Socket] Connection error:', error);
    }
  }

  private handleError(message: string): void {
    this.state.error = message;

    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(message);
    }

    if (environment.ENABLE_DEBUG) {
      console.error('[Socket] Error:', message);
    }
  }

  private attemptReconnect(): void {
    if (this.state.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleError('Max reconnection attempts reached');
      return;
    }

    this.state.reconnectAttempts++;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Exponential backoff, max 30s

    if (environment.ENABLE_DEBUG) {
      console.log(`[Socket] Attempting reconnection ${this.state.reconnectAttempts}/${this.maxReconnectAttempts}`);
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, this.reconnectDelay);
  }

  // Event handlers
  private handleGameUpdate(data: { game: Game }): void {
    if (this.eventHandlers.onGameUpdate) {
      this.eventHandlers.onGameUpdate(data);
    }
  }

  private handleGameStart(data: { gameId: string }): void {
    if (this.eventHandlers.onGameStart) {
      this.eventHandlers.onGameStart(data);
    }
  }

  private handleGameEnd(data: { gameId: string; winnerId?: string }): void {
    if (this.eventHandlers.onGameEnd) {
      this.eventHandlers.onGameEnd(data);
    }
  }

  private handleRoomState(data: any): void {
    if (this.eventHandlers.onRoomState) {
      this.eventHandlers.onRoomState(data);
    }
  }

  private handlePlayerJoined(data: any): void {
    if (this.eventHandlers.onPlayerJoined) {
      this.eventHandlers.onPlayerJoined(data);
    }
  }

  private handlePlayerLeft(data: any): void {
    if (this.eventHandlers.onPlayerLeft) {
      this.eventHandlers.onPlayerLeft(data);
    }
  }

  private handlePlayerReady(data: any): void {
    if (this.eventHandlers.onPlayerReady) {
      this.eventHandlers.onPlayerReady(data);
    }
  }

  private handleDiceRolled(data: any): void {
    if (this.eventHandlers.onDiceRolled) {
      this.eventHandlers.onDiceRolled(data);
    }
  }

  private handleCardPlayed(data: any): void {
    if (this.eventHandlers.onCardPlayed) {
      this.eventHandlers.onCardPlayed(data);
    }
  }

  private handleChatMessage(data: any): void {
    if (this.eventHandlers.onChatMessage) {
      this.eventHandlers.onChatMessage(data);
    }
  }

  private handleDirectorAction(data: any): void {
    if (this.eventHandlers.onDirectorAction) {
      this.eventHandlers.onDirectorAction(data);
    }
  }

  private handleVoiceSignal(data: any): void {
    if (this.eventHandlers.onVoiceSignal) {
      this.eventHandlers.onVoiceSignal(data);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService(); 