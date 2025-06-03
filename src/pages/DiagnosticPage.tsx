import React, { useState } from 'react';
import { simpleGoogleSheetsService } from '@/services/googleSheetsSimple';

const DiagnosticPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog('🔍 Starting diagnostic...');
      
      // Test environment variables
      const sheetId = import.meta.env.VITE_PULSE_SHEET_ID;
      addLog(`📋 Sheet ID: ${sheetId || 'NOT SET'}`);
      
      if (!sheetId) {
        addLog('❌ VITE_PULSE_SHEET_ID is not set!');
        return;
      }
      
      // Test direct CSV access
      addLog('🌐 Testing direct CSV access...');
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      addLog(`📡 URL: ${csvUrl}`);
      
      const response = await fetch(csvUrl);
      addLog(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        addLog(`❌ HTTP Error: ${response.status}`);
        return;
      }
      
      const csvText = await response.text();
      addLog(`📝 CSV received: ${csvText.length} characters`);
      addLog(`📄 First 200 chars: ${csvText.substring(0, 200)}`);
      
      // Test the service
      addLog('🔧 Testing GoogleSheetsService...');
      const data = await simpleGoogleSheetsService.getPulseData();
      addLog(`✅ Service returned ${data.length} items`);
      
      data.forEach((item, index) => {
        addLog(`📊 Item ${index + 1}: Zone="${item.zone}", Count=${item.count}, People="${item.people}"`);
      });
      
      if (data.length === 0) {
        addLog('⚠️ No data returned - check date filtering and parsing logic');
      }
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1000px' }}>
      <h1>🔍 Diagnostic Google Sheets</h1>
      
      <button 
        onClick={runDiagnostic}
        disabled={isRunning}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isRunning ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isRunning ? '⏳ Running...' : '🚀 Run Diagnostic'}
      </button>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '15px',
        height: '500px',
        overflowY: 'auto'
      }}>
        {logs.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Click "Run Diagnostic" to start testing...
          </p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              padding: '2px 0',
              borderBottom: '1px solid #eee'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiagnosticPage;
