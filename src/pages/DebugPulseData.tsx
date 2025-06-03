import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { simpleGoogleSheetsService } from "@/services/googleSheetsSimple";

const DebugPulseData = () => {
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debugLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting debug load...');
      
      // Test direct CSV access
      const PULSE_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID;
      const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv`;
      
      console.log('📡 Fetching from:', csvUrl);
      
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      console.log('📋 Raw CSV data:', csvText);
      setRawData(csvText);
      
      // Parse with our service
      const parsed = await simpleGoogleSheetsService.getPulseData();
      console.log('🔧 Parsed data:', parsed);
      setParsedData(parsed);
      
    } catch (err) {
      console.error('❌ Debug error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugLoad();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Debug Pulse Data
            <Button onClick={debugLoad} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div>Chargement...</div>}
          {error && <div className="text-red-600">Erreur: {error}</div>}
          
          <div>
            <h3 className="font-bold mb-2">Variables d'environnement:</h3>
            <div className="bg-gray-100 p-2 rounded text-sm">
              <div>VITE_PULSE_SHEET_ID: {import.meta.env.VITE_PULSE_SHEET_ID || 'NON DÉFINI'}</div>
              <div>VITE_EMPLOYEES_SHEET_ID: {import.meta.env.VITE_EMPLOYEES_SHEET_ID || 'NON DÉFINI'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Données CSV brutes:</h3>
            <textarea 
              value={rawData} 
              readOnly 
              className="w-full h-40 text-xs font-mono border p-2"
              placeholder="Les données CSV apparaîtront ici..."
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Données parsées ({parsedData.length} zones):</h3>
            <div className="bg-gray-100 p-2 rounded text-sm">
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Date actuelle système:</h3>
            <div className="bg-gray-100 p-2 rounded text-sm">
              {new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPulseData;
