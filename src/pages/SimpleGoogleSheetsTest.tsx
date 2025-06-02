import React, { useState } from 'react';
import { simpleGoogleSheetsService } from '../services/googleSheetsSimple';

const SimpleGoogleSheetsTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pulseData, setPulseData] = useState<any>(null);

  const runConnectionTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('=== DÉBUT DU TEST DE CONNEXION ===');
      const result = await simpleGoogleSheetsService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: `Erreur de test: ${error}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setPulseData(null);
    
    try {
      console.log('=== TENTATIVE DE RÉCUPÉRATION DES DONNÉES ===');
      const data = await simpleGoogleSheetsService.getPulseData();
      setPulseData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      setPulseData({ error: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const showMockData = () => {
    const mockData = simpleGoogleSheetsService.getMockPulseData();
    setPulseData(mockData);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔗 Test de Connexion Google Sheets (Simplifié)</h1>
      
      <div style={{ backgroundColor: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📋 Configuration Requise</h2>
        <p><strong>Variables d'environnement nécessaires :</strong></p>
        <ul>
          <li><code>VITE_PULSE_SHEET_ID</code> = ID de votre Google Sheets</li>
        </ul>
        
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
          <h3>🔑 Valeurs actuelles :</h3>
          <p>PULSE_SHEET_ID: <code>{import.meta.env.VITE_PULSE_SHEET_ID || '❌ Non défini'}</code></p>
        </div>
      </div>

      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📝 Instructions pour Feuille Publique</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          {simpleGoogleSheetsService.getPublicSharingInstructions()}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🧪 Tests de Connexion</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={runConnectionTest}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Test en cours...' : '🔧 Tester la Connexion'}
          </button>

          <button 
            onClick={fetchData}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Chargement...' : '📊 Récupérer les Données'}
          </button>

          <button 
            onClick={showMockData}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#FF9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 Données de Démonstration
          </button>
        </div>

        {testResult && (
          <div style={{ 
            backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <h3>🔍 Résultat du Test de Connexion</h3>
            <p><strong>Statut:</strong> {testResult.success ? '✅ Succès' : '❌ Échec'}</p>
            {testResult.method && <p><strong>Méthode:</strong> {testResult.method}</p>}
            {testResult.error && <p><strong>Erreur:</strong> {testResult.error}</p>}
          </div>
        )}

        {pulseData && (
          <div style={{ 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            padding: '15px', 
            borderRadius: '4px' 
          }}>
            <h3>📊 Données Récupérées</h3>
            {pulseData.error ? (
              <div style={{ color: 'red' }}>
                <p><strong>Erreur:</strong> {pulseData.error}</p>
              </div>
            ) : (
              <div>
                <p><strong>Nombre d'enregistrements:</strong> {pulseData.length}</p>
                <pre style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(pulseData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h2>💡 Informations de Débogage</h2>
        <p>Ouvrez la console du navigateur (F12) pour voir les logs détaillés des tentatives de connexion.</p>
        <p>Les méthodes essayées :</p>
        <ol>
          <li><strong>CSV Direct:</strong> Accès via URL publique CSV (recommandé)</li>
          <li><strong>API Publique:</strong> Via l'API Google Sheets sans authentification</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Retour au Dashboard
        </button>
      </div>
    </div>
  );
};

export default SimpleGoogleSheetsTest;
