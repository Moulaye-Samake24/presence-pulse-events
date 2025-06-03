import { dashboardService, DashboardData } from './dashboardService';
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

// Interface simplifiée basée sur les données réelles du dashboard
export interface PresencePlanningData {
  date: string;
  zone: string;
  capacity: number;
  count: number;
  people: string;
}

class PlanningService {
  
  /**
   * Récupère directement les données dashboard sans transformation
   * Les données sont déjà parsées et prêtes à l'emploi
   */
  async getPlanningData(): Promise<PresencePlanningData[]> {
    try {
      console.log('Récupération des données de planification depuis le dashboard...');
      
      // Récupérer les données dashboard directement
      const dashboardData = await dashboardService.getDashboardData();
      
      if (!dashboardData || dashboardData.length === 0) {
        console.log('Aucune donnée dashboard disponible');
        return [];
      }

      console.log(`Données de planification récupérées: ${dashboardData.length} entrées`);
      
      // Les données dashboard correspondent exactement à notre interface PresencePlanningData
      // Aucune transformation nécessaire
      return dashboardData.map(item => ({
        date: item.date,
        zone: item.zone,
        capacity: item.capacity,
        count: item.count,
        people: item.people
      }));
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données de planification:', error);
      return [];
    }
  }

  /**
   * Filtre les données de planification par semaine
   */
  filterByWeek(data: PresencePlanningData[], weekStart: Date): PresencePlanningData[] {
    const weekEnd = endOfWeek(weekStart);
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
    
    return data.filter(item => item.date >= weekStartStr && item.date <= weekEndStr);
  }

  /**
   * Filtre les données par zone
   */
  filterByZone(data: PresencePlanningData[], zone: string | null): PresencePlanningData[] {
    if (!zone) return data;
    return data.filter(item => item.zone === zone);
  }

  /**
   * Filtre les données par date
   */
  filterByDate(data: PresencePlanningData[], date: Date): PresencePlanningData[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    return data.filter(item => item.date === dateStr);
  }

  /**
   * Obtient les statistiques de planification basées sur les données réelles
   */
  getStatistics(data: PresencePlanningData[]) {
    const totalEntries = data.length;
    const totalCapacity = data.reduce((sum, item) => sum + item.capacity, 0);
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    const zones = [...new Set(data.map(item => item.zone))];
    
    // Calculer le nombre d'utilisateurs uniques à partir des noms dans la colonne "people"
    const allPeople = data
      .map(item => dashboardService.parseAndCleanNames(item.people))
      .flat();
    const uniqueUsers = new Set(allPeople).size;
    
    return {
      totalEntries,
      totalCapacity,
      totalCount,
      uniqueUsers,
      zones: zones.length,
      zonesList: zones,
      occupancyRate: totalCapacity > 0 ? (totalCount / totalCapacity) * 100 : 0
    };
  }

  /**
   * Obtient la liste des personnes présentes pour une date et zone donnée
   */
  getPeopleForDateAndZone(data: PresencePlanningData[], date: string, zone: string): string[] {
    const entry = data.find(item => item.date === date && item.zone === zone);
    if (!entry || !entry.people) return [];
    
    return dashboardService.parseAndCleanNames(entry.people);
  }

  /**
   * Obtient les données groupées par zone pour une date donnée
   */
  getDataByZoneForDate(data: PresencePlanningData[], date: string) {
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    const dayData = data.filter(item => item.date === dateStr);
    
    return dayData.reduce((acc, item) => {
      if (!acc[item.zone]) {
        acc[item.zone] = {
          zone: item.zone,
          capacity: item.capacity,
          count: item.count,
          people: [],
          occupancy: 0
        };
      }
      
      acc[item.zone].people = dashboardService.parseAndCleanNames(item.people);
      acc[item.zone].occupancy = (item.count / item.capacity) * 100;
      
      return acc;
    }, {} as Record<string, any>);
  }
}

export const planningService = new PlanningService();
