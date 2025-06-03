import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock } from "lucide-react";
import { useTodayPulseData } from '@/hooks/useDashboardData';
import { dashboardService } from '@/services/dashboardService';

const TodayAtOffice: React.FC = () => {
  const { pulseData, isLoading, error } = useTodayPulseData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Au bureau aujourd'hui
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
            <Users className="h-5 w-5" />
            Au bureau aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            Erreur lors du chargement des données
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer les totaux
  const totalPresent = pulseData.reduce((sum, zone) => sum + zone.count, 0);
  const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);

  // Extraire toutes les personnes présentes
  const allPeople = pulseData
    .filter(zone => zone.people && zone.people.trim())
    .flatMap(zone => {
      // Utiliser la fonction parseAndCleanNames pour nettoyer les noms
      const cleanNames = dashboardService.parseAndCleanNames(zone.people);
      return cleanNames.map(name => ({
        name: name,
        zone: zone.zone
      }));
    });

  const getZoneColor = (zoneName: string) => {
    const colors = {
      'Revenue Flex': 'bg-blue-100 text-blue-800',
      'Design Studio': 'bg-purple-100 text-purple-800',
      'Tech Hub': 'bg-green-100 text-green-800',
      'Meeting Rooms': 'bg-orange-100 text-orange-800'
    };
    return colors[zoneName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Au bureau aujourd'hui
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Maintenant
          </div>
          <Badge variant="outline">
            {totalPresent} / {totalCapacity} personnes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {allPeople.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucune personne détectée au bureau pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {/* Résumé par zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pulseData.filter(zone => zone.count > 0).map((zone) => (
                <div key={zone.zone} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{zone.zone}</span>
                    </div>
                    <Badge variant="secondary" className={getZoneColor(zone.zone)}>
                      {zone.count}/{zone.capacity}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {dashboardService.parseAndCleanNames(zone.people).join(', ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Liste détaillée */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-700">
                Toutes les personnes présentes ({allPeople.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allPeople.map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{person.name}</span>
                    <Badge variant="outline" className={`text-xs ${getZoneColor(person.zone)}`}>
                      {person.zone}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAtOffice;
