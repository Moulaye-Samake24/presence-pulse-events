// Real-time monitoring component to demonstrate live updates
import React, { useState, useEffect } from 'react';
import { usePulseData } from '../hooks/usePulseData';

export const RealTimeMonitor: React.FC = () => {
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(10);
  const { pulseData, isLoading, refresh } = usePulseData();

  useEffect(() => {
    // Track when data changes (polling happens)
    setLastPollTime(new Date());
    setPollCount(prev => prev + 1);
  }, [pulseData]);

  useEffect(() => {
    // Countdown timer for next poll
    const interval = setInterval(() => {
      setTimeUntilNext(prev => {
        if (prev <= 1) {
          return 10; // Reset to 10 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    refresh();
    setTimeUntilNext(10);
  };

  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 text-sm">
      <h3 className="font-semibold text-slate-800 mb-3">🔄 Real-Time Monitoring</h3>
      
      <div className="grid grid-cols-2 gap-4 text-slate-600">
        <div>
          <span className="font-medium">Poll Count:</span>
          <div className="text-lg font-bold text-blue-600">{pollCount}</div>
        </div>
        
        <div>
          <span className="font-medium">Next Update:</span>
          <div className="text-lg font-bold text-orange-600">{timeUntilNext}s</div>
        </div>
        
        <div className="col-span-2">
          <span className="font-medium">Last Update:</span>
          <div className="text-slate-800">
            {lastPollTime ? lastPollTime.toLocaleTimeString() : 'Never'}
          </div>
        </div>
        
        <div className="col-span-2">
          <span className="font-medium">Status:</span>
          <div className={`inline-flex items-center gap-1 ${isLoading ? 'text-blue-600' : 'text-green-600'}`}>
            {isLoading ? '⏳ Loading...' : '✅ Ready'}
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleManualRefresh}
        disabled={isLoading}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
      >
        Manual Refresh
      </button>
      
      <div className="mt-3 text-xs text-slate-500">
        Total people present: {pulseData.reduce((sum, zone) => sum + zone.count, 0)}
      </div>
    </div>
  );
};
