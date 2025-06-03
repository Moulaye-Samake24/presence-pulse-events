import { PulseData } from "@/services/googleSheetsSimple";

// Mock data for testing when Google Sheets is not available or for demonstration
export const mockPulseData: PulseData[] = [
  {
    zone: "Z-JerO",
    capacity: 4,
    count: 1,
    people: "Guillaume Deramchi"
  },
  {
    zone: "Z-Tako",
    capacity: 8,
    count: 3,
    people: "Alice Martin; Bob Smith; Carol Johnson"
  },
  {
    zone: "Z-RevF",
    capacity: 18,
    count: 7,
    people: "David Wilson; Eva Brown; Frank Miller; Grace Taylor; Henry Davis; Ivy Zhang; Jack Wilson"
  },
  {
    zone: "Z-Tech",
    capacity: 42,
    count: 15,
    people: "Tech Team Members"
  }
];

// Function to add mock data if needed for testing
export const getMockDataForTesting = (): PulseData[] => {
  return mockPulseData;
};

// Check if we should use mock data (for development/testing)
export const shouldUseMockData = (): boolean => {
  return process.env.NODE_ENV === 'development' && 
         import.meta.env.VITE_USE_MOCK_DATA === 'true';
};
