// Data monitoring utility to track when data updates occur
export class DataMonitor {
  private lastData: string | null = null;
  private updateCount = 0;
  private listeners: Array<(data: any, isChange: boolean) => void> = [];

  public trackUpdate(data: any): boolean {
    const dataString = JSON.stringify(data);
    const isChange = this.lastData !== null && this.lastData !== dataString;
    
    if (isChange) {
      this.updateCount++;
      console.log(`🔄 Data update #${this.updateCount} detected at ${new Date().toLocaleTimeString()}`);
    } else if (this.lastData === null) {
      console.log(`📊 Initial data loaded at ${new Date().toLocaleTimeString()}`);
    } else {
      console.log(`⏱️ Data poll at ${new Date().toLocaleTimeString()} - no changes`);
    }
    
    this.lastData = dataString;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(data, isChange));
    
    return isChange;
  }

  public addListener(callback: (data: any, isChange: boolean) => void) {
    this.listeners.push(callback);
  }

  public getUpdateCount(): number {
    return this.updateCount;
  }

  public getLastUpdateTime(): Date | null {
    return this.lastData ? new Date() : null;
  }
}

export const dataMonitor = new DataMonitor();
