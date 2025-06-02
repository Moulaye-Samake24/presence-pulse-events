
// Configuration simple - juste les IDs des sheets
const PULSE_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID;
const EMPLOYEES_SHEET_ID = import.meta.env.VITE_EMPLOYEES_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // Optionnel pour feuilles publiques

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

class GoogleSheetsService {
  private sheets: any;
  private isAuthenticated = false;

  constructor() {
    // Configuration avec API Key (plus simple pour lecture seule)
    this.sheets = google.sheets({ version: 'v4', auth: API_KEY });
    this.isAuthenticated = true;
  }

  // Récupère les données de présence depuis pulse_today
  async getPulseData(): Promise<PulseData[]> {
    try {
      console.log('Fetching pulse data from sheet:', PULSE_SHEET_ID);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: PULSE_SHEET_ID,
        range: 'pulse_today!A:D', // zone, capacity, count, people
      });

      const rows = response.data.values || [];
      console.log('Raw data from sheets:', rows);
      
      // Skip header row et transforme en objets
      const pulseData = rows.slice(1).map((row: string[]) => ({
        zone: row[0] || '',
        capacity: parseInt(row[1]) || 0,
        count: parseInt(row[2]) || 0,
        people: row[3] || '',
      }));

      console.log('Processed pulse data:', pulseData);
      return pulseData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données pulse:', error);
      throw error;
    }
  }

  // Récupère les données employés
  async getEmployeesData(): Promise<Employee[]> {
    try {
      console.log('Fetching employees data from sheet:', EMPLOYEES_SHEET_ID);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: EMPLOYEES_SHEET_ID,
        range: 'Sheet1!A:I', // Ajustez selon votre structure
      });

      const rows = response.data.values || [];
      
      // Skip header row et transforme en objets
      return rows.slice(1).map((row: string[]) => ({
        nom: row[0] || '',
        poste: row[1] || '',
        equipe: row[2] || '',
        manager: row[3] || '',
        ville: row[4] || '',
        pays: row[5] || '',
        centreInteret: row[6] || '',
        projetEnCours: row[7] || '',
        moodSemaine: row[8] || '',
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des données employés:', error);
      throw error;
    }
  }

  // Teste la connexion aux sheets
  async testConnection(): Promise<boolean> {
    try {
      await this.getPulseData();
      return true;
    } catch (error) {
      console.error('Test de connexion échoué:', error);
      return false;
    }
  }

  // Méthode pour données de démonstration si Google Sheets n'est pas accessible
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
}

// Instance singleton
export const googleSheetsService = new GoogleSheetsService();
