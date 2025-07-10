<template>
  <GameLayout>
    <template #game-header>
      <div class="flex items-center space-x-4">
        <span class="text-night-300 text-sm">
          Turn {{ _currentTurn }}/{{ _maxTurns }}
        </span>
        <!-- Connection status indicator -->
        <div class="flex items-center space-x-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-xs text-night-400">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <button @click="_toggleVoice" class="text-blood-400 hover:text-blood-300">
          {{ isVoiceEnabled ? '🔊' : '🔇' }}
        </button>
        <button @click="_toggleSettings" class="text-night-300 hover:text-white">
          ⚙️
        </button>
      </div>
    </template>

    <template #sidebar>
      <!-- Player list -->
      <div class="mb-6">
        <BaseText variant="h3" size="lg" color="white" class="mb-3">Players</BaseText>
        <div class="space-y-2">
          <div 
            v-for="player in _players" 
            :key="player.id"
            class="flex items-center space-x-3 p-2 rounded-lg"
            :class="player.isConnected ? 'bg-night-700/50' : 'bg-night-800/30'"
          >
            <div class="w-2 h-2 rounded-full"
                 :class="player.isConnected ? 'bg-green-500' : 'bg-red-500'">
            </div>
            <span class="text-sm text-white">{{ player.username }}</span>
            <span class="text-xs text-night-400">{{ player.role }}</span>
          </div>
        </div>
      </div>
      
      <!-- Game controls -->
      <div class="mb-6">
        <BaseText variant="h3" size="lg" color="white" class="mb-3">Actions</BaseText>
        <div class="space-y-2">
          <BaseButton
            @click="_rollDice"
            variant="blood"
            size="sm"
            full-width
            :disabled="!isConnected"
          >
            Roll d13
          </BaseButton>
          <BaseButton
            @click="_drawCard"
            variant="ghost"
            size="sm"
            full-width
            :disabled="!isConnected"
          >
            Draw Card
          </BaseButton>
          <BaseButton
            @click="_toggleReady"
            variant="ghost"
            size="sm"
            full-width
            :disabled="!isConnected"
            :class="isReady ? 'bg-green-600' : 'bg-night-700'"
          >
            {{ isReady ? 'Ready' : 'Not Ready' }}
          </BaseButton>
        </div>
      </div>
    </template>

    <template #chat>
      <div class="flex flex-col h-full">
        <BaseText variant="h3" size="lg" color="white" class="mb-3">Chat</BaseText>
        <div class="flex-1 bg-night-800/50 rounded-lg p-3 mb-3 overflow-y-auto">
          <div v-for="message in chatMessages" :key="message.id" class="mb-2">
            <span class="text-xs text-night-400">{{ formatTime(message.timestamp) }}</span>
            <span class="text-sm text-white font-medium">{{ message.username }}:</span>
            <span class="text-sm text-night-300">{{ message.message }}</span>
          </div>
        </div>
        <div class="flex space-x-2">
          <input 
            v-model="chatInput"
            @keyup.enter="_sendMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-3 py-2 bg-night-800 border border-night-600 rounded-lg 
                   text-white placeholder-night-400 focus:outline-none focus:ring-2 
                   focus:ring-blood-500 focus:border-transparent"
            :disabled="!isConnected"
          />
          <BaseButton
            @click="_sendMessage"
            variant="blood"
            size="sm"
            :disabled="!isConnected || !chatInput.trim()"
          >
            Send
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Main game area (3D scene) -->
    <div class="h-full relative">
      <Scene
        :game-id="gameId"
        :player-role="_playerRole"
        @dice-rolled="_handleDiceRoll"
        @card-played="_handleCardPlay"
      />
    </div>
  </GameLayout>
</template>

<script setup lang="ts">
import GameLayout from '@/components/layout/GameLayout.vue';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSocket } from '@/composables/useSocket';
import Scene from './Scene.vue';

const route = useRoute();
const gameId = route.params.gameId as string;

// Socket connection
const {
  isConnected,
  isConnecting,
  error: socketError,
  currentGameId,
  connect,
  joinGame,
  leaveGame,
  setEventHandlers,
  setPlayerReady,
  rollDice,
  playCard,
  sendChatMessage,
  sendGameAction,
  sendDirectorAction,
} = useSocket();

// Game state
const _currentTurn = ref(1);
const _maxTurns = ref(13);
const _playerRole = ref<'director' | 'player'>('player');
const isVoiceEnabled = ref(false);
const isReady = ref(false);

