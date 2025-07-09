import { GAME_CONSTANTS } from './constants.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { Character } from './character.js';
import { DiceRoller } from './dice.js';

// Game class with improved structure
export class Game {
  constructor(config) {
    this.config = config;
    this.numPlayers = config.numPlayers;
    this.genrePoints = config.genrePoints;
    this.strikes = Array(this.numPlayers).fill(0);
    this.defeatedSuits = new Set();
    this.inEndgame = false;
    this.gameOver = false;
    this.victory = false;
    this.rounds = 0;
    this.tests = 0;
    this.endReason = null;
    
    this.characters = [];
    this.threatDeck = null;
    this.reserves = {};
    this.trophyPile = null;
    
    this._buildCharacters();
    this._setupDecks();
  }

  _buildCharacters() {
    this.characters = GAME_CONSTANTS.SUITS.map((suit, index) => 
      new Character(suit, GAME_CONSTANTS.APTITUDES[index])
    );
  }

  _setupDecks() {
    const fullDeck = this._buildFullDeck();
    const { aces, nonAces } = this._separateCards(fullDeck);
    
    this.threatDeck = this._buildThreatDeck(aces, nonAces);
    this.reserves = this._buildReserves(nonAces);
    
    // Initialize trophy pile based on configuration
    let initialCard = null;
    if (this.config.trophyPileInitial === 'top' && this.reserves.number.length > 0) {
      initialCard = this.reserves.number.shift();
    } else if (this.config.trophyPileInitial === 'bottom' && this.reserves.number.length > 0) {
      initialCard = this.reserves.number.pop();
    }
    // If 'none' or no cards available, initialCard remains null
    
    this.trophyPile = new Deck(initialCard ? [initialCard] : []);
  }

  _buildFullDeck() {
    const full = [];
    
    // Number cards (1-10)
    for (let rank = 1; rank <= 10; rank++) {
      GAME_CONSTANTS.SUITS.forEach(suit => {
        full.push(new Card(rank, suit));
      });
    }
    
    // Face cards (J, Q, K)
    GAME_CONSTANTS.FACE_CARDS.forEach(rank => {
      GAME_CONSTANTS.SUITS.forEach(suit => {
        full.push(new Card(rank, suit));
      });
    });
    
    // Jokers
    GAME_CONSTANTS.JOKERS.forEach(rank => {
      full.push(new Card(rank, null));
    });
    
    return full;
  }

  _separateCards(fullDeck) {
    const aces = fullDeck.filter(card => card.isAce());
    const nonAces = fullDeck.filter(card => !card.isAce());
    return { aces, nonAces };
  }

  _buildThreatDeck(aces, nonAces) {
    // Build threat pool based on configuration
    const threatPoolCards = [];
    
    // Add number cards based on configuration
    if (this.config.includeTwos) {
      threatPoolCards.push(...nonAces.filter(card => card.rank === 2));
    }
    if (this.config.includeThrees) {
      threatPoolCards.push(...nonAces.filter(card => card.rank === 3));
    }
    if (this.config.includeFours) {
      threatPoolCards.push(...nonAces.filter(card => card.rank === 4));
    }
    if (this.config.includeFives) {
      threatPoolCards.push(...nonAces.filter(card => card.rank === 5));
    }
    
    // Add initial face card if configured
    if (this.config.includeInitialFaceCard) {
      const faceCards = nonAces.filter(card => card.rank === this.config.initialFaceCardType);
      if (faceCards.length > 0) {
        threatPoolCards.push(faceCards[0]); // Take the first one
      }
    }
    
    const threatPool = new Deck(threatPoolCards);
    threatPool.shuffleDeck('Threat Pool');

    // Build Threat Deck based on configuration
    const threatDeckCards = [];
    
    // Add aces on top if configured
    if (this.config.includeAces) {
      threatDeckCards.push(...aces);
    }
    
    // Add threat pool cards
    threatDeckCards.push(...threatPool.cards);
    
    return new Deck(threatDeckCards);
  }

