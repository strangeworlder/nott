import { Logger } from './logger.js';
import { GameConfig } from './gameConfig.js';
import { Game } from './game.js';

// UI Controller
export class UIController {
  constructor() {
    this.logger = new Logger(document.getElementById('log'));
    this.summaryDiv = document.getElementById('summary');
    this.progressDiv = document.getElementById('progress');
    this.config = new GameConfig();
    this.setupEventListeners();
    this.toggleMode();
  }

  setupEventListeners() {
    document.getElementById('modeSingle').addEventListener('change', () => this.toggleMode());
    document.getElementById('modeMultiple').addEventListener('change', () => this.toggleMode());
    document.getElementById('runBtn').addEventListener('click', () => this.runSimulation());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    document.getElementById('resetDefaultsBtn').addEventListener('click', () => this.resetDefaults());
    document.getElementById('copyConfigBtn').addEventListener('click', () => this.copyConfig());
    document.getElementById('pasteConfigBtn').addEventListener('click', () => this.pasteConfig());
    
    // Threat pool size update listeners
    const threatPoolCheckboxes = [
      'includeOnes', 'includeTwos', 'includeThrees', 'includeFours', 'includeFives', 
      'includeInitialFaceCard'
    ];
    threatPoolCheckboxes.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.config.updateThreatPoolSize());
      }
    });
  }

  toggleMode() {
    const isMultiple = document.getElementById('modeMultiple').checked;
    document.querySelectorAll('.multiple-only').forEach(el => 
      el.classList.toggle('d-none', !isMultiple)
    );
    document.getElementById('log').classList.toggle('d-none', isMultiple);
    this.progressDiv.classList.toggle('d-none', !isMultiple);
    this.summaryDiv.classList.toggle('d-none', !isMultiple);
  }

  getSimulationCount() {
    return parseInt(document.getElementById('simCount').value) || 1;
  }

  isSingleMode() {
    return document.getElementById('modeSingle').checked;
  }

  runSingleSimulation() {
    this.config.loadFromUI();
    new Game(this.config).run(true);
  }

  runMultipleSimulations() {
    this.config.loadFromUI();
    const count = this.getSimulationCount();
    
    let wins = 0;
    let totalRounds = 0;
    let totalTests = 0;
    let completed = 0;
    let endReasons = {};
    
    // Initialize progress display
    this.updateProgress(0, count, 0, 0, 0, endReasons);
    
    const runSimulationBatch = (startIndex) => {
      const batchSize = 10; // Run 10 simulations per batch
      const endIndex = Math.min(startIndex + batchSize, count);
      
      for (let i = startIndex; i < endIndex; i++) {
        const result = new Game(this.config).run(false);
        if (result.win) wins++;
        totalRounds += result.rounds;
        totalTests += result.tests;
        completed++;
        
        // Track end reasons
        const reason = result.endReason || 'Unknown';
        endReasons[reason] = (endReasons[reason] || 0) + 1;
      }
      
      // Update progress after each batch
      this.updateProgress(completed, count, wins, totalRounds, totalTests, endReasons);
      
      // If there are more simulations to run, schedule the next batch
      if (completed < count) {
        setTimeout(() => runSimulationBatch(endIndex), 0);
      } else {
        // All simulations complete
        this.showSummary(wins, count, totalRounds, totalTests, endReasons);
      }
    };
    
    // Start the first batch
    runSimulationBatch(0);
  }

  resetDefaults() {
    this.config.resetToDefaults();
  }

  updateProgress(completed, total, wins, totalRounds, totalTests, endReasons = {}) {
    const progressPercent = (completed / total * 100).toFixed(1);
    const winRate = completed > 0 ? (wins / completed * 100).toFixed(1) : '0';
    const avgRounds = completed > 0 ? (totalRounds / completed).toFixed(2) : '0.00';
    const avgTests = completed > 0 ? (totalTests / completed).toFixed(1) : '0.0';
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progressPercent}%`;
    progressBar.textContent = `${progressPercent}%`;
    
    // Update progress text
    document.getElementById('progressText').textContent = `${completed} / ${total} simulations completed`;
    
    // Update statistics
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('avgRounds').textContent = avgRounds;
    document.getElementById('avgTests').textContent = avgTests;
    
    // Update end reasons if available
    if (Object.keys(endReasons).length > 0) {
      this.updateEndReasons(endReasons, completed);
    }
  }

  showSummary(wins, total, totalRounds, totalTests, endReasons = {}) {
    this.summaryDiv.classList.remove('d-none');
    const winRate = (wins / total * 100).toFixed(1);
    const avgRounds = (totalRounds / total).toFixed(2);
    const avgTests = (totalTests / total).toFixed(1);
    
    let summaryHTML = `
      <div class="alert alert-info">
        <strong>${wins}/${total} wins (${winRate}%), avg rounds: ${avgRounds}, avg tests: ${avgTests}</strong>
      </div>
    `;
    
    if (Object.keys(endReasons).length > 0) {
      summaryHTML += `
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">End Reasons</h6>
          </div>
          <div class="card-body">
            <div class="row">
      `;
      
      Object.entries(endReasons).forEach(([reason, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const isVictory = reason.includes('Victory');
        const badgeClass = isVictory ? 'bg-success' : 'bg-secondary';
        
        summaryHTML += `
          <div class="col-md-6 mb-2">
            <span class="badge ${badgeClass} me-2">${count}</span>
            <small>${reason} (${percentage}%)</small>
          </div>
        `;
      });
      
      summaryHTML += `
            </div>
          </div>
        </div>
      `;
    }
    
    this.summaryDiv.innerHTML = summaryHTML;
  }

  runSimulation() {
    this.logger.clear();
    this.summaryDiv.classList.add('d-none');
    this.summaryDiv.innerHTML = '';
    
    if (this.isSingleMode()) {
      this.runSingleSimulation();
    } else {
      // Reset progress for multiple simulations
      this.progressDiv.classList.remove('d-none');
      this.updateProgress(0, this.getSimulationCount(), 0, 0, 0);
      this.runMultipleSimulations();
    }
  }

  updateEndReasons(endReasons, completed) {
    const endReasonsElement = document.getElementById('endReasons');
    if (!endReasonsElement) return;
    
    let html = '';
    
    // Sort by count (descending) and then by reason name for consistency
    const sortedReasons = Object.entries(endReasons)
      .sort((a, b) => {
        // Primary sort: by count (descending)
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        // Secondary sort: by reason name (alphabetical)
        return a[0].localeCompare(b[0]);
      });
    
    sortedReasons.forEach(([reason, count]) => {
      const percentage = ((count / completed) * 100).toFixed(1);
      const isVictory = reason.includes('Victory');
      const badgeClass = isVictory ? 'bg-success' : 'bg-secondary';
      
      html += `
        <div class="mb-1">
          <span class="badge ${badgeClass} me-1">${count}</span>
          <small>${reason} (${percentage}%)</small>
        </div>
      `;
    });
    
    endReasonsElement.innerHTML = html;
  }

  clear() {
    this.logger.clear();
    this.summaryDiv.classList.add('d-none');
    this.summaryDiv.innerHTML = '';
    this.progressDiv.classList.add('d-none');
    this.updateProgress(0, 0, 0, 0, 0);
  }

  copyConfig() {
    this.config.loadFromUI();
    const config = this.config;
    
    const configText = `Night of the Thirteenth Configuration

