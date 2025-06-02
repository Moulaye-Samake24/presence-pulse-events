import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, MapPin } from "lucide-react";
import { Employee } from "../services/googleSheetsSimple";

interface PeopleListProps {
  zoneName: string;
  people: string;
  capacity: number;
  count: number;
  employees: Employee[];
  showDetails?: boolean;
  compact?: boolean;
}

const PeopleList = ({ 
  zoneName, 
  people, 
  capacity, 
  count, 
  employees, 
  showDetails = true,
  compact = false 
}: PeopleListProps) => {
  // Extraire les noms individuels
  const individualNames = people
    ? people.split(';').map(name => name.trim()).filter(name => name.length > 0)
    : [];

  // Fonction pour trouver l'employé correspondant à un nom
  const findEmployee = (name: string): Employee | undefined => {
    return employees.find(emp => 
      emp.nom.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(emp.nom.toLowerCase())
    );
  };

  // Fonction pour extraire les initiales
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fonction pour obtenir un emoji d'humeur aléatoire si non défini
  const getMoodEmoji = (mood?: string): string => {
    if (mood && mood.trim()) return mood;
    const defaultMoods = ['😊', '😄', '🙂', '😌', '🤗', '😃', '😎'];
    return defaultMoods[Math.floor(Math.random() * defaultMoods.length)];
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-800">{zoneName}</span>
          <Badge variant="outline" className="text-xs">
            {count}/{capacity}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {individualNames.map((name, index) => {
            const employee = findEmployee(name);
            return (
              <div key={index} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold border border-black">
                  {getInitials(name)}
                </div>
                <span className="text-sm font-medium text-gray-800">{name}</span>
                {employee && (
                  <span className="text-xs text-gray-600">({employee.equipe})</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-lg p-4 space-y-4">
      {/* En-tête de zone */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black">
            <MapPin className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{zoneName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 border-green-300">
                <UserCheck className="h-3 w-3 mr-1" />
                {count} présent{count > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 border-blue-300">
                <Users className="h-3 w-3 mr-1" />
                {capacity} places
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            {Math.round((count / capacity) * 100)}%
          </div>
          <div className="text-xs text-gray-600">occupation</div>
        </div>
      </div>

      {/* Liste des personnes */}
      {individualNames.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personnes présentes :
          </h4>
          <div className="grid gap-3">
            {individualNames.map((name, index) => {
              const employee = findEmployee(name);
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  {/* Avatar avec initiales */}
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black font-bold text-sm">
                    {getInitials(name)}
                  </div>
                  
                  {/* Informations de la personne */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{name}</span>
                      <span className="text-lg">{getMoodEmoji(employee?.moodSemaine)}</span>
                    </div>
                    
                    {showDetails && employee && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          {employee.poste && (
                            <span className="font-medium">{employee.poste}</span>
                          )}
                          {employee.equipe && (
                            <Badge variant="outline" className="text-xs">
                              {employee.equipe}
                            </Badge>
                          )}
                        </div>
                        
                        {(employee.ville || employee.projetEnCours) && (
                          <div className="flex items-center gap-4 text-xs">
                            {employee.ville && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {employee.ville}
                              </span>
                            )}
                            {employee.projetEnCours && (
                              <span className="text-blue-600">
                                📋 {employee.projetEnCours}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Indicateur de présence */}
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucune personne présente dans cette zone</p>
        </div>
      )}
    </div>
  );
};

export default PeopleList;
