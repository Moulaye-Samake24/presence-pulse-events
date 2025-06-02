import React, { useState, useEffect } from 'react';
import { dataMonitor } from '../utils/dataMonitor';

interface DataSourceStatusProps {
  className?: string;
}

export const DataSourceStatus: React.FC<DataSourceStatusProps> = ({ className = "" }) => {
  const [status, setStatus] = useState<{
    source: 'live' | 'mock' | 'unknown';
    lastUpdate: Date | null;
    updateCount: number;
    error?: string;
  }>({
    source: 'unknown',
    lastUpdate: null,
    updateCount: 0
  });

  useEffect(() => {
    const listener = (data: any, isChange: boolean) => {
      setStatus(prev => ({
        source: data.source || 'unknown',
        lastUpdate: new Date(),
        updateCount: dataMonitor.getUpdateCount(),
        error: data.error
      }));
    };

    dataMonitor.addListener(listener);

    // Also check initial state
    setStatus(prev => ({
      ...prev,
      updateCount: dataMonitor.getUpdateCount()
    }));

    return () => {
      // Note: In a real app, we'd want to remove the listener
      // but our simple monitor doesn't have removeListener
    };
  }, []);

  const getStatusColor = () => {
    switch (status.source) {
      case 'live': return 'text-green-600 bg-green-50 border-green-200';
      case 'mock': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.source) {
      case 'live': return '🔗';
      case 'mock': return '📋';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (status.source) {
      case 'live': return 'Live Data Connected';
      case 'mock': return 'Using Demo Data';
      default: return 'Checking Connection...';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor()} ${className}`}>
      <span className="text-base">{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {status.lastUpdate && (
        <span className="text-xs opacity-75">
          • Last update: {status.lastUpdate.toLocaleTimeString()}
        </span>
      )}
      {status.updateCount > 0 && (
        <span className="text-xs opacity-75">
          • {status.updateCount} updates
        </span>
      )}
      {status.error && (
        <span className="text-xs opacity-75" title={status.error}>
          • Error occurred
        </span>
      )}
    </div>
  );
};