Basic Settings:
- Mode: ${this.isSingleMode() ? 'Single' : 'Multiple'}
- Genre Points: ${config.genrePoints}
- Genre Point Behavior: ${this.getGenrePointBehaviorName(config.genrePointBehavior)}
- Max Strikes: ${config.maxStrikes}
- Max Rounds: ${config.maxRounds}
- Players: ${config.numPlayers}
- Success Condition: ${config.successCondition === 'equalOrHigher' ? '≥' : '>'}

Face Card Modifiers:
- Jack: +${config.jackModifier}
- Queen: +${config.queenModifier}
- King: +${config.kingModifier}

Reserve Distribution:
- Success Cards: ${config.successNumberCards}
- Failure Cards: ${config.failureNumberCards}
- Low Fallout (1-2): ${config.lowFalloutFaceCard}
- High Fallout (3-4): ${config.highFalloutFaceCard}

Trophy Pile Configuration:
- Initial Card: ${this.getTrophyPileInitialName(config.trophyPileInitial)}

Trophy Pile Shuffling:
- After Each Failure: ${config.shuffleTrophyOnFail ? 'Yes' : 'No'}
- After Each Face Card: ${config.shuffleTrophyOnFaceCard ? 'Yes' : 'No'}
- After Each Joker: ${config.shuffleTrophyOnJoker ? 'Yes' : 'No'}