  _buildReserves(nonAces) {
    // Get all number cards that were used in the threat deck
    const usedNumberCards = [];
    
    if (this.config.includeTwos) {
      usedNumberCards.push(...nonAces.filter(card => card.rank === 2));
    }
    if (this.config.includeThrees) {
      usedNumberCards.push(...nonAces.filter(card => card.rank === 3));
    }
    if (this.config.includeFours) {
      usedNumberCards.push(...nonAces.filter(card => card.rank === 4));
    }
    if (this.config.includeFives) {
      usedNumberCards.push(...nonAces.filter(card => card.rank === 5));
    }
    
    // Add initial face card if configured
    if (this.config.includeInitialFaceCard) {
      const faceCards = nonAces.filter(card => card.rank === this.config.initialFaceCardType);
      if (faceCards.length > 0) {
        usedNumberCards.push(faceCards[0]); // Take the first one
      }
    }
    
    // Number reserve contains all number cards NOT used in threat deck
    const allNumberCards = nonAces.filter(card => card.isNumberCard());
    const numberReserve = allNumberCards.filter(card => 
      !usedNumberCards.some(usedCard => 
        usedCard.rank === card.rank && usedCard.suit === card.suit
      )
    );
    
    return {
      number: numberReserve,
      face: {
        J: nonAces.filter(card => card.rank === 'J'),
        Q: nonAces.filter(card => card.rank === 'Q'),
        K: nonAces.filter(card => card.rank === 'K')
      },
      jokers: nonAces.filter(card => card.isJoker())
    };
  }

  chooseActor(suit) {
    // Prefer matching suit
    let actor = this.characters.find(char => char.suit === suit && !char.acted);
    if (actor) return actor;
    
    // Else rotate through available characters
    let available = this.characters.filter(char => !char.acted);
    if (!available.length) {
      this.characters.forEach(char => char.reset());
      available = [...this.characters];
    }
    return available[0];
  }

  reveal() {
    const card = this.threatDeck.peekTop();
    console.log(`Next Threat: ${card}`);
    return card;
  }

  _calculateDifficulty(card) {
    if (card.isNumberCard()) {
      return card.rank;
    }
    
    const trophyTop = this.trophyPile.peekTop();
    if (!trophyTop) {
      // If trophy pile is empty, use a default difficulty of 1
      const baseDifficulty = 1;
      switch (card.rank) {
        case 'J': return baseDifficulty + this.config.jackModifier;
        case 'Q': return baseDifficulty + this.config.queenModifier;
        case 'K': return baseDifficulty + this.config.kingModifier;
        default: return baseDifficulty;
      }
    }
    
    const baseDifficulty = trophyTop.rank;
    
    switch (card.rank) {
      case 'J': return baseDifficulty + this.config.jackModifier;
      case 'Q': return baseDifficulty + this.config.queenModifier;
      case 'K': return baseDifficulty + this.config.kingModifier;
      default: return baseDifficulty;
    }
  }

  _checkSuccess(total, difficulty) {
    if (this.config.successCondition === 'higherThan') {
      return total > difficulty;
    } else {
      return total >= difficulty;
    }
  }

  _checkTrophyShuffle(trigger) {
    switch (trigger) {
      case 'fail':
        return this.config.shuffleTrophyOnFail;
      case 'faceCard':
        return this.config.shuffleTrophyOnFaceCard;
      case 'joker':
        return this.config.shuffleTrophyOnJoker;
      default:
        return false;
    }
  }

