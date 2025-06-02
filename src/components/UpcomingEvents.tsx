
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      title: "Réunion équipe Marketing",
      date: "2024-06-03",
      time: "10:00",
      location: "Salle de conférence A",
      attendees: 8,
      type: "meeting"
    },
    {
      id: 2,
      title: "Formation Sécurité",
      date: "2024-06-04",
      time: "14:00",
      location: "Auditorium",
      attendees: 45,
      type: "training"
    },
    {
      id: 3,
      title: "Anniversaire d'entreprise",
      date: "2024-06-05",
      time: "18:00",
      location: "Espace détente",
      attendees: 124,
      type: "celebration"
    },
    {
      id: 4,
      title: "Point hebdomadaire RH",
      date: "2024-06-06",
      time: "09:00",
      location: "Bureau RH",
      attendees: 3,
      type: "meeting"
    },
    {
      id: 5,
      title: "Présentation nouveaux produits",
      date: "2024-06-07",
      time: "15:30",
      location: "Salle de conférence B",
      attendees: 25,
      type: "presentation"
    }
  ];

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Réunion</Badge>;
      case "training":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Formation</Badge>;
      case "celebration":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Célébration</Badge>;
      case "presentation":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Présentation</Badge>;
      default:
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Événements à Venir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm">
                  {event.title}
                </h3>
                {getEventTypeBadge(event.type)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-600 space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-600 space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees} participants</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
