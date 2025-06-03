import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PulseData, Employee, simpleGoogleSheetsService } from "../services/googleSheetsSimple";

interface PeopleOverviewProps {
  pulseData: PulseData[];
  employees: Employee[];
  isLoading?: boolean;
}

const PeopleOverview = ({ pulseData, employees, isLoading = false }: PeopleOverviewProps) => {
  // Calculs des statistiques
  const allPeople = pulseData.flatMap(zone => {
    if (zone.people) {
      return simpleGoogleSheetsService.parseAndCleanNames(zone.people);
    }
    return [];
  });

  const uniquePeople = [...new Set(allPeople)];
  const zonesWithPeople = pulseData.filter(zone => zone.count > 0);

  // Fonction pour extraire les initiales
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Zones les plus peuplées
  const topZones = pulseData
    .filter(zone => zone.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="border-2 border-black bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Aperçu des Personnes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black bg-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Aperçu des Personnes</span>
          </div>
          <div className="flex gap-2">
            <Link to="/people">
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
            </Link>
            <Link to="/people-by-zone">
              <Button variant="outline" size="sm" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Par Zone
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-800">{uniquePeople.length}</div>
            <div className="text-xs text-green-600">Personnes</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-800">{zonesWithPeople.length}</div>
            <div className="text-xs text-blue-600">Zones Actives</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-800">{allPeople.length}</div>
            <div className="text-xs text-purple-600">Présences</div>
          </div>
        </div>

        {/* Top zones avec personnes */}
        {topZones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Zones les plus actives :
            </h4>
            {topZones.map((zone, index) => {
              const peopleInZone = zone.people 
                ? simpleGoogleSheetsService.parseAndCleanNames(zone.people)
                : [];
              
              return (
                <div key={zone.zone} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{zone.zone}</span>
                    <Badge variant="outline" className="text-xs">
                      {zone.count}/{zone.capacity}
                    </Badge>
                  </div>
                  
                  {/* Aperçu des personnes dans cette zone */}
                  <div className="flex items-center gap-1">
                    {peopleInZone.slice(0, 4).map((name, nameIndex) => (
                      <div 
                        key={nameIndex}
                        className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold border border-gray-300"
                        title={name}
                      >
                        {getInitials(name)}
                      </div>
                    ))}
                    {peopleInZone.length > 4 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold border border-gray-400">
                        +{peopleInZone.length - 4}
                      </div>
                    )}
                    {peopleInZone.length > 0 && (
                      <span className="ml-2 text-xs text-gray-600">
                        {peopleInZone.slice(0, 2).join(', ')}
                        {peopleInZone.length > 2 && ` +${peopleInZone.length - 2} autres`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dernières personnes présentes */}
        {uniquePeople.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Personnes présentes :</h4>
            <div className="flex flex-wrap gap-1">
              {uniquePeople.slice(0, 8).map((name, index) => (
                <div key={index} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {getInitials(name)}
                  </div>
                  <span className="text-xs text-gray-700">{name.split(' ')[0]}</span>
                </div>
              ))}
              {uniquePeople.length > 8 && (
                <Link to="/people">
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-gray-300">
                    +{uniquePeople.length - 8} autres
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Message si aucune personne présente */}
        {uniquePeople.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune personne présente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeopleOverview;