  _performTest(actor, threatCard, difficulty, log = true) {
    this.tests++;
    
    // First roll
    const { main: main1, fallout: fallout1, total: total1 } = DiceRoller.rollD13();
    if (log) console.log(`Initial roll: ${total1} (${main1} + F${fallout1})`);
    
    // Apply aptitude bonus to first roll
    const adjustedFallout1 = actor.adjustFallout(fallout1, threatCard.suit, difficulty, main1, this._checkSuccess.bind(this));
    const adjustedTotal1 = main1 + adjustedFallout1;
    
    let finalTotal = adjustedTotal1;
    let finalFallout = adjustedFallout1;
    let usedGenrePoint = false;
    
    // Check if we failed and have Genre Points to spend
    if (!this._checkSuccess(adjustedTotal1, difficulty) && this.genrePoints > 0) {
      // Spend 1 Genre Point
      this.genrePoints--;
      usedGenrePoint = true;
      
      if (this.config.genrePointBehavior === 'plusOne') {
        // +1 to main dice behavior
        const newMain = main1 + 1;
        const adjustedFalloutNew = actor.adjustFallout(fallout1, threatCard.suit, difficulty, newMain, this._checkSuccess.bind(this));
        finalTotal = newMain + adjustedFalloutNew;
        finalFallout = adjustedFalloutNew;
        if (log) console.log(`Spent 1 GP for +1 to main: ${finalTotal} (${newMain} + F${adjustedFalloutNew})`);
      } else if (this.config.genrePointBehavior === 'rerollPlusOne') {
        // Reroll with +1 to main dice behavior
        if (log) console.log(`Spent 1 GP for reroll +1`);
        
        // Second roll with +1 to main
        const { main: main2, fallout: fallout2, total: total2 } = DiceRoller.rollD13();
        const newMain2 = main2 + 1;
        if (log) console.log(`Reroll +1 initial: ${total2 + 1} (${newMain2} + F${fallout2})`);
        
        // Apply aptitude bonus to second roll
        const adjustedFallout2 = actor.adjustFallout(fallout2, threatCard.suit, difficulty, newMain2, this._checkSuccess.bind(this));
        const adjustedTotal2 = newMain2 + adjustedFallout2;
        
        // Must keep the reroll result
        finalTotal = adjustedTotal2;
        finalFallout = adjustedFallout2;
        
        if (log) console.log(`Reroll +1 final: ${adjustedTotal2} (F${adjustedFallout2})`);
      } else {
        // Default reroll behavior
        if (log) console.log(`Spent 1 GP for reroll`);
        
        // Second roll
        const { main: main2, fallout: fallout2, total: total2 } = DiceRoller.rollD13();
        if (log) console.log(`Reroll initial: ${total2} (${main2} + F${fallout2})`);
        
        // Apply aptitude bonus to second roll
        const adjustedFallout2 = actor.adjustFallout(fallout2, threatCard.suit, difficulty, main2, this._checkSuccess.bind(this));
        const adjustedTotal2 = main2 + adjustedFallout2;
        
        // Must keep the reroll result
        finalTotal = adjustedTotal2;
        finalFallout = adjustedFallout2;
        
        if (log) console.log(`Reroll final: ${adjustedTotal2} (F${adjustedFallout2})`);
      }
    }
    
    const success = this._checkSuccess(finalTotal, difficulty);
    let genrePointLabel = '';
    if (usedGenrePoint) {
      switch (this.config.genrePointBehavior) {
        case 'plusOne':
          genrePointLabel = ' [+1]';
          break;
        case 'rerollPlusOne':
          genrePointLabel = ' [Reroll+1]';
          break;
        default:
          genrePointLabel = ' [Reroll]';
          break;
      }
    }
    if (log) console.log(`Roll ${finalTotal} (F${finalFallout}) - ${success ? 'Success' : 'Fail'}${genrePointLabel}`);
    
    return { success, finalTotal, finalFallout, usedGenrePoint };
  }

  _handleNumberCard(success, diff, playerIndex, fallout) {
    // Get the top card without removing it yet
    const card = this.threatDeck.peekTop();
    
    if (success) {
      // Success: Move Threat Card to top of Trophy Pile
      this.threatDeck.draw(); // Remove from threat deck
      this.trophyPile.addTopTo(card, 'Trophy Pile');
      // Add configurable number of cards from Number Reserve to bottom of Threat Deck
      this.reserves.number.splice(0, this.config.successNumberCards).forEach(c => this.threatDeck.addBottomTo(c, 'Threat Deck'));
    } else {
      // Failure: Move Threat Card to bottom of Threat Deck
      this.threatDeck.draw(); // Remove from top
      this.threatDeck.addBottomTo(card, 'Threat Deck');
      // Add configurable number of cards from Number Reserve under it
      this.reserves.number.splice(0, this.config.failureNumberCards).forEach(c => this.threatDeck.addBottomTo(c, 'Threat Deck'));
      // If Fallout 4, gain 1 Strike
      if (fallout === 4) this.strikes[playerIndex]++;
      
      // Check if we should shuffle trophy pile after failure
      if (this._checkTrophyShuffle('fail')) {
        this.trophyPile.shuffleDeck('Trophy Pile');
        console.log('Trophy Pile shuffled after failure');
      }
    }
  }

