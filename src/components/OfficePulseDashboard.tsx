import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertCircle, Wifi, WifiOff, RefreshCw, LayoutDashboard, LogOut } from "lucide-react";
import { usePulseData, useConnectionTest, useEmployeesData } from "../hooks/usePulseData";
import { Button } from "@/components/ui/button";
import { PulseData } from "../services/googleSheets";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PersonCard from "./PersonCard";
import PeopleOverview from "./PeopleOverview";
import { DataSourceStatus } from "./DataSourceStatus";
import { RealTimeMonitor } from "./RealTimeMonitor";

const OfficePulseDashboard = () => {
  const { pulseData, isLoading, error, refresh } = usePulseData();
  const { employees } = useEmployeesData();
  const { isConnected, isTestingConnection } = useConnectionTest();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Calculs des statistiques globales
  const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
  const totalPresent = pulseData.reduce((sum, zone) => sum + zone.count, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalPresent / totalCapacity) * 100) : 0;

  // Fonction pour déterminer la couleur de la carte selon le taux d'occupation
  const getOccupancyColor = (count: number, capacity: number) => {
    const rate = capacity > 0 ? (count / capacity) * 100 : 0;
    if (rate >= 90) return "bg-red-500";
    if (rate >= 70) return "bg-orange-500";
    if (rate >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Fonction pour formater la liste des personnes présentes
  const formatPeopleList = (people: string) => {
    if (!people) return [];
    return people.split(';').map(person => person.trim()).filter(person => person.length > 0);
  };

  // Effect pour appliquer la largeur des barres de progression
  useEffect(() => {
    const progressBars = document.querySelectorAll('[data-width]');
    progressBars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      if (width && bar instanceof HTMLElement) {
        bar.style.width = `${Math.min(parseInt(width), 100)}%`;
      }
    });
  }, [pulseData]);

  if (isTestingConnection) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-black">
          <CardContent className="flex items-center space-x-4">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
            <div>
              <h3 className="text-xl font-bold text-black">Connexion à Google Sheets</h3>
              <p className="text-gray-700">Vérification de la connexion...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-black bg-red-50">
          <CardContent className="flex items-center space-x-4">
            <WifiOff className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-xl font-bold text-red-700">Erreur de connexion</h3>
              <p className="text-red-600">Impossible de se connecter à Google Sheets</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header avec statut de connexion */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Office Pulse - Welcome to the Jungle
              </h1>
              <p className="text-gray-800 text-lg">
                Présences en temps réel - Mise à jour toutes les 10 secondes
              </p>
              <div className="mt-3">
                <DataSourceStatus />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/test-sheets">
                <Button variant="outline" className="border-2 border-black bg-blue-50 hover:bg-blue-100">
                  <Wifi className="h-4 w-4 mr-2" />
                  Test Google Sheets
                </Button>
              </Link>
              <Link to="/people">
                <Button variant="outline" className="border-2 border-black bg-purple-50 hover:bg-purple-100">
                  <Users className="h-4 w-4 mr-2" />
                  Vue Personnes
                </Button>
              </Link>
              <Link to="/people-by-zone">
                <Button variant="outline" className="border-2 border-black bg-blue-50 hover:bg-blue-100">
                  <Users className="h-4 w-4 mr-2" />
                  Vue par Zone
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="border-2 border-black">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard Principal
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-2 border-black text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Connecté
                    </Badge>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      Déconnecté
                    </Badge>
                  </>
                )}
              </div>
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
          <div className="text-sm text-gray-600">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Capacité Totale</CardTitle>
              <Users className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCapacity}</div>
              <p className="text-sm opacity-90">places disponibles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Présents</CardTitle>
              <Users className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPresent}</div>
              <p className="text-sm opacity-90">personnes présentes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Taux d'Occupation</CardTitle>
              <Clock className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{occupancyRate}%</div>
              <p className="text-sm opacity-90">de l'espace utilisé</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time monitoring panel */}
        <div className="mb-6">
          <RealTimeMonitor />
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <Card className="bg-red-50 border-2 border-red-300">
            <CardContent className="flex items-center space-x-3 p-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Erreur de chargement</h3>
                <p className="text-red-700 text-sm">
                  {error.message || "Une erreur est survenue lors du chargement des données"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* État de chargement */}
        {isLoading && pulseData.length === 0 && (
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardContent className="flex items-center space-x-3 p-6">
              <RefreshCw className="h-6 w-6 text-yellow-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-yellow-800">Chargement en cours</h3>
                <p className="text-yellow-700 text-sm">Récupération des données...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grille des zones et aperçu des personnes */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Aperçu des personnes (colonne de droite) */}
          <div className="lg:col-span-1 order-last lg:order-last">
            <PeopleOverview 
              pulseData={pulseData} 
              employees={employees} 
              isLoading={isLoading}
            />
          </div>
          
          {/* Grille des zones (3 colonnes sur desktop) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pulseData.map((zone: PulseData) => {
            const occupancyPercentage = zone.capacity > 0 ? Math.round((zone.count / zone.capacity) * 100) : 0;
            const peopleList = formatPeopleList(zone.people);
            const colorClass = getOccupancyColor(zone.count, zone.capacity);

            return (
              <Card 
                key={zone.zone} 
                className="hover:shadow-lg transition-shadow border-2 border-black bg-white"
              >
                <CardHeader className="bg-yellow-100 border-b-2 border-black">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-black">
                      {zone.zone}
                    </CardTitle>
                    <div className={`w-4 h-4 rounded-full ${colorClass} border border-black`}></div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Statistiques de la zone */}
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-yellow-600">
                        {zone.count}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">/ {zone.capacity} places</div>
                        <div className="text-lg font-semibold text-black">
                          {occupancyPercentage}%
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-black">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${colorClass} border-r-2 border-black`}
                        data-width={occupancyPercentage}
                      ></div>
                    </div>

                    {/* Badge de statut */}
                    <div className="flex justify-center">
                      {occupancyPercentage >= 90 && (
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          Complet
                        </Badge>
                      )}
                      {occupancyPercentage >= 70 && occupancyPercentage < 90 && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                          Presque complet
                        </Badge>
                      )}
                      {occupancyPercentage < 70 && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          Places disponibles
                        </Badge>
                      )}
                    </div>

                    {/* Liste des personnes présentes */}
                    {peopleList.length > 0 && (
                      <div className="border-t-2 border-black pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-black">
                            Présents ({peopleList.length}) :
                          </p>
                          <Link 
                            to="/people" 
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Voir détails →
                          </Link>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {peopleList.slice(0, 5).map((person, index) => {
                            const employee = employees.find(emp => 
                              emp.nom.toLowerCase().includes(person.toLowerCase()) || 
                              person.toLowerCase().includes(emp.nom.toLowerCase())
                            );
                            return (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full border border-black"></div>
                                <span className="text-sm text-black font-medium">{person}</span>
                                {employee?.poste && (
                                  <span className="text-xs text-gray-500">• {employee.poste}</span>
                                )}
                              </div>
                            );
                          })}
                          {peopleList.length > 5 && (
                            <div className="text-xs text-gray-500 italic">
                              +{peopleList.length - 5} autres personnes...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>

        {/* Message si aucune zone */}
        {!isLoading && pulseData.length === 0 && (
          <Card className="border-2 border-gray-300 bg-gray-50">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Aucune donnée disponible
                </h3>
                <p className="text-gray-600">
                  Les données de présence n'ont pas encore été synchronisées.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OfficePulseDashboard;