Threat Deck Configuration:
- Include Aces: ${config.includeAces ? 'Yes' : 'No'}
- Include 2-5s: ${config.includeTwoToFive ? 'Yes' : 'No'}
- Initial Face Card: ${config.includeInitialFaceCard ? 'Yes' : 'No'}
- Face Card Type: ${config.initialFaceCardType}

Threat Pool Ranges:
- 1s (Aces): ${config.includeOnes ? 'Yes' : 'No'}
- 2s: ${config.includeTwos ? 'Yes' : 'No'}
- 3s: ${config.includeThrees ? 'Yes' : 'No'}
- 4s: ${config.includeFours ? 'Yes' : 'No'}
- 5s: ${config.includeFives ? 'Yes' : 'No'}
- Pool Size: ${(config.includeOnes ? 4 : 0) + (config.includeTwos ? 4 : 0) + (config.includeThrees ? 4 : 0) + (config.includeFours ? 4 : 0) + (config.includeFives ? 4 : 0) + (config.includeInitialFaceCard ? 1 : 0)}
- Number Reserve: ${this.config.calculateNumberReserveSize()} cards`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(configText).then(() => {
      // Show a temporary success message
      const originalText = document.getElementById('copyConfigBtn').textContent;
      document.getElementById('copyConfigBtn').textContent = 'Copied!';
      document.getElementById('copyConfigBtn').classList.remove('btn-outline-info');
      document.getElementById('copyConfigBtn').classList.add('btn-success');
      
      setTimeout(() => {
        document.getElementById('copyConfigBtn').textContent = originalText;
        document.getElementById('copyConfigBtn').classList.remove('btn-success');
        document.getElementById('copyConfigBtn').classList.add('btn-outline-info');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy config: ', err);
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(configText);
    });
  }

  getGenrePointBehaviorName(behavior) {
    switch (behavior) {
      case 'reroll': return 'Reroll';
      case 'plusOne': return '+1 to Main';
      case 'rerollPlusOne': return 'Reroll +1';
      default: return behavior;
    }
  }

  getTrophyPileInitialName(setting) {
    switch (setting) {
      case 'top': return 'Top of Reserve';
      case 'bottom': return 'Bottom of Reserve';
      case 'none': return 'None';
      default: return setting;
    }
  }

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        const originalText = document.getElementById('copyConfigBtn').textContent;
        document.getElementById('copyConfigBtn').textContent = 'Copied!';
        document.getElementById('copyConfigBtn').classList.remove('btn-outline-info');
        document.getElementById('copyConfigBtn').classList.add('btn-success');
        
        setTimeout(() => {
          document.getElementById('copyConfigBtn').textContent = originalText;
          document.getElementById('copyConfigBtn').classList.remove('btn-success');
          document.getElementById('copyConfigBtn').classList.add('btn-outline-info');
        }, 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
  }

  pasteConfig() {
    navigator.clipboard.readText().then(text => {
      try {
        const config = this.parseConfigText(text);
        this.applyConfig(config);
        
        // Show success feedback
        const originalText = document.getElementById('pasteConfigBtn').textContent;
        document.getElementById('pasteConfigBtn').textContent = 'Pasted!';
        document.getElementById('pasteConfigBtn').classList.remove('btn-outline-warning');
        document.getElementById('pasteConfigBtn').classList.add('btn-success');
        
        setTimeout(() => {
          document.getElementById('pasteConfigBtn').textContent = originalText;
          document.getElementById('pasteConfigBtn').classList.remove('btn-success');
          document.getElementById('pasteConfigBtn').classList.add('btn-outline-warning');
        }, 2000);
        
      } catch (error) {
        console.error('Failed to parse config:', error);
        this.showPasteError('Invalid configuration format');
      }
    }).catch(err => {
      console.error('Failed to read clipboard:', err);
      this.showPasteError('Failed to read clipboard');
    });
  }

  parseConfigText(text) {
    const config = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Parse basic settings
      if (trimmed.includes('Mode:')) {
        config.mode = trimmed.includes('Multiple') ? 'multiple' : 'single';
      } else if (trimmed.includes('Genre Points:')) {
        config.genrePoints = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Genre Point Behavior:')) {
        const behavior = trimmed.split(':')[1].trim();
        if (behavior.includes('Reroll +1')) config.genrePointBehavior = 'rerollPlusOne';
        else if (behavior.includes('+1 to Main')) config.genrePointBehavior = 'plusOne';
        else config.genrePointBehavior = 'reroll';
      } else if (trimmed.includes('Max Strikes:')) {
        config.maxStrikes = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Max Rounds:')) {
        config.maxRounds = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Players:')) {
        config.numPlayers = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Success Condition:')) {
        config.successCondition = trimmed.includes('≥') ? 'equalOrHigher' : 'higherThan';
      }
      
      // Parse face card modifiers
      else if (trimmed.includes('Jack: +')) {
        config.jackModifier = parseInt(trimmed.match(/\+(\d+)/)[1]);
      } else if (trimmed.includes('Queen: +')) {
        config.queenModifier = parseInt(trimmed.match(/\+(\d+)/)[1]);
      } else if (trimmed.includes('King: +')) {
        config.kingModifier = parseInt(trimmed.match(/\+(\d+)/)[1]);
      }
      
      // Parse reserve distribution
      else if (trimmed.includes('Success Cards:')) {
        config.successNumberCards = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Failure Cards:')) {
        config.failureNumberCards = parseInt(trimmed.match(/\d+/)[0]);
      } else if (trimmed.includes('Low Fallout (1-2):')) {
        config.lowFalloutFaceCard = trimmed.split(':')[1].trim();
      } else if (trimmed.includes('High Fallout (3-4):')) {
        config.highFalloutFaceCard = trimmed.split(':')[1].trim();
      }
      
      // Parse trophy pile configuration
      else if (trimmed.includes('Initial Card:')) {
        const setting = trimmed.split(':')[1].trim();
        if (setting.includes('Top')) config.trophyPileInitial = 'top';
        else if (setting.includes('Bottom')) config.trophyPileInitial = 'bottom';
        else config.trophyPileInitial = 'none';
      }
      
      // Parse trophy pile shuffling
      else if (trimmed.includes('After Each Failure:')) {
        config.shuffleTrophyOnFail = trimmed.includes('Yes');
      } else if (trimmed.includes('After Each Face Card:')) {
        config.shuffleTrophyOnFaceCard = trimmed.includes('Yes');
      } else if (trimmed.includes('After Each Joker:')) {
        config.shuffleTrophyOnJoker = trimmed.includes('Yes');
      }
      
      // Parse threat deck configuration
      else if (trimmed.includes('Include Aces:')) {
        config.includeAces = trimmed.includes('Yes');
      } else if (trimmed.includes('Include 2-5s:')) {
        config.includeTwoToFive = trimmed.includes('Yes');
      } else if (trimmed.includes('Initial Face Card:')) {
        config.includeInitialFaceCard = trimmed.includes('Yes');
      } else if (trimmed.includes('Face Card Type:')) {
        config.initialFaceCardType = trimmed.split(':')[1].trim();
      }
      
      // Parse threat pool ranges
      else if (trimmed.includes('1s (Aces):')) {
        config.includeOnes = trimmed.includes('Yes');
      } else if (trimmed.includes('2s:')) {
        config.includeTwos = trimmed.includes('Yes');
      } else if (trimmed.includes('3s:')) {
        config.includeThrees = trimmed.includes('Yes');
      } else if (trimmed.includes('4s:')) {
        config.includeFours = trimmed.includes('Yes');
      } else if (trimmed.includes('5s:')) {
        config.includeFives = trimmed.includes('Yes');
      }
    }
    
    return config;
  }

  applyConfig(config) {
    // Apply basic settings
    if (config.mode) {
      document.getElementById(config.mode === 'multiple' ? 'modeMultiple' : 'modeSingle').checked = true;
      this.toggleMode();
    }
    if (config.genrePoints !== undefined) {
      document.getElementById('genrePts').value = config.genrePoints;
    }
    if (config.genrePointBehavior) {
      document.getElementById(`genrePoint${this.getGenrePointBehaviorId(config.genrePointBehavior)}`).checked = true;
    }
    if (config.maxStrikes !== undefined) {
      document.getElementById('maxStrikes').value = config.maxStrikes;
    }
    if (config.maxRounds !== undefined) {
      document.getElementById('maxRounds').value = config.maxRounds;
    }
    if (config.numPlayers !== undefined) {
      document.getElementById('numPlayers').value = config.numPlayers;
    }
    if (config.successCondition) {
      document.getElementById(`success${config.successCondition === 'equalOrHigher' ? 'EqualOrHigher' : 'HigherThan'}`).checked = true;
    }
    
    // Apply face card modifiers
    if (config.jackModifier !== undefined) {
      document.getElementById('jackModifier').value = config.jackModifier;
    }
    if (config.queenModifier !== undefined) {
      document.getElementById('queenModifier').value = config.queenModifier;
    }
    if (config.kingModifier !== undefined) {
      document.getElementById('kingModifier').value = config.kingModifier;
    }
    
    // Apply reserve distribution
    if (config.successNumberCards !== undefined) {
      document.getElementById('successNumberCards').value = config.successNumberCards;
    }
    if (config.failureNumberCards !== undefined) {
      document.getElementById('failureNumberCards').value = config.failureNumberCards;
    }
    if (config.lowFalloutFaceCard) {
      document.getElementById('lowFalloutFaceCard').value = config.lowFalloutFaceCard;
    }
    if (config.highFalloutFaceCard) {
      document.getElementById('highFalloutFaceCard').value = config.highFalloutFaceCard;
    }
    
    // Apply trophy pile configuration
    if (config.trophyPileInitial) {
      document.getElementById(`trophyPile${this.getTrophyPileInitialId(config.trophyPileInitial)}`).checked = true;
    }
    
    // Apply trophy pile shuffling
    if (config.shuffleTrophyOnFail !== undefined) {
      document.getElementById('shuffleTrophyOnFail').checked = config.shuffleTrophyOnFail;
    }
    if (config.shuffleTrophyOnFaceCard !== undefined) {
      document.getElementById('shuffleTrophyOnFaceCard').checked = config.shuffleTrophyOnFaceCard;
    }
    if (config.shuffleTrophyOnJoker !== undefined) {
      document.getElementById('shuffleTrophyOnJoker').checked = config.shuffleTrophyOnJoker;
    }
    
    // Apply threat deck configuration
    if (config.includeAces !== undefined) {
      document.getElementById('includeAces').checked = config.includeAces;
    }
    if (config.includeTwoToFive !== undefined) {
      document.getElementById('includeTwoToFive').checked = config.includeTwoToFive;
    }
    if (config.includeInitialFaceCard !== undefined) {
      document.getElementById('includeInitialFaceCard').checked = config.includeInitialFaceCard;
    }
    if (config.initialFaceCardType) {
      document.getElementById('initialFaceCardType').value = config.initialFaceCardType;
    }
    
    // Apply threat pool ranges
    if (config.includeOnes !== undefined) {
      document.getElementById('includeOnes').checked = config.includeOnes;
    }
    if (config.includeTwos !== undefined) {
      document.getElementById('includeTwos').checked = config.includeTwos;
    }
    if (config.includeThrees !== undefined) {
      document.getElementById('includeThrees').checked = config.includeThrees;
    }
    if (config.includeFours !== undefined) {
      document.getElementById('includeFours').checked = config.includeFours;
    }
    if (config.includeFives !== undefined) {
      document.getElementById('includeFives').checked = config.includeFives;
    }
    
    // Update threat pool size display
    this.config.updateThreatPoolSize();
  }

  getGenrePointBehaviorId(behavior) {
    switch (behavior) {
      case 'reroll': return 'Reroll';
      case 'plusOne': return 'PlusOne';
      case 'rerollPlusOne': return 'RerollPlusOne';
      default: return 'Reroll';
    }
  }

  getTrophyPileInitialId(setting) {
    switch (setting) {
      case 'top': return 'Top';
      case 'bottom': return 'Bottom';
      case 'none': return 'None';
      default: return 'Top';
    }
  }

  showPasteError(message) {
    const originalText = document.getElementById('pasteConfigBtn').textContent;
    document.getElementById('pasteConfigBtn').textContent = 'Error!';
    document.getElementById('pasteConfigBtn').classList.remove('btn-outline-warning');
    document.getElementById('pasteConfigBtn').classList.add('btn-danger');
    
    setTimeout(() => {
      document.getElementById('pasteConfigBtn').textContent = originalText;
      document.getElementById('pasteConfigBtn').classList.remove('btn-danger');
      document.getElementById('pasteConfigBtn').classList.add('btn-outline-warning');
    }, 2000);
    
    // Also show a more detailed error message
    alert(`Paste failed: ${message}`);
  }
} 