// Logger utility
export class Logger {
  constructor(logElement) {
    this.logElement = logElement;
    this.originalConsoleLog = console.log;
    this.setupConsoleOverride();
  }

  setupConsoleOverride() {
    console.log = (...args) => {
      this.originalConsoleLog(...args);
      if (!this.logElement.classList.contains('d-none')) {
        this.logElement.textContent += args.join(' ') + '\n';
      }
    };
  }

  clear() {
    this.logElement.textContent = '';
  }

  restoreConsole() {
    console.log = this.originalConsoleLog;
  }
} 