// Players
const _players = ref([
  { id: '1', username: 'Director', role: 'director', isConnected: true },
  { id: '2', username: 'Player1', role: 'player', isConnected: true },
  { id: '3', username: 'Player2', role: 'player', isConnected: false },
  { id: '4', username: 'Player3', role: 'player', isConnected: true },
]);

// Chat
const chatInput = ref('');
const chatMessages = ref([
  { id: '1', username: 'Director', message: 'Welcome to the game!', timestamp: new Date() },
  { id: '2', username: 'Player1', message: 'Ready to play!', timestamp: new Date() },
]);

// Format time for chat messages
const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Socket event handlers
const setupSocketHandlers = () => {
  setEventHandlers({
    onConnect: () => {
      console.log('Connected to game server');
    },
    onDisconnect: (reason) => {
      console.log('Disconnected from game server:', reason);
    },
    onError: (error) => {
      console.error('Socket error:', error);
    },
    onRoomState: (data) => {
      console.log('Room state updated:', data);
      // Update players list
      if (data.players) {
        _players.value = data.players.map((player: any) => ({
          id: player.userId,
          username: player.username,
          role: player.role,
          isConnected: true,
        }));
      }
    },
    onPlayerJoined: (data) => {
      console.log('Player joined:', data);
      // Add new player to list
      _players.value.push({
        id: data.userId,
        username: data.username,
        role: data.role as 'director' | 'player',
        isConnected: true,
      });
    },
    onPlayerLeft: (data) => {
      console.log('Player left:', data);
      // Remove player from list
      _players.value = _players.value.filter(p => p.id !== data.userId);
    },
    onPlayerReady: (data) => {
      console.log('Player ready status:', data);
      // Update player ready status
      const player = _players.value.find(p => p.id === data.userId);
      if (player) {
        // Update ready status in player data
      }
    },
    onDiceRolled: (data) => {
      console.log('Dice rolled:', data);
      // Add dice roll to chat
      chatMessages.value.push({
        id: Date.now().toString(),
        username: data.username,
        message: `rolled ${data.count}d${data.diceType}${data.modifier ? ` + ${data.modifier}` : ''} = ${data.total} [${data.rolls.join(', ')}]`,
        timestamp: new Date(data.timestamp),
      });
    },
    onCardPlayed: (data) => {
      console.log('Card played:', data);
      // Add card play to chat
      chatMessages.value.push({
        id: Date.now().toString(),
        username: data.username,
        message: `played card ${data.cardId}`,
        timestamp: new Date(data.timestamp),
      });
    },
    onChatMessage: (data) => {
      console.log('Chat message:', data);
      // Add message to chat
      chatMessages.value.push({
        id: Date.now().toString(),
        username: data.username,
        message: data.message,
        timestamp: new Date(data.timestamp),
      });
    },
    onDirectorAction: (data) => {
      console.log('Director action:', data);
      // Handle director actions
      if (data.action === 'game:start') {
        // Game started
      } else if (data.action === 'game:end') {
        // Game ended
      }
    },
  });
};

// Game actions
const _toggleVoice = () => {
  isVoiceEnabled.value = !isVoiceEnabled.value;
  // TODO: Implement voice toggle
};

const _toggleSettings = () => {
  // TODO: Implement settings modal
};

const _rollDice = () => {
  if (!isConnected.value) return;
  
  // Roll d13 (which is actually d6 in the backend, but we'll use d13 for the game)
  rollDice('d6', 1, 0);
};

const _drawCard = () => {
  if (!isConnected.value) return;
  
  // TODO: Implement card drawing
  sendGameAction('card:draw');
};

const _toggleReady = () => {
  if (!isConnected.value) return;
  
  isReady.value = !isReady.value;
  setPlayerReady(isReady.value);
};

const _handleDiceRoll = (_result: number) => {
  // Dice roll handled by socket
};

interface GameCard {
  id: string;
  name: string;
  type: string;
  description?: string;
}

const _handleCardPlay = (_card: GameCard) => {
  // Card play handled by socket
};

const _sendMessage = () => {
  if (!chatInput.value.trim() || !isConnected.value) {
    return;
  }

  sendChatMessage(chatInput.value);
  chatInput.value = '';
};

// Initialize game connection
const initializeGame = async () => {
  try {
    // Connect to socket if not already connected
    if (!isConnected.value) {
      await connect();
    }

    // Join the game room
    await joinGame(gameId, _playerRole.value);
    
    console.log('Joined game:', gameId);
  } catch (error) {
    console.error('Failed to join game:', error);
  }
};

onMounted(async () => {
  setupSocketHandlers();
  await initializeGame();
});

onUnmounted(async () => {
  // Leave the game when component unmounts
  if (currentGameId.value === gameId) {
    await leaveGame();
  }
});
</script> 