
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import EventForm from "@/components/EventForm";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: number;
  type: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Réunion équipe Marketing",
      description: "Point mensuel sur les campagnes en cours",
      date: "2024-06-03",
      time: "10:00",
      location: "Salle de conférence A",
      maxAttendees: 15,
      type: "meeting"
    },
    {
      id: 2,
      title: "Formation Sécurité",
      description: "Formation obligatoire sur les nouvelles procédures de sécurité",
      date: "2024-06-04",
      time: "14:00",
      location: "Auditorium",
      maxAttendees: 50,
      type: "training"
    }
  ]);

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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Événements
            </h1>
            <p className="text-gray-600">
              Créez et gérez les événements de votre entreprise
            </p>
          </div>
        </div>

        {/* Event Creation Form */}
        <EventForm onEventCreated={handleEventCreated} />

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Événements Publiés ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun événement créé pour le moment
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {event.title}
                          </h3>
                          {getEventTypeBadge(event.type)}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{event.maxAttendees} participants max</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventManagement;
