import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock, ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isFuture, isPast, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { usePlanningData, usePlanningStatistics, usePlanningFilters } from '@/hooks/usePlanningData';
import { PresencePlanningData } from '@/services/planningService';

const PresencePlanning: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Récupérer les données de planification réelles
  const { planningData: allPlanningData, isLoading, error, refresh } = usePlanningData();
  const filters = usePlanningFilters();

  // Obtenir les jours de la semaine actuelle
  const weekStart = startOfWeek(currentWeek, { locale: fr });
  const weekEnd = endOfWeek(currentWeek, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Gestion du chargement et des erreurs
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning des présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning des présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 p-4">
            <p>Erreur lors du chargement des données : {error.message}</p>
            <Button onClick={refresh} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Zones disponibles
  const zones = ["Tech Hub", "Design Studio", "Revenue Flex", "Meeting Rooms"];

  // Filtrer les données par semaine actuelle
  const weekPlanningData = filters.filterByWeek(allPlanningData, weekStart);
  
  // Filtrer par zone si sélectionnée
  const filteredData = selectedZone 
    ? filters.filterByZone(weekPlanningData, selectedZone)
    : weekPlanningData;

  // Obtenir les données pour une date donnée
  const getDataForDate = (date: Date) => {
    return filters.filterByDate(filteredData, date);
  };

  // Obtenir les personnes pour une date et zone donnée
  const getPeopleForDateAndZone = (date: Date, zone?: string) => {
    const dayData = getDataForDate(date);
    if (zone) {
      const zoneData = dayData.find(item => item.zone === zone);
      if (zoneData && zoneData.people) {
        return zoneData.people.split(',').map(name => name.trim()).filter(name => name);
      }
      return [];
    }
    // Si pas de zone spécifiée, on récupère toutes les personnes du jour
    return dayData.reduce((acc, item) => {
      if (item.people) {
        const names = item.people.split(',').map(name => name.trim()).filter(name => name);
        acc.push(...names);
      }
      return acc;
    }, [] as string[]);
  };

  // Obtenir toutes les zones actives pour une date
  const getActiveZonesForDate = (date: Date) => {
    const dayData = getDataForDate(date);
    return dayData.filter(item => item.count > 0);
  };

  // Statistiques
  const stats = usePlanningStatistics(filteredData);

  // Couleurs des zones
  const getZoneColor = (zoneName: string) => {
    const colors = {
      'Revenue Flex': 'bg-blue-100 text-blue-800',
      'Design Studio': 'bg-purple-100 text-purple-800',
      'Tech Hub': 'bg-green-100 text-green-800',
      'Meeting Rooms': 'bg-orange-100 text-orange-800'
    };
    return colors[zoneName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Navigation semaine
  const goToPreviousWeek = () => setCurrentWeek(prev => addWeeks(prev, -1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToThisWeek = () => setCurrentWeek(new Date());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planning de Présence
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Qui a prévu de venir et quand
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToThisWeek}>
              Cette semaine
            </Button>
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Filtres par zone */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={selectedZone === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedZone(null)}
          >
            Toutes les zones
          </Button>
          {zones.map(zone => (
            <Button
              key={zone}
              variant={selectedZone === zone ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedZone(zone)}
              className={selectedZone === zone ? getZoneColor(zone) : ""}
            >
              {zone}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* En-tête de semaine */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">
            Semaine du {format(weekStart, 'd MMMM', { locale: fr })} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
          </h3>
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayData = getDataForDate(day);
            const isCurrentDay = isToday(day);
            const isPastDay = isPast(day) && !isCurrentDay;
            
            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={`border rounded-lg p-3 min-h-32 ${
                  isCurrentDay ? 'border-blue-500 bg-blue-50' : 
                  isPastDay ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* En-tête du jour */}
                <div className="mb-3">
                  <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-700' : 'text-gray-700'}`}>
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-700' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                  {isCurrentDay && (
                    <Badge variant="default" className="text-xs mt-1">
                      Aujourd'hui
                    </Badge>
                  )}
                </div>

                {/* Données du jour */}
                <div className="space-y-2">
                  {(() => {
                    const dayData = getDataForDate(day);
                    const activeZones = getActiveZonesForDate(day);
                    const totalPeople = getPeopleForDateAndZone(day);
                    
                    if (activeZones.length === 0) {
                      return (
                        <div className="text-xs text-gray-400 text-center py-2">
                          Aucune présence
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          {totalPeople.length} personne{totalPeople.length > 1 ? 's' : ''}
                        </div>
                        {activeZones.map((zoneData, index) => {
                          const peopleInZone = zoneData.people 
                            ? zoneData.people.split(',').map(name => name.trim()).filter(name => name)
                            : [];
                          
                          if (peopleInZone.length === 0) return null;
                          
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getZoneColor(zoneData.zone)}`}
                                >
                                  {zoneData.zone}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {zoneData.count}/{zoneData.capacity}
                                </span>
                              </div>
                              
                              {/* Liste des personnes dans cette zone */}
                              <div className="space-y-1">
                                {peopleInZone.slice(0, 3).map((person, personIndex) => (
                                  <div key={personIndex} className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-600 truncate">
                                      {person}
                                    </span>
                                  </div>
                                ))}
                                {peopleInZone.length > 3 && (
                                  <div className="text-xs text-gray-400 ml-4">
                                    +{peopleInZone.length - 3} autre{peopleInZone.length - 3 > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              
                              {/* Taux d'occupation */}
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {Math.round((zoneData.count / zoneData.capacity) * 100)}% occupé
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistiques */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalCount}
              </div>
              <div className="text-xs text-gray-600">Total présents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalCapacity}
              </div>
              <div className="text-xs text-gray-600">Capacité totale</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {stats.zones}
              </div>
              <div className="text-xs text-gray-600">Zones disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.uniqueUsers}
              </div>
              <div className="text-xs text-gray-600">Personnes uniques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(stats.occupancyRate)}%
              </div>
              <div className="text-xs text-gray-600">Taux d'occupation</div>
            </div>
          </div>
        </div>

        {/* Message de statut */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-800">
            <strong>✅ Connecté aux Google Sheets :</strong> Les données affichées proviennent directement de l'onglet "dashboard"
            {allPlanningData.length > 0 && (
              <span> ({allPlanningData.length} entrées récupérées avec les colonnes : date, zone, capacity, count, people)</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresencePlanning;
