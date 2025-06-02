
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";

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

interface EventFormProps {
  onEventCreated: (event: Event) => void;
}

const EventForm = ({ onEventCreated }: EventFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    type: "meeting"
  });

  const eventTypes = [
    { value: "meeting", label: "Réunion", color: "bg-blue-100 text-blue-800" },
    { value: "training", label: "Formation", color: "bg-purple-100 text-purple-800" },
    { value: "celebration", label: "Célébration", color: "bg-green-100 text-green-800" },
    { value: "presentation", label: "Présentation", color: "bg-orange-100 text-orange-800" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: Event = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      maxAttendees: parseInt(formData.maxAttendees) || 0,
      type: formData.type
    };

    onEventCreated(newEvent);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      maxAttendees: "",
      type: "meeting"
    });
    
    setIsOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="mb-6">
        <Plus className="h-4 w-4 mr-2" />
        Créer un Événement
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Créer un Nouvel Événement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre de l'événement</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Réunion équipe Marketing"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type d'événement</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description détaillée de l'événement..."
              className="w-full min-h-20 px-3 py-2 border border-input rounded-md bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="maxAttendees">Participants max</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                placeholder="50"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Salle de conférence A"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              Publier l'Événement
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
