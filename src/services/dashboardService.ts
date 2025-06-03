// Service pour la nouvelle feuille "dashboard" avec colonnes: date, zone, capacity, count, people
const DASHBOARD_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID; // Réutilise le même ID pour la feuille dashboard

// Interface pour les données du dashboard
export interface DashboardData {
  date: string;
  zone: string;
  capacity: number;
  count: number;
  people: string;
}

// Interface pour les données de présence (compatibilité avec l'existant)
export interface PulseData {
  zone: string;
  capacity: number;
  count: number;
  people: string;
  date?: string;
}

class DashboardService {
  
  // Méthode principale pour récupérer les données du dashboard
  async getDashboardData(): Promise<DashboardData[]> {
    console.log('=== Récupération des données dashboard ===');
    
    try {
      // Essayer d'abord l'accès direct CSV
      console.log('Méthode 1: Accès direct CSV...');
      return await this.getDashboardDataDirect();
    } catch (error) {
      console.log('Méthode 1 échouée:', error);
      
      try {
        console.log('Méthode 2: API publique...');
        return await this.getDashboardDataAPI();
      } catch (apiError) {
        console.error('Toutes les méthodes ont échoué:', apiError);
        console.log('Retour aux données de démonstration');
        return this.getMockDashboardData();
      }
    }
  }

  // Accès direct via URL publique CSV
  private async getDashboardDataDirect(): Promise<DashboardData[]> {
    try {
      if (!DASHBOARD_SHEET_ID) {
        throw new Error('DASHBOARD_SHEET_ID manquant dans les variables d\'environnement');
      }

      // URL publique CSV pour la feuille dashboard
      const csvUrl = `https://docs.google.com/spreadsheets/d/${DASHBOARD_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=dashboard`;
      
      console.log('Fetching dashboard data from:', csvUrl);
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV data received:', csvText.substring(0, 200) + '...');
      
      return this.parseCsvToDashboardData(csvText);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données dashboard:', error);
      throw error;
    }
  }

