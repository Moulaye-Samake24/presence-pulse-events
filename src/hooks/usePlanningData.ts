import { useState, useEffect } from 'react';
import { planningService, PresencePlanningData } from '../services/planningService';

export function usePlanningData() {
  const [planningData, setPlanningData] = useState<PresencePlanningData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchPlanningData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Récupération des données de planification...');
      
      const data = await planningService.getPlanningData();
      setPlanningData(data);
      setLastRefresh(new Date());
      
      console.log('✅ Données de planification récupérées:', data.length, 'entrées');
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des données de planification:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanningData();
  }, []);

  const refresh = () => {
    fetchPlanningData();
  };

  return {
    planningData,
    isLoading,
    error,
    lastRefresh,
    refresh,
  };
}

export function usePlanningStatistics(data: PresencePlanningData[]) {
  return planningService.getStatistics(data);
}

export function usePlanningFilters() {
  return {
    filterByWeek: planningService.filterByWeek.bind(planningService),
    filterByZone: planningService.filterByZone.bind(planningService),
    filterByDate: planningService.filterByDate.bind(planningService),
  };
}