  _handleFaceCard(success, diff, playerIndex, fallout) {
    // Get the top card without removing it yet
    const card = this.threatDeck.peekTop();
    
    if (success) {
      const suit = card.suit;
      const firstTime = !this.defeatedSuits.has(suit);
      
      if (firstTime) {
        // First time defeating that suit - remove from game (marking weakness)
        this.threatDeck.draw(); // Remove from threat deck
        this.defeatedSuits.add(suit);
        console.log(`Defeated ${suit} suit for the first time!`);
        if (this.defeatedSuits.size === 4) {
          this.inEndgame = true;
          console.log('All four weaknesses found! Endgame triggered!');
          this._setupEndgame();
        }
      } else {
        // Otherwise, keep Threat Card in Threat Deck
        this.threatDeck.draw(); // Remove from top
        this.threatDeck.addBottomTo(card, 'Threat Deck');
      }
      
      // Draw from Face Card Reserves: Configurable based on fallout with fallback
      const preferredRank = fallout <= 2 ? this.config.lowFalloutFaceCard : this.config.highFalloutFaceCard;
      const cardToAdd = this._drawFaceCardWithFallback(preferredRank);
      if (cardToAdd) this.threatDeck.addBottomTo(cardToAdd, 'Threat Deck');
      
      // Success vs. Killer with Fallout 4 also grants 1 Strike
      if (fallout === 4) this.strikes[playerIndex]++;
    } else {
      // Failure: Gain 1 Strike
      this.strikes[playerIndex]++;
      // Move card to bottom of deck
      this.threatDeck.draw(); // Remove from top
      this.threatDeck.addBottomTo(card, 'Threat Deck');
      // Add a King from Face Card Reserves to bottom of Threat Deck (with fallback)
      const kingCard = this._drawFaceCardWithFallback('K');
      if (kingCard) this.threatDeck.addBottomTo(kingCard, 'Threat Deck');
    }
    
    // Check if we should shuffle trophy pile after face card
    if (this._checkTrophyShuffle('faceCard')) {
      this.trophyPile.shuffleDeck('Trophy Pile');
      console.log('Trophy Pile shuffled after face card');
    }
    
    // Shuffle entire Threat Deck
    this.threatDeck.shuffleDeck('Threat Deck');
  }

  _setupEndgame() {
    // Remove all number cards from Threat Deck, leaving only face cards + both Jokers
    this.threatDeck.removeAllNumberCards();
    // Add both jokers to the threat deck
    this.reserves.jokers.forEach(joker => this.threatDeck.addBottomTo(joker, 'Threat Deck'));
    this.threatDeck.shuffleDeck('Threat Deck');
    console.log('Endgame setup complete: Only face cards and jokers remain');
  }

  _handleJoker(playerIndex, log = true) {
    // Get the top card without removing it yet
    const card = this.threatDeck.peekTop();
    
    // Remove the card from the top of the threat deck
    this.threatDeck.draw();
    
    // When a Joker would be drawn: it isn't shown; its effect triggers immediately
    console.log(`${card.rank === 'R' ? 'Red' : 'Black'} Joker triggered!`);
    
    // Check if we should shuffle trophy pile after joker
    if (this._checkTrophyShuffle('joker')) {
      this.trophyPile.shuffleDeck('Trophy Pile');
      console.log('Trophy Pile shuffled after joker');
    }
    
    const trophyTop = this.trophyPile.peekTop();
    const difficulty = trophyTop.rank;
    
    // Get the current actor (same one who drew the joker)
    const actor = this.characters[playerIndex];
    
    if (card.rank === 'R') {
      // Red Joker (The End)
      const testResult = this._performTest(actor, card, difficulty, log);
      if (testResult.success) {
        // Success: survivors see dawn (win)
        this.victory = true;
        this.gameOver = true;
        this.endReason = 'Victory - Red Joker Success';
        console.log('Survivors see dawn! Victory!');
      } else {
        // Failure: character dies; shuffle Red Joker back, continue night
        this.strikes[playerIndex]++;
        this.threatDeck.addBottomTo(card, 'Threat Deck');
        this.threatDeck.shuffleDeck('Threat Deck');
        console.log('Character dies! Red Joker shuffled back.');
      }
    } else {
      // Black Joker (The Twist)
      const testResult = this._performTest(actor, card, difficulty, log);
      if (testResult.success) {
        // Success: remove highest face card from game
        const highestFaceCard = this.threatDeck.cards
          .filter(c => c.isFaceCard())
          .sort((a, b) => {
            const rankOrder = { 'J': 1, 'Q': 2, 'K': 3 };
            return rankOrder[b.rank] - rankOrder[a.rank];
          })[0];
        if (highestFaceCard) {
          this.threatDeck.removeCard(highestFaceCard);
          console.log(`Removed ${highestFaceCard} from game`);
        }
      } else {
        // Failure: add a King from Face Card Reserves (with fallback)
        const kingCard = this._drawFaceCardWithFallback('K');
        if (kingCard) this.threatDeck.addBottomTo(kingCard, 'Threat Deck');
        console.log(`Added ${kingCard} from reserves`);
      }
      // Black Joker then removed from game
      console.log('Black Joker removed from game');
    }
    this.threatDeck.shuffleDeck('Threat Deck');
  }

