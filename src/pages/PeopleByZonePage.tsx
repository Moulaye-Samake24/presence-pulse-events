import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, RefreshCw, UserCheck, Clock, Building, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { usePulseData, useEmployeesData } from "../hooks/usePulseData";
import PeopleList from "../components/PeopleList";
import { simpleGoogleSheetsService } from "../services/googleSheetsSimple";

const PeopleByZonePage = () => {
  const { pulseData, isLoading, error, refresh } = usePulseData();
  const { employees, isLoading: employeesLoading } = useEmployeesData();

  // Calculs des statistiques générales
  const allPeople = pulseData.flatMap(zone => {
    if (zone.people) {
      // Utiliser la fonction parseAndCleanNames pour nettoyer les noms
      return simpleGoogleSheetsService.parseAndCleanNames(zone.people);
    }
    return [];
  });

  const uniquePeople = [...new Set(allPeople)];
  const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
  const totalPresent = pulseData.reduce((sum, zone) => sum + zone.count, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalPresent / totalCapacity) * 100) : 0;

  // Zones avec des personnes présentes
  const zonesWithPeople = pulseData.filter(zone => zone.count > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="border-2 border-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Personnes par Zone</h1>
              <p className="text-gray-600">Vue détaillée de la présence par zone</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/people">
              <Button variant="outline" size="sm" className="border-2 border-black">
                <Users className="h-4 w-4 mr-2" />
                Vue Personnes
              </Button>
            </Link>
            <Button 
              onClick={() => refresh()} 
              variant="outline" 
              size="sm"
              className="border-2 border-black"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center border-2 border-black">
                  <UserCheck className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Présents</p>
                  <p className="text-2xl font-bold text-gray-800">{totalPresent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center border-2 border-black">
                  <Users className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Personnes Uniques</p>
                  <p className="text-2xl font-bold text-gray-800">{uniquePeople.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center border-2 border-black">
                  <Building className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zones Actives</p>
                  <p className="text-2xl font-bold text-gray-800">{zonesWithPeople.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center border-2 border-black">
                  <TrendingUp className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taux Occupation</p>
                  <p className="text-2xl font-bold text-gray-800">{occupancyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message d'erreur */}
        {error && (
          <Card className="border-2 border-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">!</span>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Erreur de connexion</p>
                  <p className="text-red-600 text-sm">
                    Données de démonstration affichées. Vérifiez la configuration Google Sheets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des zones avec personnes */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Zones avec présence ({zonesWithPeople.length})
            </h2>
          </div>

          {zonesWithPeople.length > 0 ? (
            <div className="space-y-6">
              {zonesWithPeople.map((zone, index) => (
                <PeopleList
                  key={index}
                  zoneName={zone.zone}
                  people={zone.people}
                  capacity={zone.capacity}
                  count={zone.count}
                  employees={employees}
                  showDetails={true}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-black bg-white">
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune présence détectée</h3>
                  <p>Aucune personne n'est actuellement présente dans les zones surveillées.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Zones vides (optionnel) */}
        {pulseData.filter(zone => zone.count === 0).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-600">
                Zones disponibles ({pulseData.filter(zone => zone.count === 0).length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pulseData.filter(zone => zone.count === 0).map((zone, index) => (
                <Card key={index} className="border-2 border-gray-300 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-600">{zone.zone}</h3>
                        <p className="text-sm text-gray-500">{zone.capacity} places disponibles</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100">
                        Libre
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mise à jour */}
        <div className="text-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 inline mr-1" />
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  );
};

export default PeopleByZonePage;
