import useSWR from 'swr';
import { simpleGoogleSheetsService, PulseData, Employee } from '../services/googleSheetsSimple';
import { dataMonitor } from '../utils/dataMonitor';

// Hook pour récupérer les données de présence avec polling toutes les 10 secondes
export function usePulseData() {
  const { data, error, isLoading, mutate } = useSWR<PulseData[]>(
    'pulse-data',
    async () => {
      try {
        const result = await simpleGoogleSheetsService.getPulseData();
        dataMonitor.trackUpdate({ source: 'live', data: result });
        return result;
      } catch (error) {
        console.warn('Fallback to mock data due to error:', error);
        // En cas d'erreur, utiliser des données de démonstration
        const mockData = simpleGoogleSheetsService.getMockPulseData();
        dataMonitor.trackUpdate({ source: 'mock', data: mockData, error: error.toString() });
        return mockData;
      }
    },
    {
      refreshInterval: 10000, // Polling toutes les 10 secondes
      dedupingInterval: 5000, // Évite les requêtes redondantes
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    pulseData: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook pour récupérer les données employés (moins fréquent)
export function useEmployeesData() {
  const { data, error, isLoading, mutate } = useSWR<Employee[]>(
    'employees-data',
    () => simpleGoogleSheetsService.getEmployeesData(),
    {
      refreshInterval: 60000, // Polling toutes les minutes
      dedupingInterval: 30000,
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  );

  return {
    employees: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook pour tester la connexion Google Sheets
export function useConnectionTest() {
  const { data, error, isLoading, mutate } = useSWR(
    'connection-test',
    () => simpleGoogleSheetsService.testConnection(),
    {
      refreshInterval: 0, // Pas de polling automatique
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    isConnected: data?.success || false,
    connectionError: error || (data?.success === false ? new Error(data.error) : null),
    isTestingConnection: isLoading,
    testConnection: mutate,
  };
}
