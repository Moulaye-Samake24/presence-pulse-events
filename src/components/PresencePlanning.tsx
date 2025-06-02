import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isFuture, isPast, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";

interface PresencePlanning {
  user_id: string; // Garder tel quel comme demandé
  date: string;
  zone: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  arrival_time?: string;
  departure_time?: string;
}

const PresencePlanning: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Données de démonstration - à remplacer par les vraies données Google Sheets
  const mockPlanningData: PresencePlanning[] = [
    // Aujourd'hui
    { user_id: "45132", date: format(new Date(), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed", arrival_time: "09:00", departure_time: "17:30" },
    { user_id: "45167", date: format(new Date(), 'yyyy-MM-dd'), zone: "Design Studio", status: "confirmed", arrival_time: "08:30" },
    { user_id: "45201", date: format(new Date(), 'yyyy-MM-dd'), zone: "Revenue Flex", status: "tentative" },
    
    // Demain
    { user_id: "45132", date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed", arrival_time: "10:00" },
    { user_id: "45167", date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), zone: "Design Studio", status: "confirmed" },
    { user_id: "45201", date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), zone: "Revenue Flex", status: "confirmed" },
    { user_id: "45234", date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), zone: "Meeting Rooms", status: "tentative" },
    
    // Cette semaine
    { user_id: "45132", date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed" },
    { user_id: "45167", date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), zone: "Design Studio", status: "confirmed" },
    { user_id: "45278", date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed" },
    { user_id: "45301", date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), zone: "Revenue Flex", status: "confirmed" },
    { user_id: "45345", date: format(addDays(new Date(), 4), 'yyyy-MM-dd'), zone: "Design Studio", status: "tentative" },
    { user_id: "45389", date: format(addDays(new Date(), 4), 'yyyy-MM-dd'), zone: "Meeting Rooms", status: "confirmed" },
    
    // Semaine prochaine
    { user_id: "45132", date: format(addDays(new Date(), 7), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed" },
    { user_id: "45167", date: format(addDays(new Date(), 7), 'yyyy-MM-dd'), zone: "Design Studio", status: "confirmed" },
    { user_id: "45412", date: format(addDays(new Date(), 8), 'yyyy-MM-dd'), zone: "Revenue Flex", status: "tentative" },
    { user_id: "45456", date: format(addDays(new Date(), 9), 'yyyy-MM-dd'), zone: "Tech Hub", status: "confirmed" },
  ];

  // Zones disponibles
  const zones = ["Tech Hub", "Design Studio", "Revenue Flex", "Meeting Rooms"];

  // Obtenir les jours de la semaine actuelle
  const weekStart = startOfWeek(currentWeek, { locale: fr });
  const weekEnd = endOfWeek(currentWeek, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filtrer les données par zone si sélectionnée
  const filteredData = selectedZone 
    ? mockPlanningData.filter(item => item.zone === selectedZone)
    : mockPlanningData;

  // Obtenir les données pour une date donnée
  const getDataForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredData.filter(item => item.date === dateStr);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur de la zone
  const getZoneColor = (zoneName: string) => {
    const colors = {
      'Revenue Flex': 'bg-blue-100 text-blue-800',
      'Design Studio': 'bg-purple-100 text-purple-800',
      'Tech Hub': 'bg-green-100 text-green-800',
      'Meeting Rooms': 'bg-orange-100 text-orange-800'
    };
    return colors[zoneName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'tentative': return 'Provisoire';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
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
                  {dayData.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-2">
                      Aucune prévision
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {dayData.length} personne{dayData.length > 1 ? 's' : ''}
                      </div>
                      {dayData.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {item.user_id}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{item.zone}</span>
                          </div>
                          {(item.arrival_time || item.departure_time) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {item.arrival_time && `${item.arrival_time}`}
                                {item.arrival_time && item.departure_time && ` - `}
                                {item.departure_time && `${item.departure_time}`}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé en bas */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(item => item.status === 'confirmed').length}
              </div>
              <div className="text-xs text-gray-600">Confirmées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredData.filter(item => item.status === 'tentative').length}
              </div>
              <div className="text-xs text-gray-600">Provisoires</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {zones.length}
              </div>
              <div className="text-xs text-gray-600">Zones disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredData.map(item => item.user_id)).size}
              </div>
              <div className="text-xs text-gray-600">Personnes uniques</div>
            </div>
          </div>
        </div>

        {/* Note pour développement */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800">
            <strong>Note de développement :</strong> Ce composant affiche actuellement des données de démonstration. 
            Il faudra le connecter aux données Google Sheets pour les prévisions de présence futures.
            Les user_id sont affichés tels quels comme demandé.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresencePlanning;
