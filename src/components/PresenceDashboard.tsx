
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Calendar, Clock, TrendingUp, Settings, LayoutDashboard, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PresenceStats from "./PresenceStats";
import EmployeeList from "./EmployeeList";
import UpcomingEvents from "./UpcomingEvents";
import { PulseData, Employee, simpleGoogleSheetsService } from "@/services/googleSheetsSimple";

const PresenceDashboard = () => {
  const [pulseData, setPulseData] = useState<PulseData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading dashboard data...');
      
      const [pulseResult, employeesResult] = await Promise.all([
        simpleGoogleSheetsService.getPulseData(),
        simpleGoogleSheetsService.getEmployeesData()
      ]);
      
      console.log('📊 Dashboard data loaded:', { pulseResult, employeesResult });
      setPulseData(pulseResult);
      setEmployees(employeesResult);
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate real-time stats
  const totalEmployees = employees.length;
  const presentToday = pulseData.reduce((sum, zone) => sum + zone.count, 0);
  const absentToday = totalEmployees - presentToday;
  const presenceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-red-800 font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard des Présences
          </h1>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Link to="/simple-dashboard">
              <Button variant="outline">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Vue Simplifiée
              </Button>
            </Link>
            <Link to="/events">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Gérer les Événements
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">
          Gérez les présences de vos employés et suivez les événements à venir
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalEmployees}</div>
            <p className="text-xs opacity-80">{employees.length > 0 ? 'Données en temps réel' : 'En attente de données'}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents Aujourd'hui</CardTitle>
            <UserCheck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : presentToday}</div>
            <p className="text-xs opacity-80">{loading ? '' : `${presenceRate}% du personnel`}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserX className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : absentToday}</div>
            <p className="text-xs opacity-80">{loading ? '' : `${100 - presenceRate}% du personnel`}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Présence</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `${presenceRate}%`}</div>
            <p className="text-xs opacity-80">Données temps réel</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presence Statistics */}
        <div className="lg:col-span-2">
          <PresenceStats />
        </div>

        {/* Current Time and Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informations Actuelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Heure d'arrivée moyenne</span>
                <span className="text-sm font-medium">08:15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Heure de départ moyenne</span>
                <span className="text-sm font-medium">17:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Retards aujourd'hui</span>
                <span className="text-sm font-medium text-red-600">7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeList />
        <UpcomingEvents />
      </div>
    </div>
  );
};

export default PresenceDashboard;
