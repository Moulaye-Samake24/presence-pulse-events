// Component pour afficher une personne individuellement
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Clock, Briefcase, MessageSquare } from "lucide-react";

interface PersonCardProps {
  name: string;
  zone: string;
  isPresent: boolean;
  employee?: {
    poste?: string;
    equipe?: string;
    ville?: string;
    moodSemaine?: string;
    slackUsername?: string;
    email?: string;
  };
}

// Fonction pour générer des initiales à partir du nom
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Fonction pour générer une couleur basée sur le nom
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
    'bg-yellow-500', 'bg-cyan-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Fonction pour obtenir l'emoji du mood
const getMoodEmoji = (mood: string): string => {
  const moodMap: { [key: string]: string } = {
    'happy': '😊',
    'excited': '🤩',
    'focused': '🎯',
    'tired': '😴',
    'busy': '🏃‍♂️',
    'relaxed': '😌',
    'motivated': '💪',
    'creative': '🎨',
    'default': '👤'
  };
  
  const lowerMood = mood.toLowerCase();
  for (const [key, emoji] of Object.entries(moodMap)) {
    if (lowerMood.includes(key)) {
      return emoji;
    }
  }
  return moodMap.default;
};

const PersonCard: React.FC<PersonCardProps> = ({ name, zone, isPresent, employee }) => {
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const moodEmoji = employee?.moodSemaine ? getMoodEmoji(employee.moodSemaine) : '👤';

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg border-2 ${
      isPresent ? 'border-green-400 bg-green-50 hover:bg-green-100' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête avec avatar et nom */}
          <div className="flex items-center space-x-3">
            {/* Avatar avec initiales */}
            <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg`}>
              {initials}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Nom et statut */}
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-black truncate text-lg">{name}</h4>
                <span className="text-xl">{moodEmoji}</span>
              </div>
              
              {/* Status badge */}
              {isPresent && (
                <Badge className="bg-green-100 text-green-800 border-green-400 text-xs font-semibold">
                  ✓ Présent
                </Badge>
              )}
            </div>
          </div>
          
          {/* Informations principales */}
          <div className="space-y-2">
            {/* Zone */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-700 font-medium">{zone}</span>
            </div>
            
            {/* Poste */}
            {employee?.poste && (
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700">{employee.poste}</span>
              </div>
            )}
            
            {/* Équipe */}
            {employee?.equipe && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 font-medium">{employee.equipe}</span>
              </div>
            )}
            
            {/* Ville */}
            {employee?.ville && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">{employee.ville}</span>
              </div>
            )}
          </div>

          {/* Informations de contact */}
          {(employee?.slackUsername || employee?.email) && (
            <div className="pt-2 border-t border-gray-200 space-y-1">
              {employee?.slackUsername && (
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-3 w-3 text-indigo-500" />
                  <span className="text-xs text-indigo-600 font-mono">@{employee.slackUsername}</span>
                </div>
              )}
              
              {employee?.email && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 truncate">{employee.email}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Mood de la semaine */}
          {employee?.moodSemaine && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Mood:</span> {employee.moodSemaine}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonCard;
