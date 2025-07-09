// Character class
export class Character {
  constructor(suit, aptitude) {
    this.suit = suit;
    this.aptitude = aptitude;
    this.acted = false;
  }

  reset() {
    this.acted = false;
  }

  // Apply aptitude bonus to fallout die
  adjustFallout(fallout, threatSuit, difficulty, mainRoll, checkSuccessFn) {
    if (this.suit === threatSuit) {
      const addOne = Math.max(1, Math.min(4, fallout + 1));
      const subtractOne = Math.max(1, Math.min(4, fallout - 1));
      
      // Calculate totals for each option
      const originalTotal = mainRoll + fallout;
      const addOneTotal = mainRoll + addOne;
      const subtractOneTotal = mainRoll + subtractOne;
      
      // Strategy: 
      // 1. If we can turn a failure into success, do that
      // 2. If we're already succeeding, minimize fallout
      // 3. Otherwise, minimize total (lower is better)
      
      let bestFallout = fallout;
      let bestTotal = originalTotal;
      
      // Check if adding 1 turns failure into success
      if (!checkSuccessFn(originalTotal, difficulty) && checkSuccessFn(addOneTotal, difficulty) && addOne < 4) {
        bestFallout = addOne;
        bestTotal = addOneTotal;
      }
      // Check if subtracting 1 turns failure into success  
      else if (!checkSuccessFn(originalTotal, difficulty) && checkSuccessFn(subtractOneTotal, difficulty) && subtractOne < 4) {
        bestFallout = subtractOne;
        bestTotal = subtractOneTotal;
      }
      // If already succeeding, minimize fallout
      else if (checkSuccessFn(originalTotal, difficulty)) {
        if (addOne < fallout) {
          bestFallout = addOne;
          bestTotal = addOneTotal;
        } else if (subtractOne < fallout) {
          bestFallout = subtractOne;
          bestTotal = subtractOneTotal;
        }
      }
      // If still failing, minimize total
      else {
        if (addOneTotal < bestTotal) {
          bestFallout = addOne;
          bestTotal = addOneTotal;
        }
        if (subtractOneTotal < bestTotal) {
          bestFallout = subtractOne;
          bestTotal = subtractOneTotal;
        }
      }
      
      if (bestFallout !== fallout) {
        console.log(`${this.aptitude} aptitude: ${fallout} → ${bestFallout} (${originalTotal} → ${bestTotal})`);
      }
      return bestFallout;
    }
    return fallout;
  }
} 