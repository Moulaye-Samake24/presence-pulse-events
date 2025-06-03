import { mockPulseData } from "@/data/mockData";

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

      // URL publique CSV pour Google Sheets - essayons d'abord sans nom de feuille spécifique
      const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv`;
      // Alternative avec nom de feuille si disponible
      // const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=pulse_today`;
      
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
    console.log('🔄 Parsing CSV data...');
    console.log('Raw CSV text:', csvText.substring(0, 500));
    
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      console.log('❌ No data rows found');
      return [];
    }

    // Skip header line
    const dataLines = lines.slice(1);
    console.log(`📊 Found ${dataLines.length} data rows`);

    // Group data by zone and date to aggregate people
    const zoneGroups: { [key: string]: { people: Set<string>, date: string } } = {};
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
    
    console.log(`📅 Today: ${today}, Yesterday: ${yesterday}`);
    
    dataLines.forEach((line, index) => {
      try {
        const values = this.parseSimpleCsvLine(line);
        console.log(`Row ${index + 1} parsed:`, values);
        
        if (values.length >= 5) {
          // Structure: timestamp, user_email, user_id, date, zone_id, tag, source, sent_flag
          const user_id = values[2] || '';  // This contains the person's name/slack handle
          const date = values[3] || '';
          const zone_id_raw = values[4]?.trim() || '';  // Remove potential leading space
          const zone_id = this.normalizeZoneName(zone_id_raw); // Normalize zone name
          
          console.log(`Processing: user_id="${user_id}", date="${date}", zone_id_raw="${zone_id_raw}" -> zone_id="${zone_id}"`);
          
          // Only process if we have the essential data
          console.log(`📊 Row ${index + 1} - Checking dates: row="${date}", today="${today}", yesterday="${yesterday}"`);
          
          if (user_id && zone_id) {
            // Accept data from today, yesterday, or the test date for more flexibility
            const isValidDate = date === today || 
                               date === yesterday || 
                               date === '2025-06-03' ||
                               date.includes('2025-06'); // Also accept any June 2025 date for testing
            
            console.log(`✅ Date validation: isValidDate=${isValidDate} for date="${date}"`);
            
            if (isValidDate) {
              const cleanedName = this.parseAndCleanNames(user_id);
              
              if (!zoneGroups[zone_id]) {
                zoneGroups[zone_id] = { people: new Set(), date };
                console.log(`🏢 Created new zone group: "${zone_id}"`);
              }
              
              if (cleanedName.length > 0) {
                cleanedName.forEach(name => {
                  zoneGroups[zone_id].people.add(name);
                  console.log(`✅ Added "${name}" to zone "${zone_id}"`);
                });
              } else {
                console.log(`⚠️ No clean names extracted from "${user_id}"`);
              }
            } else {
              console.log(`❌ Date "${date}" not accepted for row with zone "${zone_id}"`);
            }
          } else {
            console.log(`❌ Missing essential data: user_id="${user_id}", zone_id="${zone_id}"`);
          }
        } else {
          console.log(`⚠️ Row ${index + 1} skipped: insufficient columns (${values.length})`);
        }
      } catch (error) {
        console.error(`❌ Error processing row ${index + 1}:`, error);
      }
    });

    // Convert grouped data to PulseData format
    const results: PulseData[] = Object.entries(zoneGroups).map(([zone, data]) => {
      const peopleArray = Array.from(data.people);
      return {
        zone: zone,
        capacity: this.getZoneCapacity(zone), // Get capacity based on zone
        count: peopleArray.length,
        people: peopleArray.join('; ')
      };
    });

    console.log('🎯 Final parsed data:', results);
    
    // If no data found, add some mock data for testing (only in development)
    if (results.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('📊 No real data found, using mock data for development');
      return mockPulseData;
    }
    
    return results;
  }

  // Simple CSV line parser that handles quoted fields properly
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

  // Normalize zone names to handle different naming conventions
  private normalizeZoneName(zoneName: string): string {
    const zoneMap: { [key: string]: string } = {
      "jeremy's office": "Z-JerO",
      "Jeremy's office": "Z-JerO", 
      "Jeremy's Office": "Z-JerO",
      "takodana": "Z-Tako",
      "Takodana": "Z-Tako",
      "revenue flex": "Z-RevF",
      "Revenue Flex": "Z-RevF",
      "tech hub": "Z-Tech",
      "Tech Hub": "Z-Tech",
      "operations": "Z-Oper",
      "Operations": "Z-Oper",
      "meeting rooms": "Z-Meet",
      "Meeting Rooms": "Z-Meet",
      "design studio": "Z-MEdit",
      "Design Studio": "Z-MEdit"
    };
    
    const normalized = zoneMap[zoneName.toLowerCase()] || zoneMap[zoneName] || zoneName;
    console.log(`🏢 Zone mapping: "${zoneName}" -> "${normalized}"`);
    return normalized;
  }

  // Get zone capacity based on zone name
  private getZoneCapacity(zone: string): number {
    const capacities: { [key: string]: number } = {
      'Z-Tako': 8,
      'Z-RevF': 18,
      'Z-JerO': 4,
      'Z-Tech': 42,
      'Z-Oper': 16,
      'Z-M&M1': 6,
      'Z-M&M2': 16,
      'Z-Hoth': 10,
      'Z-Nabo': 18,
      'Z-Rev2': 24,
      'Z-MEdit': 8,
      'Z-PEdit': 8,
      'Z-OpFl2': 12,
      'Z-Meet': 8, // Default for meeting rooms
      'Z-IT': 20,
      'Z-M&M3': 12,
      'Z-Hyb4': 15,
      'Z-Quiet': 16,
      // Legacy mappings for backward compatibility
      'Revenue Flex': 18,
      'Design Studio': 12,
      'Tech Hub': 42,
      'Meeting Rooms': 8,
      'Jeremy\'s Office': 4,
      'Takodana': 8
    };
    return capacities[zone] || 10; // Default capacity
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
    
    console.log('🧹 Cleaning names from:', peopleString);
    
    // Nettoyer et séparer par différents délimiteurs possibles
    const cleanedNames = peopleString
      .split(/[;,\n]/) // Séparer par ; ou , ou nouvelles lignes
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => {
        // Nettoyer les caractères indésirables et normaliser
        let cleaned = name
          .replace(/^[-•\s]+/, '') // Supprimer tirets et puces en début
          .replace(/^@/, '') // Supprimer @ au début (slack handles)
          .replace(/\s+/g, ' ') // Normaliser les espaces
          .trim();
        
        // Si c'est juste des guillemets, on les enlève
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1).trim();
        }
        
        return cleaned;
      })
      .filter(name => name.length > 1); // Garder seulement les noms valides
    
    console.log('🎯 Cleaned names:', cleanedNames);
    return cleanedNames;
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
