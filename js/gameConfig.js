// Game Configuration
export class GameConfig {
  constructor() {
    this.loadFromUI();
  }

  loadFromUI() {
    this.maxRounds = parseInt(document.getElementById('maxRounds')?.value) || 1000;
    this.maxStrikes = parseInt(document.getElementById('maxStrikes')?.value) || 3;
    this.numPlayers = parseInt(document.getElementById('numPlayers')?.value) || 4;
    this.genrePoints = parseInt(document.getElementById('genrePts')?.value) || 0;
    this.genrePointBehavior = document.querySelector('input[name="genrePointBehavior"]:checked')?.value || 'reroll';
    
    // Success condition
    this.successCondition = document.querySelector('input[name="successCondition"]:checked')?.value || 'equalOrHigher';
    
    // Face card difficulty modifiers
    this.jackModifier = parseInt(document.getElementById('jackModifier')?.value) || 1;
    this.queenModifier = parseInt(document.getElementById('queenModifier')?.value) || 2;
    this.kingModifier = parseInt(document.getElementById('kingModifier')?.value) || 3;
    
    // Reserve card distribution
    this.successNumberCards = parseInt(document.getElementById('successNumberCards')?.value) || 2;
    this.failureNumberCards = parseInt(document.getElementById('failureNumberCards')?.value) || 1;
    this.lowFalloutFaceCard = document.getElementById('lowFalloutFaceCard')?.value || 'J';
    this.highFalloutFaceCard = document.getElementById('highFalloutFaceCard')?.value || 'Q';
    
    // Threat deck configuration
    this.includeAces = document.getElementById('includeAces')?.checked ?? true;
    this.includeTwoToFive = document.getElementById('includeTwoToFive')?.checked ?? true;
    this.includeInitialFaceCard = document.getElementById('includeInitialFaceCard')?.checked ?? true;
    this.initialFaceCardType = document.getElementById('initialFaceCardType')?.value || 'J';
    
    // Custom threat pool
    this.includeOnes = document.getElementById('includeOnes')?.checked ?? true;
    this.includeTwos = document.getElementById('includeTwos')?.checked ?? true;
    this.includeThrees = document.getElementById('includeThrees')?.checked ?? true;
    this.includeFours = document.getElementById('includeFours')?.checked ?? true;
    this.includeFives = document.getElementById('includeFives')?.checked ?? true;
    
    // Trophy pile configuration
    this.trophyPileInitial = document.querySelector('input[name="trophyPileInitial"]:checked')?.value || 'top';
    
    // Trophy pile shuffling
    this.shuffleTrophyOnFail = document.getElementById('shuffleTrophyOnFail')?.checked ?? false;
    this.shuffleTrophyOnFaceCard = document.getElementById('shuffleTrophyOnFaceCard')?.checked ?? false;
    this.shuffleTrophyOnJoker = document.getElementById('shuffleTrophyOnJoker')?.checked ?? true;
    
    this.updateThreatPoolSize();
  }

  resetToDefaults() {
    document.getElementById('maxRounds').value = 1000;
    document.getElementById('maxStrikes').value = 3;
    document.getElementById('numPlayers').value = 4;
    document.getElementById('genrePts').value = 13;
    document.getElementById('genrePointRerollPlusOne').checked = true;
    document.getElementById('successEqualOrHigher').checked = true;
    document.getElementById('jackModifier').value = 1;
    document.getElementById('queenModifier').value = 2;
    document.getElementById('kingModifier').value = 3;
    document.getElementById('successNumberCards').value = 1;
    document.getElementById('failureNumberCards').value = 1;
    document.getElementById('lowFalloutFaceCard').value = 'J';
    document.getElementById('highFalloutFaceCard').value = 'Q';
    
    // Threat deck defaults
    document.getElementById('includeAces').checked = true;
    document.getElementById('includeTwoToFive').checked = true;
    document.getElementById('includeInitialFaceCard').checked = true;
    document.getElementById('initialFaceCardType').value = 'J';
    document.getElementById('includeOnes').checked = true;
    document.getElementById('includeTwos').checked = true;
    document.getElementById('includeThrees').checked = true;
    document.getElementById('includeFours').checked = true;
    document.getElementById('includeFives').checked = false;
    
    // Trophy pile configuration defaults
    document.getElementById('trophyPileBottom').checked = true;
    
    // Trophy pile shuffling defaults
    document.getElementById('shuffleTrophyOnFail').checked = false;
    document.getElementById('shuffleTrophyOnFaceCard').checked = true;
    document.getElementById('shuffleTrophyOnJoker').checked = true;
    
    this.loadFromUI();
  }

  updateThreatPoolSize() {
    let size = 0;
    if (this.includeOnes) size += 4; // 4 aces
    if (this.includeTwos) size += 4; // 4 twos
    if (this.includeThrees) size += 4; // 4 threes
    if (this.includeFours) size += 4; // 4 fours
    if (this.includeFives) size += 4; // 4 fives
    if (this.includeInitialFaceCard) size += 1; // 1 face card
    
    const sizeElement = document.getElementById('customThreatPoolSize');
    if (sizeElement) {
      sizeElement.value = size;
    }
    
    // Update number reserve size display
    const numberReserveSize = this.calculateNumberReserveSize();
    const numberReserveElement = document.getElementById('numberReserveSize');
    if (numberReserveElement) {
      numberReserveElement.textContent = numberReserveSize;
    }
  }

  calculateNumberReserveSize() {
    // Calculate how many number cards will be in the reserve
    let usedInThreatDeck = 0;
    if (this.includeTwos) usedInThreatDeck += 4;
    if (this.includeThrees) usedInThreatDeck += 4;
    if (this.includeFours) usedInThreatDeck += 4;
    if (this.includeFives) usedInThreatDeck += 4;
    if (this.includeInitialFaceCard) usedInThreatDeck += 1;
    
    // Total number cards in deck: 40 (2-10, 4 of each)
    const totalNumberCards = 40;
    return totalNumberCards - usedInThreatDeck;
  }
} 