  // Via API Google Sheets publique
  private async getDashboardDataAPI(): Promise<DashboardData[]> {
    try {
      if (!DASHBOARD_SHEET_ID) {
        throw new Error('DASHBOARD_SHEET_ID manquant');
      }

      // URL API publique pour Google Sheets
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${DASHBOARD_SHEET_ID}/values/dashboard!A:E`;
      
      console.log('Fetching via public API:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      console.log('API data received:', rows);
      
      return this.parseRowsToDashboardData(rows);
      
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Parse CSV data
  private parseCsvToDashboardData(csvText: string): DashboardData[] {
    console.log('🔄 Parsing dashboard CSV data...');
    
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      console.log('❌ No data rows found');
      return [];
    }

    // Skip header line
    const dataLines = lines.slice(1);
    console.log(`📊 Found ${dataLines.length} data rows`);

    const results: DashboardData[] = [];
    
    dataLines.forEach((line, index) => {
      try {
        const values = this.parseSimpleCsvLine(line);
        console.log(`Row ${index + 1} parsed:`, values);
        
        if (values.length >= 5) {
          // Structure: date, zone, capacity, count, people
          const rawDate = this.cleanValue(values[0]);
          const date = this.convertExcelDateToISO(rawDate); // Convertir les dates Excel
          const zone = this.cleanValue(values[1]);
          const capacity = parseInt(this.cleanValue(values[2])) || 0;
          const count = parseInt(this.cleanValue(values[3])) || 0;
          const people = this.cleanValue(values[4]);
          
          console.log(`Processing: rawDate="${rawDate}", date="${date}", zone="${zone}", capacity=${capacity}, count=${count}, people="${people}"`);
          
          results.push({
            date,
            zone,
            capacity,
            count,
            people
          });
        } else {
          console.log(`⚠️ Row ${index + 1} skipped: insufficient columns (${values.length})`);
        }
      } catch (error) {
        console.error(`❌ Error processing row ${index + 1}:`, error);
      }
    });
    
    console.log('🎯 Final parsed dashboard data:', results);
    return results;
  }

  // Parse rows from API response
  private parseRowsToDashboardData(rows: string[][]): DashboardData[] {
    const data: DashboardData[] = [];
    
    // Skip header if present
    const startIndex = rows[0] && rows[0][0]?.toLowerCase().includes('date') ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 5) {
        const rawDate = row[0] || '';
        const date = this.convertExcelDateToISO(rawDate);
        
        data.push({
          date,
          zone: row[1] || '',
          capacity: parseInt(row[2]) || 0,
          count: parseInt(row[3]) || 0,
          people: row[4] || ''
        });
      }
    }
    
    return data;
  }

  // Simple CSV line parser
  private parseSimpleCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Clean CSV values
  // Convertir un numéro de série Excel/Google Sheets en date
  private convertExcelDateToISO(excelDate: string): string {
    const dateNum = parseFloat(excelDate);
    
    // Si ce n'est pas un nombre, retourner tel quel
    if (isNaN(dateNum)) {
      return excelDate;
    }
    
    // Excel/Google Sheets utilise le 1er janvier 1900 comme point de départ (numéro de série 1)
    // Mais il y a une erreur de calcul historique : le jour 60 (29 février 1900) n'existe pas
    const baseDate = new Date(1899, 11, 30); // 30 décembre 1899
    const resultDate = new Date(baseDate.getTime() + (dateNum * 24 * 60 * 60 * 1000));
    
    return resultDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  private cleanValue(value: string): string {
    return value.replace(/^"(.*)"$/, '$1').trim();
  }

  // Filtrer les données pour aujourd'hui - compatible avec le format existant
  getTodayData(dashboardData: DashboardData[]): PulseData[] {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    return dashboardData
      .filter(item => item.date === today || item.date === this.formatDateForComparison(new Date()))
      .map(item => ({
        zone: item.zone,
        capacity: item.capacity,
        count: item.count,
        people: item.people,
        date: item.date
      }));
  }

  // Obtenir les données pour une date spécifique
  getDataForDate(dashboardData: DashboardData[], date: string): PulseData[] {
    return dashboardData
      .filter(item => item.date === date)
      .map(item => ({
        zone: item.zone,
        capacity: item.capacity,
        count: item.count,
        people: item.people,
        date: item.date
      }));
  }

  // Obtenir toutes les dates disponibles
  getAvailableDates(dashboardData: DashboardData[]): string[] {
    const dates = [...new Set(dashboardData.map(item => item.date))];
    return dates.sort();
  }

  // Obtenir les données pour une semaine
  getWeekData(dashboardData: DashboardData[], startDate: string): DashboardData[] {
    const start = new Date(startDate);
    const weekData: DashboardData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayData = dashboardData.filter(item => item.date === dateStr);
      weekData.push(...dayData);
    }
    
    return weekData;
  }

  // Formater la date pour comparaison
  private formatDateForComparison(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Utilitaire pour parser et nettoyer les noms de personnes (sans modification du user_id)
  parseAndCleanNames(peopleString: string): string[] {
    if (!peopleString || typeof peopleString !== 'string') {
      return [];
    }

    // Split par les délimiteurs communs et nettoie
    return peopleString
      .split(/[;,\n\r]/)
      .map(name => name.trim())
      .filter(name => name.length > 0)
      // Ne PAS parser les user_id - les garder tels quels
      .filter(name => name !== '' && name !== 'undefined' && name !== 'null');
  }

  // Données de démonstration
  getMockDashboardData(): DashboardData[] {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return [
      // Données d'aujourd'hui
      {
        date: today,
        zone: "Revenue Flex",
        capacity: 18,
        count: 3,
        people: "emma.wilson@company.com; noah.parker@company.com; alice.thompson@company.com"
      },
      {
        date: today,
        zone: "Design Studio",
        capacity: 12,
        count: 5,
        people: "sophie.lambert@company.com; marc.dubois@company.com; julie.bernard@company.com; tom.kelly@company.com; lisa.martin@company.com"
      },
      {
        date: today,
        zone: "Tech Hub",
        capacity: 25,
        count: 8,
        people: "guillaume.deramchi@company.com; marie.claire@company.com; pierre.laurent@company.com; anna.smith@company.com; david.martin@company.com; laura.ferry@company.com; nicolas.brown@company.com; elena.volkov@company.com"
      },
      {
        date: today,
        zone: "Meeting Rooms",
        capacity: 8,
        count: 2,
        people: "caroline.robert@company.com; vincent.henry@company.com"
      },
      // Données de demain
      {
        date: tomorrowStr,
        zone: "Revenue Flex",
        capacity: 18,
        count: 5,
        people: "emma.wilson@company.com; noah.parker@company.com; alice.thompson@company.com; john.doe@company.com; jane.smith@company.com"
      },
      {
        date: tomorrowStr,
        zone: "Design Studio",
        capacity: 12,
        count: 7,
        people: "sophie.lambert@company.com; marc.dubois@company.com; julie.bernard@company.com; tom.kelly@company.com; lisa.martin@company.com; alex.rodriguez@company.com; sarah.johnson@company.com"
      },
      {
        date: tomorrowStr,
        zone: "Tech Hub",
        capacity: 25,
        count: 12,
        people: "guillaume.deramchi@company.com; marie.claire@company.com; pierre.laurent@company.com; anna.smith@company.com; david.martin@company.com; laura.ferry@company.com; nicolas.brown@company.com; elena.volkov@company.com; paul.rodriguez@company.com; clara.henderson@company.com; jean.taylor@company.com; amelie.garcia@company.com"
      }
    ];
  }

  // Test de connexion
  async testConnection(): Promise<{ success: boolean; method?: string; error?: string }> {
    try {
      console.log('=== Test de connexion Dashboard ===');
      
      // Test méthode CSV
      try {
        await this.getDashboardDataDirect();
        return { success: true, method: 'CSV direct dashboard' };
      } catch (csvError) {
        console.log('CSV direct failed:', csvError);
      }

      // Test méthode API
      try {
        await this.getDashboardDataAPI();
        return { success: true, method: 'API publique dashboard' };
      } catch (apiError) {
        console.log('API publique failed:', apiError);
      }

      return { 
        success: false, 
        error: 'Aucune méthode d\'accès dashboard n\'a fonctionné. Vérifiez que la feuille est publique.' 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `Erreur de test: ${error}` 
      };
    }
  }
}

// Instance singleton
export const dashboardService = new DashboardService();
