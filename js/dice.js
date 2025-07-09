// Dice roller utility
export class DiceRoller {
  static rollD13() {
    const main = Math.floor(Math.random() * 10); // 0-9
    const fallout = Math.floor(Math.random() * 4) + 1; // 1-4
    return { main, fallout, total: main + fallout };
  }
} 