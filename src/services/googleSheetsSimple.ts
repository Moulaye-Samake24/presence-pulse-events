
// Configuration simple - juste les IDs des sheets
const PULSE_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID;
const EMPLOYEES_SHEET_ID = import.meta.env.VITE_EMPLOYEES_SHEET_ID;

// Interface pour les données de présence
export interface PulseData {
  zone: string;
  capacity: number;
  count: number;
  people: string;
}

export interface Employee {
  nom: string;
  poste: string;
  equipe: string;
  manager: string;
  ville: string;
  pays: string;
  centreInteret: string;
  projetEnCours: string;
  moodSemaine: string;
}

class SimpleGoogleSheetsService {

  // Méthode 1: Accès direct via URL publique CSV (le plus simple)
  async getPulseDataDirect(): Promise<PulseData[]> {
    try {
      if (!PULSE_SHEET_ID) {
        throw new Error('PULSE_SHEET_ID manquant dans les variables d\'environnement');
      }

      // URL publique CSV pour Google Sheets
      const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=pulse_today`;
      
      console.log('Fetching data from public sheet:', csvUrl);
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV data received:', csvText.substring(0, 200) + '...');
      
      return this.parseCsvToPulseData(csvText);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }

  // Méthode 2: Via API Google Sheets publique (sans clé API)
  async getPulseDataAPI(): Promise<PulseData[]> {
    try {
      if (!PULSE_SHEET_ID) {
        throw new Error('PULSE_SHEET_ID manquant');
      }

      // URL API publique pour Google Sheets
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${PULSE_SHEET_ID}/values/pulse_today!A:D`;
      
      console.log('Fetching via public API:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      console.log('API data received:', rows);
      
      return this.parseRowsToPulseData(rows);
      
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Méthode principale qui essaie les différentes approches
  async getPulseData(): Promise<PulseData[]> {
    console.log('=== Tentative de récupération des données Google Sheets ===');
    
    try {
      // Essayer d'abord l'accès direct CSV (plus fiable pour feuilles publiques)
      console.log('Méthode 1: Accès direct CSV...');
      return await this.getPulseDataDirect();
    } catch (error) {
      console.log('Méthode 1 échouée:', error);
      
      try {
        console.log('Méthode 2: API publique...');
        return await this.getPulseDataAPI();
      } catch (apiError) {
        console.error('Toutes les méthodes ont échoué:', apiError);
        console.log('Retour aux données de démonstration');
        throw new Error('Impossible de récupérer les données des feuilles. Vérifiez que la feuille est publique.');
      }
    }
  }

  // Parse CSV data
  private parseCsvToPulseData(csvText: string): PulseData[] {
    const lines = csvText.trim().split('\n');
    const data: PulseData[] = [];
    
    console.log('Parsing CSV lines:', lines.length);
    
    // Skip header if present
    const startIndex = lines[0] && lines[0].toLowerCase().includes('zone') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Handle CSV parsing with potential commas in quoted fields
      const values = this.parseCSVLine(line);
      
      if (values.length >= 4) {
        const pulseData = {
          zone: this.cleanValue(values[0]),
          capacity: parseInt(this.cleanValue(values[1])) || 0,
          count: parseInt(this.cleanValue(values[2])) || 0,
          people: this.cleanValue(values[3])
        };
        
        console.log('Parsed row:', pulseData);
        data.push(pulseData);
      }
    }
    
    console.log('Final parsed data:', data);
    return data;
  }

  // Parse rows from API response  
  private parseRowsToPulseData(rows: string[][]): PulseData[] {
    const data: PulseData[] = [];
    
    // Skip header if present
    const startIndex = rows[0] && rows[0][0]?.toLowerCase().includes('zone') ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 4) {
        data.push({
          zone: row[0] || '',
          capacity: parseInt(row[1]) || 0,
          count: parseInt(row[2]) || 0,
          people: row[3] || ''
        });
      }
    }
    
    return data;
  }

  // Simple CSV line parser
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Clean CSV values (remove quotes, trim)
  private cleanValue(value: string): string {
    return value.replace(/^"(.*)"$/, '$1').trim();
  }

