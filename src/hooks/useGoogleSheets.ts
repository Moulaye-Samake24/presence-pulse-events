import useSWR from 'swr';
import { googleSheetsService, PulseData, Employee } from '../services/googleSheets';

// Hook pour récupérer les données de présence avec polling toutes les 10 secondes
export function usePulseData() {
  const { data, error, isLoading, mutate } = useSWR<PulseData[]>(
    'pulse-data',
    async () => {
      try {
        return await googleSheetsService.getPulseData();
      } catch (error) {
        console.warn('Fallback to mock data due to error:', error);
        // En cas d'erreur, utiliser des données de démonstration
        return googleSheetsService.getMockPulseData();
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
    () => googleSheetsService.getEmployeesData(),
    {
      refreshInterval: 60000, // Polling toutes les minutes
      dedupingInterval: 30000,
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  );

  return {
    employeesData: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook pour tester la connexion Google Sheets
export function useConnectionTest() {
  const { data, error, isLoading, mutate } = useSWR(
    'connection-test',
    () => googleSheetsService.testConnection(),
    {
      refreshInterval: 0, // Pas de polling automatique
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    isConnected: data || false,
    connectionError: error,
    isTestingConnection: isLoading,
    testConnection: mutate,
  };
}
    {
      refreshInterval: 60000, // Refresh toutes les minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    employees: data || [],
    isLoading,
    error,
  };
};

// Hook pour tester la connexion Google Sheets
export const useConnectionTest = () => {
  const { data, error, isLoading } = useSWR<boolean>(
    'connection-test',
    () => googleSheetsService.testConnection(),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    isConnected: data || false,
    isLoading,
    error,
  };
};
