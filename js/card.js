import { GAME_CONSTANTS } from './constants.js';

// Card class with improved structure
export class Card {
  constructor(rank, suit = null) {
    this.rank = rank;
    this.suit = suit;
  }

  toString() {
    return this.suit ? `${this.rank}${this.suit}` : `${this.rank}`;
  }

  isNumberCard() {
    return typeof this.rank === 'number';
  }

  isFaceCard() {
    return GAME_CONSTANTS.FACE_CARDS.includes(this.rank);
  }

  isJoker() {
    return GAME_CONSTANTS.JOKERS.includes(this.rank);
  }

  isAce() {
    return this.rank === 1;
  }
} 