  // Récupère les données employés (similaire à pulse data)
  async getEmployeesData(): Promise<Employee[]> {
    try {
      if (!EMPLOYEES_SHEET_ID) {
        console.warn('EMPLOYEES_SHEET_ID non configuré, retour données vides');
        return [];
      }

      // URL publique CSV pour la feuille employés
      const csvUrl = `https://docs.google.com/spreadsheets/d/${EMPLOYEES_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
      
      console.log('Fetching employees data from:', csvUrl);
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const csvText = await response.text();
      return this.parseCsvToEmployeesData(csvText);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données employés:', error);
      return []; // Retourne un tableau vide plutôt que de lever une erreur
    }
  }

  // Parse CSV data pour les employés
  private parseCsvToEmployeesData(csvText: string): Employee[] {
    const lines = csvText.trim().split('\n');
    const data: Employee[] = [];
    
    // Skip header if present
    const startIndex = lines[0] && lines[0].toLowerCase().includes('nom') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = this.parseCSVLine(line);
      
      if (values.length >= 9) {
        data.push({
          nom: this.cleanValue(values[0]),
          poste: this.cleanValue(values[1]),
          equipe: this.cleanValue(values[2]),
          manager: this.cleanValue(values[3]),
          ville: this.cleanValue(values[4]),
          pays: this.cleanValue(values[5]),
          centreInteret: this.cleanValue(values[6]),
          projetEnCours: this.cleanValue(values[7]),
          moodSemaine: this.cleanValue(values[8])
        });
      }
    }
    
    return data;
  }

  // Utilitaire pour parser et nettoyer les noms de personnes
  parseAndCleanNames(peopleString: string): string[] {
    if (!peopleString || typeof peopleString !== 'string') return [];
    
    // Nettoyer et séparer par différents délimiteurs possibles
    return peopleString
      .split(/[;,\n]/) // Séparer par ; ou , ou nouvelles lignes
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => {
        // Nettoyer les caractères indésirables et normaliser
        return name
          .replace(/^[-•\s]+/, '') // Supprimer tirets et puces en début
          .replace(/\s+/g, ' ') // Normaliser les espaces
          .trim();
      })
      .filter(name => name.length > 1); // Garder seulement les noms valides
  }

  // Méthode pour obtenir des statistiques sur les personnes
  getPeopleStats(pulseData: PulseData[]): {
    totalPeople: number;
    peopleByZone: { [zone: string]: string[] };
    allNames: string[];
  } {
    const peopleByZone: { [zone: string]: string[] } = {};
    const allNames: string[] = [];
    
    pulseData.forEach(zone => {
      const names = this.parseAndCleanNames(zone.people);
      peopleByZone[zone.zone] = names;
      allNames.push(...names);
    });
    
    return {
      totalPeople: allNames.length,
      peopleByZone,
      allNames: [...new Set(allNames)].sort() // Unique et trié
    };
  }

  // Teste la connexion aux sheets
  async testConnection(): Promise<{ success: boolean; method?: string; error?: string }> {
    try {
      console.log('=== Test de connexion Google Sheets ===');
      
      // Test méthode CSV
      try {
        await this.getPulseDataDirect();
        return { success: true, method: 'CSV direct' };
      } catch (csvError) {
        console.log('CSV direct failed:', csvError);
      }

      // Test méthode API
      try {
        await this.getPulseDataAPI();
        return { success: true, method: 'API publique' };
      } catch (apiError) {
        console.log('API publique failed:', apiError);
      }

      return { 
        success: false, 
        error: 'Aucune méthode d\'accès n\'a fonctionné. Vérifiez que la feuille est publique.' 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `Erreur de test: ${error}` 
      };
    }
  }

  // Méthode pour données de démonstration
  getMockPulseData(): PulseData[] {
    return [
      {
        zone: "Revenue Flex",
        capacity: 18,
        count: 3,
        people: "Emma W.; Noah P.; Alice T."
      },
      {
        zone: "Design Studio",
        capacity: 12,
        count: 8,
        people: "Sophie L.; Marc D.; Julie B.; Tom K.; Lisa M.; Alex R.; Sarah J.; Chris P."
      },
      {
        zone: "Tech Hub",
        capacity: 25,
        count: 15,
        people: "Guillaume D.; Marie C.; Pierre L.; Anna S.; David M.; Laura F.; Nicolas B.; Elena V.; Paul R.; Clara H.; Jean T.; Amélie G.; Lucas M.; Jade W.; Theo P."
      },
      {
        zone: "Meeting Rooms",
        capacity: 8,
        count: 2,
        people: "Caroline R.; Vincent H."
      }
    ];
  }

  // Instructions pour rendre la feuille publique
  getPublicSharingInstructions(): string {
    return `
Pour rendre votre Google Sheets accessible publiquement :

1. Ouvrez votre Google Sheets
2. Cliquez sur "Partager" (bouton bleu en haut à droite)
3. Cliquez sur "Modifier" à côté de "Accès limité"
4. Sélectionnez "Toute personne ayant le lien"
5. Assurez-vous que "Lecteur" est sélectionné
6. Cliquez sur "Terminé"
7. Copiez l'ID de la feuille depuis l'URL (entre /d/ et /edit)

Exemple d'URL: https://docs.google.com/spreadsheets/d/VOTRE_SHEET_ID/edit
L'ID est la partie VOTRE_SHEET_ID

Ajoutez cet ID dans votre fichier .env.local :
VITE_PULSE_SHEET_ID=VOTRE_SHEET_ID
    `;
  }
}

// Instance singleton
export const simpleGoogleSheetsService = new SimpleGoogleSheetsService();
