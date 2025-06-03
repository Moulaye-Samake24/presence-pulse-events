// Composant pour la recherche rapide de personnes
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MapPin, X, SortAsc, Filter } from "lucide-react";
import PersonCard from "./PersonCard";
import { PulseData } from "../services/googleSheets";
import { Employee, simpleGoogleSheetsService } from "../services/googleSheetsSimple";

interface PeopleSearchProps {
  pulseData: PulseData[];
  employees: Employee[];
}

interface PersonInfo {
  name: string;
  zone: string;
  isPresent: boolean;
  employee?: Employee;
}

const PeopleSearch: React.FC<PeopleSearchProps> = ({ pulseData, employees }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "zone" | "team">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Extraire toutes les personnes des données de présence
  const allPeople = useMemo(() => {
    const peopleMap = new Map<string, PersonInfo>();
    
    pulseData.forEach(zone => {
      if (zone.people) {
        const names = simpleGoogleSheetsService.parseAndCleanNames(zone.people);
        names.forEach(name => {
          const employee = employees.find(emp => 
            emp.nom.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(emp.nom.toLowerCase())
          );
          
          peopleMap.set(name, {
            name,
            zone: zone.zone,
            isPresent: true,
            employee
          });
        });
      }
    });
    
    return Array.from(peopleMap.values());
  }, [pulseData, employees]);

  // Filtrer les personnes selon la recherche et la zone
  const filteredPeople = useMemo(() => {
    let filtered = allPeople.filter(person => {
      const matchesSearch = searchTerm === "" || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.employee?.poste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.employee?.equipe?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = selectedZone === "all" || person.zone === selectedZone;
      const matchesTeam = selectedTeam === "all" || person.employee?.equipe === selectedTeam;
      
      return matchesSearch && matchesZone && matchesTeam;
    });

    // Tri des résultats
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;
      
      switch (sortBy) {
        case "zone":
          aValue = a.zone;
          bValue = b.zone;
          break;
        case "team":
          aValue = a.employee?.equipe || "";
          bValue = b.employee?.equipe || "";
          break;
        default: // "name"
          aValue = a.name;
          bValue = b.name;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allPeople, searchTerm, selectedZone, selectedTeam, sortBy, sortOrder]);

  // Obtenir la liste des zones uniques
  const zones = useMemo(() => {
    const uniqueZones = [...new Set(pulseData.map(zone => zone.zone))];
    return uniqueZones.sort();
  }, [pulseData]);

  // Obtenir la liste des équipes uniques
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(employees.map(emp => emp.equipe).filter(Boolean))];
    return uniqueTeams.sort();
  }, [employees]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const totalPresent = allPeople.length;
    const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
    const zonesWithPeople = pulseData.filter(zone => zone.count > 0).length;
    
    return {
      totalPresent,
      totalCapacity,
      zonesWithPeople,
      totalZones: pulseData.length
    };
  }, [allPeople, pulseData]);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card className="border-2 border-black bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Recherche de Personnes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPresent}</div>
              <div className="text-sm text-gray-600">Personnes présentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalCapacity}</div>
              <div className="text-sm text-gray-600">Capacité totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.zonesWithPeople}</div>
              <div className="text-sm text-gray-600">Zones occupées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalZones}</div>
              <div className="text-sm text-gray-600">Total zones</div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="space-y-4">
            {/* Ligne 1: Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, poste, équipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-black"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  title="Effacer la recherche"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Ligne 2: Filtres et tri */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre par zone */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="border-2 border-black rounded-md px-3 py-2 bg-white text-sm"
                  title="Filtrer par zone"
                  aria-label="Sélectionner une zone"
                >
                  <option value="all">Toutes les zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtre par équipe */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="border-2 border-black rounded-md px-3 py-2 bg-white text-sm"
                  title="Filtrer par équipe"
                  aria-label="Sélectionner une équipe"
                >
                  <option value="all">Toutes les équipes</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* Tri */}
              <div className="flex items-center space-x-2">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "zone" | "team")}
                  className="border-2 border-black rounded-md px-3 py-2 bg-white text-sm"
                  title="Trier par"
                  aria-label="Sélectionner le critère de tri"
                >
                  <option value="name">Trier par nom</option>
                  <option value="zone">Trier par zone</option>
                  <option value="team">Trier par équipe</option>
                </select>
              </div>

              {/* Ordre de tri */}
              <Button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                variant="outline"
                size="sm"
                className="border-2 border-black"
                title={`Tri ${sortOrder === "asc" ? "croissant" : "décroissant"}`}
              >
                {sortOrder === "asc" ? "A→Z" : "Z→A"}
              </Button>
              
              {/* Bouton de réinitialisation */}
              {(searchTerm || selectedZone !== "all" || selectedTeam !== "all" || sortBy !== "name" || sortOrder !== "asc") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedZone("all");
                    setSelectedTeam("all");
                    setSortBy("name");
                    setSortOrder("asc");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-2 border-black"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>
            
            {/* Filtres actifs */}
            {(selectedZone !== "all" || selectedTeam !== "all") && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {selectedZone !== "all" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Zone: {selectedZone}
                    <button
                      onClick={() => setSelectedZone("all")}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedTeam !== "all" && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Équipe: {selectedTeam}
                    <button
                      onClick={() => setSelectedTeam("all")}
                      className="ml-2 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats de la recherche */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Résultats ({filteredPeople.length} personne{filteredPeople.length !== 1 ? 's' : ''})
            </span>
            {searchTerm && (
              <span className="text-sm font-normal text-gray-600">
                pour "{searchTerm}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPeople.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeople.map((person, index) => (
                <PersonCard
                  key={`${person.name}-${person.zone}-${index}`}
                  name={person.name}
                  zone={person.zone}
                  isPresent={person.isPresent}
                  employee={person.employee}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucune personne trouvée
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}"` 
                  : "Aucune personne présente dans cette zone"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeopleSearch;