  _drawFaceCardWithFallback(preferredRank) {
    // Define the hierarchy: J < Q < K
    const rankHierarchy = ['J', 'Q', 'K'];
    const preferredIndex = rankHierarchy.indexOf(preferredRank);
    
    // Try to draw from preferred rank first
    if (this.reserves.face[preferredRank] && this.reserves.face[preferredRank].length > 0) {
      const card = this.reserves.face[preferredRank].shift();
      console.log(`Drew ${card} from ${preferredRank} reserves`);
      return card;
    }
    
    // If preferred rank is empty, try higher ranks in order
    for (let i = preferredIndex + 1; i < rankHierarchy.length; i++) {
      const fallbackRank = rankHierarchy[i];
      if (this.reserves.face[fallbackRank] && this.reserves.face[fallbackRank].length > 0) {
        const card = this.reserves.face[fallbackRank].shift();
        console.log(`Drew ${card} from ${fallbackRank} reserves (fallback from ${preferredRank})`);
        return card;
      }
    }
    
    // If no cards available in any higher rank, that's okay
    console.log(`No ${preferredRank} or higher face cards available in reserves`);
    return null;
  }

  playRound(log = true) {
    this.characters.forEach(char => char.reset());
    
    for (let playerIndex = 0; playerIndex < this.numPlayers && !this.gameOver; playerIndex++) {
      if (this.strikes[playerIndex] >= this.config.maxStrikes) continue;
      
      const threatCard = this.threatDeck.peekTop();
      if (!threatCard) {
        this.gameOver = true;
        this.victory = false;
        this.endReason = 'Defeat - Threat Deck Empty';
        console.log('Threat deck empty! Defeat!');
        break;
      }
      
      if (log) {
        console.log(`Next Threat: ${threatCard}`);
      }
      
      const actor = this.chooseActor(threatCard.suit);
      actor.acted = true;

      const difficulty = this._calculateDifficulty(threatCard);
      console.log(`Actor ${actor.suit} (${actor.aptitude}) vs ${threatCard} (Diff ${difficulty})`);

      // Perform the test
      const testResult = this._performTest(actor, threatCard, difficulty, log);

      // Handle different card types (they will handle card removal themselves)
      if (threatCard.isNumberCard()) {
        this._handleNumberCard(testResult.success, difficulty, playerIndex, testResult.finalFallout);
      } else if (threatCard.isFaceCard()) {
        this._handleFaceCard(testResult.success, difficulty, playerIndex, testResult.finalFallout);
      } else if (threatCard.isJoker()) {
        this._handleJoker(playerIndex, log);
      }

      console.log(`Strikes: ${this.strikes.join(', ')} | GP: ${this.genrePoints}`);
    }

    // Check for loss condition - all players eliminated
    if (this.characters.every((_, index) => this.strikes[index] >= this.config.maxStrikes)) {
      this.gameOver = true;
      this.victory = false;
      const weaknessesFound = this.defeatedSuits.size;
      this.endReason = `Defeat - All Players Eliminated (${weaknessesFound}/4 weaknesses)`;
      console.log(`All players eliminated! Defeat! (${weaknessesFound}/4 weaknesses found)`);
    }

    this.rounds++;
  }

  run(log = true) {
    this.rounds = 0;
    
    while (!this.gameOver && this.rounds < this.config.maxRounds) {
      this.playRound(log);
    }
    
    if (this.rounds >= this.config.maxRounds) {
      console.log('Stopped after max rounds (possible loop)');
      this.gameOver = false;
      this.victory = false;
      this.endReason = 'Timeout - Max Rounds Reached';
    }
    
    return { win: this.victory, rounds: this.rounds, tests: this.tests, endReason: this.endReason };
  }
} 