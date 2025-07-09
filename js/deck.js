// Deck class with improved methods
export class Deck {
  constructor(cards = []) {
    this.cards = [...cards]; // Create a copy to avoid mutations
  }

  shuffle() {
    console.log('Shuffling deck:', this.cards.map(c => c.toString()).join(', '));
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  shuffleDeck(deckName) {
    console.log(`Shuffling ${deckName}:`, this.cards.map(c => c.toString()).join(', '));
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    if (this.cards.length === 0) return null;
    const card = this.cards.shift();
    console.log(`Drew from top: ${card}`);
    return card;
  }

  drawBottom() {
    if (this.cards.length === 0) return null;
    const card = this.cards.pop();
    console.log(`Drew from bottom: ${card}`);
    return card;
  }

  addTop(card) {
    this.cards.unshift(card);
    console.log(`Added to top: ${card}`);
  }

  addBottom(card) {
    this.cards.push(card);
    console.log(`Added to bottom: ${card}`);
  }

  addTopTo(card, deckName) {
    this.cards.unshift(card);
    console.log(`Added ${card} to top of ${deckName}`);
  }

  addBottomTo(card, deckName) {
    this.cards.push(card);
    console.log(`Added ${card} to bottom of ${deckName}`);
  }

  peekTop() {
    return this.cards.length > 0 ? this.cards[0] : null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  size() {
    return this.cards.length;
  }

  removeCard(card) {
    const index = this.cards.findIndex(c => c.rank === card.rank && c.suit === card.suit);
    if (index >= 0) {
      return this.cards.splice(index, 1)[0];
    }
    return null;
  }

  // Remove all number cards (for endgame)
  removeAllNumberCards() {
    this.cards = this.cards.filter(card => !card.isNumberCard());
  }
} 