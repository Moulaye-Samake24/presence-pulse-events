// Page dédiée à la vue des personnes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, RefreshCw, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePulseData, useEmployeesData } from "../hooks/usePulseData";
import PeopleSearch from "../components/PeopleSearch";
import { simpleGoogleSheetsService } from "../services/googleSheetsSimple";

const PeopleDashboard = () => {
  const { pulseData, isLoading, error, refresh } = usePulseData();
  const { employees, isLoading: employeesLoading } = useEmployeesData();

  // Calculs des statistiques pour les personnes
  const allPeople = pulseData.flatMap(zone => {
    if (zone.people) {
      return simpleGoogleSheetsService.parseAndCleanNames(zone.people);
    }
    return [];
  });

  const uniquePeople = [...new Set(allPeople)];
  const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((uniquePeople.length / totalCapacity) * 100) : 0;

  // Statistiques par équipe
  const teamStats = employees.reduce((acc, emp) => {
    if (emp.equipe) {
      const isPresent = uniquePeople.some(name => 
        name.toLowerCase().includes(emp.nom.toLowerCase()) ||
        emp.nom.toLowerCase().includes(name.toLowerCase())
      );
      
      if (!acc[emp.equipe]) {
        acc[emp.equipe] = { total: 0, present: 0 };
      }
      acc[emp.equipe].total++;
      if (isPresent) acc[emp.equipe].present++;
    }
    return acc;
  }, {} as Record<string, { total: number; present: number }>);

  // Top 3 des équipes les plus présentes
  const topTeams = Object.entries(teamStats)
    .map(([team, stats]) => ({
      team,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  // Zones les plus occupées
  const zoneSummary = pulseData
    .map(zone => ({
      ...zone,
      peopleList: zone.people ? simpleGoogleSheetsService.parseAndCleanNames(zone.people) : []
    }))
    .sort((a, b) => b.count - a.count);

  if (isLoading && pulseData.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-black">
          <CardContent className="flex items-center space-x-4">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
            <div>
              <h3 className="text-xl font-bold text-black">Chargement des données</h3>
              <p className="text-gray-700">Récupération des informations sur les personnes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Vue Personnes - Office Pulse
            </h1>
            <p className="text-gray-800 text-lg">
              Qui est présent au bureau aujourd'hui ?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/people-by-zone">
              <Button variant="outline" className="border-2 border-black bg-blue-100 hover:bg-blue-200">
                <MapPin className="h-4 w-4 mr-2" />
                Vue par Zone
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="border-2 border-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour Dashboard
              </Button>
            </Link>
            <Button 
              onClick={() => refresh()}
              disabled={isLoading}
              variant="outline"
              className="border-2 border-black"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques globales pour les personnes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Personnes Uniques</CardTitle>
              <Users className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniquePeople.length}</div>
              <p className="text-sm opacity-90">présentes aujourd'hui</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Total Présences</CardTitle>
              <Users className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allPeople.length}</div>
              <p className="text-sm opacity-90">comptages individuels</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Taux d'Occupation</CardTitle>
              <MapPin className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{occupancyRate}%</div>
              <p className="text-sm opacity-90">de l'espace utilisé</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Zones Actives</CardTitle>
              <Clock className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{zoneSummary.filter(z => z.count > 0).length}</div>
              <p className="text-sm opacity-90">sur {zoneSummary.length} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Top équipes présentes */}
        {topTeams.length > 0 && (
          <Card className="border-2 border-black mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-green-600" />
                <span>Top Équipes Présentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topTeams.map((team, index) => (
                  <div 
                    key={team.team}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0 
                        ? 'bg-yellow-100 border-yellow-400' 
                        : index === 1 
                        ? 'bg-gray-100 border-gray-400'
                        : 'bg-orange-100 border-orange-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-black">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {team.team}
                      </h4>
                      <Badge className="bg-white text-black border-black">
                        {team.rate}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700">
                      {team.present}/{team.total} présent(s)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résumé rapide des zones */}
        <Card className="border-2 border-black mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-purple-600" />
              <span>Résumé par Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneSummary.map((zone) => (
                <div 
                  key={zone.zone}
                  className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-black">{zone.zone}</h4>
                    <Badge 
                      className={
                        zone.count === 0 
                          ? "bg-gray-100 text-gray-800" 
                          : zone.count >= zone.capacity * 0.8
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {zone.count}/{zone.capacity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {zone.peopleList.length > 0 ? (
                      <div>
                        <strong>{zone.peopleList.length} personne(s):</strong>
                        <div className="mt-1 text-xs">
                          {zone.peopleList.slice(0, 3).join(', ')}
                          {zone.peopleList.length > 3 && ` +${zone.peopleList.length - 3} autres`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Zone vide</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Composant de recherche de personnes */}
        <PeopleSearch pulseData={pulseData} employees={employees} />

        {/* Informations sur les données */}
        <Card className="border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
              </span>
              <span>
                {employeesLoading ? "Chargement des profils..." : `${employees.length} profil(s) chargé(s)`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeopleDashboard;
