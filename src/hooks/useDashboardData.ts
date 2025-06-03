import useSWR from 'swr';
import { dashboardService, DashboardData, PulseData } from '../services/dashboardService';

// Hook pour récupérer les données du dashboard avec polling
export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData[]>(
    'dashboard-data',
    async () => {
      try {
        return await dashboardService.getDashboardData();
      } catch (error) {
        console.warn('Fallback to mock data due to error:', error);
        // En cas d'erreur, utiliser des données de démonstration
        return dashboardService.getMockDashboardData();
      }
    },
    {
      refreshInterval: 30000, // Polling toutes les 30 secondes
      dedupingInterval: 15000, // Évite les requêtes redondantes
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    dashboardData: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook pour récupérer les données d'aujourd'hui (compatible avec l'existant)
export function useTodayPulseData() {
  const { dashboardData, isLoading, error, refresh } = useDashboardData();
  
  const todayData = dashboardData.length > 0 
    ? dashboardService.getTodayData(dashboardData)
    : [];

  return {
    pulseData: todayData,
    isLoading,
    error,
    refresh,
  };
}

// Hook pour récupérer les données d'une date spécifique
export function useDatePulseData(date: string) {
  const { dashboardData, isLoading, error, refresh } = useDashboardData();
  
  const dateData = dashboardData.length > 0 && date
    ? dashboardService.getDataForDate(dashboardData, date)
    : [];

  return {
    pulseData: dateData,
    isLoading,
    error,
    refresh,
  };
}

// Hook pour récupérer les données d'une semaine
export function useWeekData(startDate: string) {
  const { dashboardData, isLoading, error, refresh } = useDashboardData();
  
  const weekData = dashboardData.length > 0 && startDate
    ? dashboardService.getWeekData(dashboardData, startDate)
    : [];

  return {
    weekData,
    isLoading,
    error,
    refresh,
  };
}

// Hook pour obtenir les dates disponibles
export function useAvailableDates() {
  const { dashboardData, isLoading, error } = useDashboardData();
  
  const availableDates = dashboardData.length > 0
    ? dashboardService.getAvailableDates(dashboardData)
    : [];

  return {
    availableDates,
    isLoading,
    error,
  };
}

// Hook pour tester la connexion dashboard
export function useDashboardConnectionTest() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-connection-test',
    () => dashboardService.testConnection(),
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
    connectionMethod: data?.method,
  };
}
