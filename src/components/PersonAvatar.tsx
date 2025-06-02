import React from 'react';
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PersonAvatarProps {
  name: string;
  zone?: string;
  showZone?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({ 
  name, 
  zone, 
  showZone = true, 
  size = 'md',
  className = '' 
}) => {
  // Générer les initiales à partir du nom
  const getInitials = (fullName: string): string => {
    if (!fullName || fullName.trim() === '') return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    // Prendre la première lettre du prénom et du nom
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Générer une couleur consistante basée sur le nom
  const getAvatarColor = (fullName: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} ${avatarColor} rounded-full flex items-center justify-center text-white font-medium`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate text-sm">{name}</div>
          {showZone && zone && (
            <div className="text-xs text-gray-500 truncate">{zone}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} ${avatarColor} rounded-full flex items-center justify-center text-white font-medium`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 truncate">{name}</div>
        {showZone && zone && (
          <Badge variant="outline" className="mt-1 text-xs">
            {zone}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PersonAvatar;
