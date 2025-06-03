import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  Clock, 
  MapPin, 
  RefreshCw, 
  TrendingUp,
  Calendar,
  Settings,
  Info,
  AlertCircle
} from "lucide-react";
import { useTodayPulseData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import TodayAtOffice from './TodayAtOffice';
import PresencePlanning from './PresencePlanning';
import { dashboardService } from '../services/dashboardService';
import './UnifiedDashboard.css';

const UnifiedDashboard: React.FC = () => {
  const { pulseData, isLoading, error, refresh } = useTodayPulseData();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  React.useEffect(() => {
    setLastUpdate(new Date());
  }, [pulseData]);

  // Calculs rapides pour les métriques
  const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
  const totalPresent = pulseData.reduce((sum, zone) => sum + zone.count, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalPresent / totalCapacity) * 100) : 0;
  const busyZones = pulseData.filter(zone => (zone.count / zone.capacity) > 0.8).length;

  const getOccupancyColor = (count: number, capacity: number) => {
    const rate = count / capacity;
    if (rate >= 0.9) return 'bg-red-500';
    if (rate >= 0.7) return 'bg-orange-500';
    if (rate >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getOccupancyLabel = (count: number, capacity: number) => {
    const rate = count / capacity;
    if (rate >= 0.9) return 'Plein';
    if (rate >= 0.7) return 'Occupé';
    if (rate >= 0.4) return 'Modéré';
    return 'Disponible';
  };

  const getProgressWidthClass = (percentage: number) => {
    const rounded = Math.round(percentage / 10) * 10;
    if (rounded >= 100) return 'progress-bar-full';
    if (rounded >= 90) return 'progress-bar-90';
    if (rounded >= 80) return 'progress-bar-80';
    if (rounded >= 70) return 'progress-bar-70';
    if (rounded >= 60) return 'progress-bar-60';
    if (rounded >= 50) return 'progress-bar-50';
    if (rounded >= 40) return 'progress-bar-40';
    if (rounded >= 30) return 'progress-bar-30';
    if (rounded >= 20) return 'progress-bar-20';
    if (rounded >= 10) return 'progress-bar-10';
    if (rounded >= 5) return 'progress-bar-5';
    return 'progress-bar-0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header avec actions rapides */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Présence Bureau</h1>
              </div>
              <Badge variant={error ? "destructive" : "outline"} className="ml-4">
                {error ? "Hors ligne" : "En temps réel"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Mis à jour: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refresh()}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/test-sheets')}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Config</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Métriques rapides en haut */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Présents</p>
                  <p className="text-3xl font-bold text-blue-600">{totalPresent}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacité Totale</p>
                  <p className="text-3xl font-bold text-green-600">{totalCapacity}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'Occupation</p>
                  <p className="text-3xl font-bold text-orange-600">{occupancyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zones Saturées</p>
                  <p className="text-3xl font-bold text-red-600">{busyZones}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Aujourd'hui</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Planning</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Vue par Zones</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Liste des Personnes</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Aujourd'hui */}
          <TabsContent value="today" className="space-y-4">
            <TodayAtOffice />
          </TabsContent>

          {/* Onglet Planning */}
          <TabsContent value="planning" className="space-y-4">
            <PresencePlanning />
          </TabsContent>

          {/* Onglet Vue par Zones */}
          <TabsContent value="zones" className="space-y-4">
            {error && (
              <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800">
                      Connexion Google Sheets indisponible. Affichage des données de démonstration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pulseData.map((zone, index) => {
                const occupancyRate = zone.capacity > 0 ? (zone.count / zone.capacity) : 0;
                const peopleList = dashboardService.parseAndCleanNames(zone.people);
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">{zone.zone}</CardTitle>
                        <Badge 
                          className={`${getOccupancyColor(zone.count, zone.capacity)} text-white`}
                        >
                          {getOccupancyLabel(zone.count, zone.capacity)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Barre de progression visuelle */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{zone.count} / {zone.capacity} personnes</span>
                          <span className="text-gray-500">{Math.round(occupancyRate * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 progress-bar ${getOccupancyColor(zone.count, zone.capacity)} ${getProgressWidthClass(Math.min(occupancyRate * 100, 100))}`}
                          />
                        </div>
                      </div>

                      {/* Liste des personnes présentes */}
                      {peopleList.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Personnes présentes :</p>
                          <div className="flex flex-wrap gap-1">
                            {peopleList.slice(0, 6).map((person, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {person}
                              </Badge>
                            ))}
                            {peopleList.length > 6 && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                +{peopleList.length - 6} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Liste des Personnes */}
          <TabsContent value="people" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les personnes présentes aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pulseData.map((zone) => {
                    const peopleList = dashboardService.parseAndCleanNames(zone.people);
                    
                    return peopleList.map((person, idx) => (
                      <div key={`${zone.zone}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{person}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {zone.zone}
                        </Badge>
                      </div>
                    ));
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Nouveaux composants intégrés dans les onglets ci-dessus */}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
