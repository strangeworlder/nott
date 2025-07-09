<template>
  <div class="w-full h-full">
    <Scene :game-id="gameId" :player-role="playerRole" />
  </div>
</template>

<script setup lang="ts">
import Scene from './Scene.vue';

interface Props {
  gameId: string;
  playerRole: 'director' | 'player';
}

interface GameCard {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface Emits {
  (e: 'dice-rolled', result: number): void;
  (e: 'card-played', card: GameCard): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script> 