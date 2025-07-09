<template>
  <GameLayout>
    <template #game-header>
      <div class="flex items-center space-x-4">
        <span class="text-night-300 text-sm">
          Turn {{ _currentTurn }}/{{ _maxTurns }}
        </span>
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
          >
            Roll d13
          </BaseButton>
          <BaseButton
            @click="_drawCard"
            variant="ghost"
            size="sm"
            full-width
          >
            Draw Card
          </BaseButton>
        </div>
      </div>
    </template>

    <template #chat>
      <div class="flex flex-col h-full">
        <BaseText variant="h3" size="lg" color="white" class="mb-3">Chat</BaseText>
        <div class="flex-1 bg-night-800/50 rounded-lg p-3 mb-3 overflow-y-auto">
          <div v-for="message in chatMessages" :key="message.id" class="mb-2">
            <span class="text-xs text-night-400">{{ message.timestamp }}</span>
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
          />
          <BaseButton
            @click="_sendMessage"
            variant="blood"
            size="sm"
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Scene from './Scene.vue';

const route = useRoute();
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const gameId = route.params.gameId as string; // restored for template usage

// Game state
// const gameName = ref("The Haunted Mansion"); // TODO: Use in game header
const _currentTurn = ref(1);
const _maxTurns = ref(13);
const _playerRole = ref<'director' | 'player'>('player');
const isVoiceEnabled = ref(false);

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

const _toggleVoice = () => {
  isVoiceEnabled.value = !isVoiceEnabled.value;
  // TODO: Implement voice toggle
};

const _toggleSettings = () => {
  // TODO: Implement settings modal
};

const _rollDice = () => {
  // TODO: Implement dice rolling
};

const _drawCard = () => {
  // TODO: Implement card drawing
};

const _handleDiceRoll = (_result: number) => {
  // Dice roll handled
};

interface GameCard {
  id: string;
  name: string;
  type: string;
  description?: string;
}

const _handleCardPlay = (_card: GameCard) => {
  // Card play handled
};

const _sendMessage = () => {
  if (chatInput.value.trim()) {
    chatMessages.value.push({
      id: Date.now().toString(),
      username: 'You',
      message: chatInput.value,
      timestamp: new Date(),
    });
    chatInput.value = '';
  }
};

onMounted(() => {
  // TODO: Initialize game connection
  // console.log('Game mounted:', gameId);
});

onUnmounted(() => {
  // TODO: Cleanup game connection
  // console.log('Game unmounted');
});
</script> 