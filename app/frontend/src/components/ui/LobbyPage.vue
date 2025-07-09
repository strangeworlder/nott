<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <BaseText
          variant="h1"
          size="4xl"
          color="blood-500"
          family="horror"
          align="center"
          class="mb-4"
        >
          Game Lobby
        </BaseText>
        <BaseText
          variant="p"
          size="lg"
          color="night-300"
          align="center"
        >
          Join an existing game or create a new one
        </BaseText>
      </div>

      <!-- Game creation section -->
      <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6 mb-8">
        <BaseText
          variant="h2"
          size="2xl"
          color="white"
          class="mb-4"
        >
          Create New Game
        </BaseText>
        
        <form @submit.prevent="_createGame" class="space-y-4">
          <BaseInput
            v-model="newGameName"
            type="text"
            label="Game Name"
            placeholder="Enter game name"
            required
          />
          
          <div class="flex items-center space-x-4">
            <BaseButton
              type="submit"
              variant="blood"
              size="lg"
              :loading="isCreating"
              :disabled="isCreating || !newGameName.trim()"
            >
              {{ isCreating ? 'Creating...' : 'Create Game' }}
            </BaseButton>
            
            <BaseButton
              type="button"
              variant="ghost"
              size="lg"
              @click="refreshGames"
              :loading="isLoading"
            >
              Refresh
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Available games -->
      <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
        <BaseText
          variant="h2"
          size="2xl"
          color="white"
          class="mb-6"
        >
          Available Games
        </BaseText>
        
        <div v-if="isLoading" class="text-center py-8">
          <BaseText variant="p" color="night-300">Loading games...</BaseText>
        </div>
        
        <div v-else-if="games.length === 0" class="text-center py-8">
          <BaseText variant="p" color="night-300">No games available. Create one!</BaseText>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="game in games"
            :key="game.id"
            class="bg-night-800/50 border border-night-600 rounded-lg p-4 hover:border-blood-500 transition-colors"
          >
            <div class="flex justify-between items-start mb-3">
              <BaseText
                variant="h3"
                size="lg"
                color="white"
                class="font-semibold"
              >
                {{ game.name }}
              </BaseText>
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="game.status === 'waiting' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'"
              >
                {{ game.status }}
              </span>
            </div>
            
            <div class="space-y-2 mb-4">
              <BaseText variant="p" size="sm" color="night-300">
                Director: {{ game.director }}
              </BaseText>
              <BaseText variant="p" size="sm" color="night-300">
                Players: {{ game.players }}/{{ game.maxPlayers }}
              </BaseText>
              <BaseText variant="p" size="sm" color="night-300">
                Created: {{ _formatDate(game.createdAt) }}
              </BaseText>
            </div>
            
            <BaseButton
              @click="_joinGame(game.id)"
              variant="blood"
              size="sm"
              :disabled="game.players >= game.maxPlayers"
              full-width
            >
              {{ game.players >= game.maxPlayers ? 'Full' : 'Join Game' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseInput from '@/components/ui/design-system/atoms/BaseInput.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { useAuthStore } from '@/stores/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Game state
const games = ref<Game[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const newGameName = ref('');

interface Game {
  id: string;
  name: string;
  director: string;
  status: 'waiting' | 'active' | 'completed';
  players: number;
  maxPlayers: number;
  createdAt: Date;
}

const _createGame = async () => {
  if (!newGameName.value.trim()) {
    return;
  }

  isCreating.value = true;

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newGame: Game = {
      id: `game-${Date.now()}`,
      name: newGameName.value,
      director: authStore.user?.username || 'Unknown',
      players: 1,
      maxPlayers: 6,
      status: 'waiting',
      createdAt: new Date(),
    };

    games.value.unshift(newGame);
    newGameName.value = '';

    // Navigate to the new game
    router.push(`/game/${newGame.id}`);
  } catch (error) {
    console.error('Failed to create game:', error);
  } finally {
    isCreating.value = false;
  }
};

const _joinGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};

const refreshGames = async () => {
  isLoading.value = true;
  try {
    // TODO: Implement games fetch API call
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data
    games.value = [
      {
        id: '1',
        name: 'The Haunted Mansion',
        director: 'HorrorMaster',
        status: 'waiting',
        players: 3,
        maxPlayers: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: '2',
        name: 'Dark Forest',
        director: 'NightKeeper',
        status: 'active',
        players: 5,
        maxPlayers: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
    ];
  } catch (error) {
    console.error('Failed to fetch games:', error);
  } finally {
    isLoading.value = false;
  }
};

const _formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

onMounted(() => {
  refreshGames();
});
</script> 