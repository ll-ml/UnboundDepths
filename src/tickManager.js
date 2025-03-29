export class TickManager {
    constructor(tickInterval) {
      this.tickInterval = tickInterval; // current: 600ms per tick
      this.accumulator = 0;
      this.lastTickTime = performance.now();
      this.tickCallbacks = [];
    }
  
    // Callbacks to run on every tick.
    onTick(callback) {
      this.tickCallbacks.push(callback);
    }
  
    // Update the tick system with the elapsed time.
    update(delta) {
      this.accumulator += delta;
      while (this.accumulator >= this.tickInterval) {
        this.tickCallbacks.forEach(callback => callback());
        this.accumulator -= this.tickInterval;
      }
    }
  }
  