import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { usePulseData, useConnectionTest } from "../hooks/usePulseData";
import { googleSheetsService } from "../services/googleSheets";

const GoogleSheetsTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isManualTesting, setIsManualTesting] = useState(false);
  
  const { pulseData, isLoading, error, refresh } = usePulseData();
  const { isConnected, isTestingConnection, testConnection } = useConnectionTest();

  const runManualTest = async () => {
    setIsManualTesting(true);
    setTestResults(null);

    try {
      console.log('🔍 Début du test de connexion Google Sheets...');
      
      // Test 1: Variables d'environnement
      const envVars = {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        pulseSheetId: import.meta.env.VITE_PULSE_SHEET_ID,
        employeesSheetId: import.meta.env.VITE_EMPLOYEES_SHEET_ID,
      };

      console.log('📋 Variables d\'environnement:', envVars);

      // Test 2: Connexion au service
      const connectionResult = await googleSheetsService.testConnection();
      console.log('🔗 Test de connexion:', connectionResult);

      // Test 3: Récupération des données pulse
      let pulseTestData = null;
      let pulseError = null;
      try {
        pulseTestData = await googleSheetsService.getPulseData();
        console.log('📊 Données pulse récupérées:', pulseTestData);
      } catch (err) {
        pulseError = err;
        console.error('❌ Erreur récupération pulse:', err);
      }

      // Test 4: Données mock de démonstration
      const mockData = googleSheetsService.getMockPulseData();
      console.log('🎭 Données mock:', mockData);

      setTestResults({
        envVars,
        connectionResult,
        pulseTestData,
        pulseError,
        mockData,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsManualTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <Card className="border-2 border-black">
          <CardHeader className="bg-yellow-100 border-b-2 border-black">
            <CardTitle className="text-2xl font-bold text-black flex items-center space-x-2">
              <Wifi className="h-6 w-6" />
              <span>Test de Connexion Google Sheets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Statut de connexion automatique */}
            <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-black">Connexion Automatique</h3>
                  <p className="text-sm text-gray-600">
                    Test continu avec SWR (toutes les 10s)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Connecté
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    Déconnecté
                  </Badge>
                )}
                <Button
                  onClick={() => testConnection()}
                  disabled={isTestingConnection}
                  size="sm"
                  variant="outline"
                  className="border-2 border-black"
                >
                  {isTestingConnection ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Retester'
                  )}
                </Button>
              </div>
            </div>

            {/* Données en temps réel */}
            <Card className="border-2 border-gray-300">
              <CardHeader className="bg-gray-50 border-b-2 border-gray-300">
                <CardTitle className="text-lg font-bold">Données en Temps Réel</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                )}
                
                {error && (
                  <Alert className="border-red-300 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">
                      Erreur: {error.message}
                    </AlertDescription>
                  </Alert>
                )}

                {pulseData.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-600">
                      ✅ {pulseData.length} zone(s) récupérée(s) depuis Google Sheets
                    </p>
                    {pulseData.map((zone, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded border">
                        <strong>{zone.zone}</strong>: {zone.count}/{zone.capacity} 
                        {zone.people && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({zone.people})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => refresh()}
                    disabled={isLoading}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Actualiser les Données
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test manuel détaillé */}
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-blue-50 border-b-2 border-blue-300">
                <CardTitle className="text-lg font-bold">Test Manuel Détaillé</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  onClick={runManualTest}
                  disabled={isManualTesting}
                  className="mb-4 bg-blue-500 hover:bg-blue-600"
                >
                  {isManualTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    '🔍'
                  )}
                  {isManualTesting ? 'Test en cours...' : 'Lancer le Test Complet'}
                </Button>

                {testResults && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Test effectué le : {new Date(testResults.timestamp).toLocaleString('fr-FR')}
                    </div>

                    {testResults.error ? (
                      <Alert className="border-red-300 bg-red-50">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">
                          Erreur globale: {testResults.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {/* Variables d'environnement */}
                        <div className="p-3 bg-gray-100 rounded border">
                          <h4 className="font-semibold mb-2">📋 Variables d'environnement :</h4>
                          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(testResults.envVars, null, 2)}
                          </pre>
                        </div>

                        {/* Résultats des tests */}
                        <div className="p-3 bg-gray-100 rounded border">
                          <h4 className="font-semibold mb-2">🔗 Résultat connexion :</h4>
                          <div className={`text-sm ${testResults.connectionResult ? 'text-green-600' : 'text-red-600'}`}>
                            {testResults.connectionResult ? '✅ Connexion réussie' : '❌ Connexion échouée'}
                          </div>
                        </div>

                        {/* Données pulse */}
                        {testResults.pulseTestData && (
                          <div className="p-3 bg-gray-100 rounded border">
                            <h4 className="font-semibold mb-2">📊 Données Google Sheets :</h4>
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(testResults.pulseTestData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Erreur pulse */}
                        {testResults.pulseError && (
                          <div className="p-3 bg-red-50 rounded border border-red-300">
                            <h4 className="font-semibold mb-2 text-red-700">❌ Erreur données pulse :</h4>
                            <div className="text-sm text-red-600">
                              {testResults.pulseError.message || String(testResults.pulseError)}
                            </div>
                          </div>
                        )}

                        {/* Données mock */}
                        {testResults.mockData && (
                          <div className="p-3 bg-yellow-50 rounded border border-yellow-300">
                            <h4 className="font-semibold mb-2">🎭 Données de démonstration :</h4>
                            <div className="text-sm text-yellow-700">
                              {testResults.mockData.length} zone(s) de démonstration disponibles
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Alert className="border-blue-300 bg-blue-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pour que la connexion fonctionne :</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Créez une API key Google dans la Console Cloud</li>
                  <li>Activez l'API Google Sheets pour votre projet</li>
                  <li>Remplacez <code>YOUR_GOOGLE_API_KEY_HERE</code> par votre vraie API key</li>
                  <li>Partagez vos Google Sheets en lecture publique ou avec votre email</li>
                  <li>Vérifiez que les IDs des sheets sont corrects</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleSheetsTest;
