// Socket.io composable for Vue components
// Provides easy-to-use real-time communication

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { socketService, type SocketState, type SocketEventHandlers } from '@/services/socket/socketService';
import { useAuthStore } from '@/stores/auth';

export function useSocket() {
  const authStore = useAuthStore();
  
  // Reactive state
  const state = ref<SocketState>(socketService.getState());
  const isConnecting = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isConnected = computed(() => state.value.isConnected);
  const isAuthenticated = computed(() => state.value.isAuthenticated);
  const currentGameId = computed(() => state.value.currentGameId);

  // Connect to socket
  const connect = async (): Promise<void> => {
    if (!authStore.isAuthenticated) {
      throw new Error('User must be authenticated to connect to socket');
    }

    isConnecting.value = true;
    error.value = null;

    try {
      await socketService.connect();
      updateState();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed';
      throw err;
    } finally {
      isConnecting.value = false;
    }
  };

  // Disconnect from socket
  const disconnect = (): void => {
    socketService.disconnect();
    updateState();
  };

  // Join a game
  const joinGame = async (gameId: string, role: 'player' | 'director' = 'player'): Promise<void> => {
    if (!isConnected.value) {
      throw new Error('Socket not connected');
    }

    try {
      await socketService.joinGame(gameId, role);
      updateState();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join game';
      throw err;
    }
  };

  // Leave current game
  const leaveGame = async (): Promise<void> => {
    try {
      await socketService.leaveGame();
      updateState();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to leave game';
      throw err;
    }
  };

  // Set event handlers
  const setEventHandlers = (handlers: SocketEventHandlers): void => {
    socketService.setEventHandlers(handlers);
  };

  // Game actions
  const setPlayerReady = (isReady: boolean): void => {
    socketService.setPlayerReady(isReady);
  };

  const rollDice = (diceType: string, count: number, modifier?: number): void => {
    socketService.rollDice(diceType, count, modifier);
  };

  const playCard = (cardId: string, position?: number): void => {
    socketService.playCard(cardId, position);
  };

  const sendChatMessage = (message: string, type: 'player' | 'system' = 'player'): void => {
    socketService.sendChatMessage(message, type);
  };

  const sendGameAction = (action: string, data?: Record<string, unknown>): void => {
    socketService.sendGameAction(action, data);
  };

  const sendDirectorAction = (action: string, targetPlayer?: string, data?: Record<string, unknown>): void => {
    socketService.sendDirectorAction(action, targetPlayer, data);
  };

  const sendVoiceSignal = (to: string, signal: unknown): void => {
    socketService.sendVoiceSignal(to, signal);
  };

  // Update state from service
  const updateState = (): void => {
    state.value = socketService.getState();
  };

  // Auto-connect on mount if authenticated
  onMounted(() => {
    if (authStore.isAuthenticated && !isConnected.value) {
      connect().catch((err) => {
        console.error('Failed to auto-connect socket:', err);
      });
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    // Don't disconnect here as other components might be using the socket
    // The socket service will handle cleanup when the app is closed
  });

  return {
    // State
    state,
    isConnecting,
    error,
    isConnected,
    isAuthenticated,
    currentGameId,

    // Methods
    connect,
    disconnect,
    joinGame,
    leaveGame,
    setEventHandlers,
    setPlayerReady,
    rollDice,
    playCard,
    sendChatMessage,
    sendGameAction,
    sendDirectorAction,
    sendVoiceSignal,
    updateState,
  };
} 