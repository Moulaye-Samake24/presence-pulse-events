import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simpleGoogleSheetsService } from "@/services/googleSheetsSimple";

const QuickTest = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawCsv, setRawCsv] = useState<string>('');

  const testDirect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('=== QUICK TEST STARTED ===');
      
      // Test direct CSV access first
      const PULSE_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID;
      const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv`;
      
      console.log('Fetching from:', csvUrl);
      
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      console.log('Raw CSV received:', csvText);
      setRawCsv(csvText);
      
      // Now test the service
      const parsedData = await simpleGoogleSheetsService.getPulseData();
      console.log('Parsed data:', parsedData);
      
      setData(parsedData);
      
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Google Sheets Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDirect} disabled={loading}>
            {loading ? 'Testing...' : 'Test Google Sheets Connection'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 rounded">
              <h4 className="font-bold text-red-700">Error:</h4>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {rawCsv && (
            <div className="p-4 bg-gray-100 border rounded">
              <h4 className="font-bold mb-2">Raw CSV Data:</h4>
              <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                {rawCsv}
              </pre>
            </div>
          )}
          
          {data.length > 0 && (
            <div className="p-4 bg-green-100 border border-green-400 rounded">
              <h4 className="font-bold text-green-700 mb-2">Parsed Data ({data.length} zones):</h4>
              {data.map((item, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded border">
                  <div><strong>Zone:</strong> {item.zone}</div>
                  <div><strong>Count:</strong> {item.count} / {item.capacity}</div>
                  <div><strong>People:</strong> {item.people || 'None'}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Sheet ID:</strong> {import.meta.env.VITE_PULSE_SHEET_ID}</p>
            <p><strong>Current Date:</strong> {new Date().toISOString().split('T')[0]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickTest;
