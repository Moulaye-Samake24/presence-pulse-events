import React, { useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useDashboardData, useDashboardConnectionTest } from '../hooks/useDashboardData';

const DashboardTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { dashboardData, isLoading, error, refresh } = useDashboardData();
  const { isConnected, isTestingConnection, testConnection, connectionMethod } = useDashboardConnectionTest();

  const runConnectionTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('=== DÉBUT DU TEST DE CONNEXION DASHBOARD ===');
      const result = await dashboardService.testConnection();
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
    
    try {
      console.log('=== TENTATIVE DE RÉCUPÉRATION DES DONNÉES DASHBOARD ===');
      await refresh();
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMockData = () => {
    const mockData = dashboardService.getMockDashboardData();
    setTestResult({ success: true, mockData, message: 'Données de démonstration' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔗 Test du Service Dashboard</h1>
      
      <div style={{ backgroundColor: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📋 Configuration Requise</h2>
        <p><strong>Feuille Google Sheets requise :</strong> "dashboard"</p>
        <p><strong>Colonnes attendues :</strong> date, zone, capacity, count, people</p>
        <p><strong>ID de la feuille :</strong> {import.meta.env.VITE_PULSE_SHEET_ID || 'Non configuré'}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>🔧 Tests de Connexion</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={runConnectionTest}
            disabled={loading || isTestingConnection}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {loading || isTestingConnection ? 'Test en cours...' : 'Tester la Connexion'}
          </button>

          <button 
            onClick={fetchData}
            disabled={loading || isLoading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {loading || isLoading ? 'Chargement...' : 'Récupérer les Données'}
          </button>

          <button 
            onClick={showMockData}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ffc107', 
              color: 'black', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Données de Démonstration
          </button>
        </div>

        {/* Résultats de connexion automatique */}
        <div style={{ marginBottom: '15px' }}>
          <h3>État de la Connexion Automatique :</h3>
          <div style={{ 
            padding: '10px', 
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da', 
            border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <strong>Status:</strong> {isConnected ? '✅ Connecté' : '❌ Non connecté'}<br/>
            {connectionMethod && <span><strong>Méthode:</strong> {connectionMethod}</span>}
          </div>
        </div>

        {/* Résultats du test manuel */}
        {testResult && (
          <div style={{ marginTop: '15px' }}>
            <h3>Résultats du Test :</h3>
            <div style={{ 
              padding: '15px', 
              backgroundColor: testResult.success ? '#d4edda' : '#f8d7da', 
              border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}>
              <strong>Status:</strong> {testResult.success ? '✅ Succès' : '❌ Échec'}<br/>
              {testResult.method && <><strong>Méthode:</strong> {testResult.method}<br/></>}
              {testResult.error && <><strong>Erreur:</strong> {testResult.error}<br/></>}
              {testResult.message && <><strong>Message:</strong> {testResult.message}<br/></>}
              
              {testResult.mockData && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Données de démonstration :</strong>
                  <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                    {JSON.stringify(testResult.mockData.slice(0, 3), null, 2)}
                  </pre>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {testResult.mockData.length} entrée(s) de démonstration disponibles
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>📊 Données Récupérées via Hook</h2>
        
        {isLoading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div>⏳ Chargement des données...</div>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <strong>Erreur :</strong> {error.toString()}
          </div>
        )}

        {dashboardData && dashboardData.length > 0 && (
          <div>
            <h3>✅ Données Dashboard Récupérées :</h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '15px'
            }}>
              <div><strong>Nombre d'entrées :</strong> {dashboardData.length}</div>
              <div><strong>Dates disponibles :</strong> {[...new Set(dashboardData.map(d => d.date))].join(', ')}</div>
              <div><strong>Zones disponibles :</strong> {[...new Set(dashboardData.map(d => d.zone))].join(', ')}</div>
            </div>

            <h4>Aperçu des Données :</h4>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Zone</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Capacité</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Présents</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Personnes</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.zone}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.capacity}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.count}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '200px', overflow: 'hidden' }}>
                        {item.people.substring(0, 50)}{item.people.length > 50 ? '...' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dashboardData.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  ... et {dashboardData.length - 10} autres entrées
                </div>
              )}
            </div>
          </div>
        )}

        {dashboardData && dashboardData.length === 0 && !isLoading && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px'
          }}>
            📭 Aucune donnée disponible. Utilisez les données de démonstration ou vérifiez la connexion.
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>💡 Instructions</h2>
        <div style={{ backgroundColor: '#d1ecf1', padding: '15px', borderRadius: '8px' }}>
          <h3>Pour que la connexion fonctionne :</h3>
          <ol style={{ marginLeft: '20px' }}>
            <li>Créez une feuille Google Sheets nommée "dashboard"</li>
            <li>Ajoutez les colonnes : date, zone, capacity, count, people</li>
            <li>Partagez la feuille en lecture publique</li>
            <li>Ajoutez l'ID de la feuille dans VITE_PULSE_SHEET_ID</li>
            <li>Format date attendu : YYYY-MM-DD</li>
            <li>Les user_id dans la colonne people ne seront pas modifiés/parsés</li>
          </ol>
        </div>
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

export default DashboardTest;
