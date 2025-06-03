import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Clock, RefreshCw, Search, MapPin, User, Wifi, WifiOff } from "lucide-react";
import { useTodayPulseData } from "../hooks/useDashboardData";
import { dashboardService } from "../services/dashboardService";
import PersonAvatar from "./PersonAvatar";
import QuickStats from "./QuickStats";
import './SimplifiedDashboard.css';

interface PersonInfo {
  name: string;
  zone: string;
}

const SimplifiedDashboard = () => {
  const { pulseData, isLoading, error, refresh } = useTodayPulseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Parse les noms des personnes depuis le format "Nom P.; Autre N.; ..."
  const parsePersonNames = (peopleString: string): string[] => {
    return dashboardService.parseAndCleanNames(peopleString);
  };

  // Créer une liste de toutes les personnes avec leur zone
  const allPeople: PersonInfo[] = useMemo(() => {
    const people: PersonInfo[] = [];
    pulseData.forEach(zone => {
      const names = parsePersonNames(zone.people);
      names.forEach(name => {
        people.push({
          name: name,
          zone: zone.zone
        });
      });
    });
    return people.sort((a, b) => a.name.localeCompare(b.name));
  }, [pulseData]);

  // Filtrer selon la recherche
  const filteredPeople = useMemo(() => {
    if (!searchTerm) return allPeople;
    return allPeople.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPeople, searchTerm]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalCapacity = pulseData.reduce((sum, zone) => sum + zone.capacity, 0);
    const totalPresent = pulseData.reduce((sum, zone) => sum + zone.count, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalPresent / totalCapacity) * 100) : 0;
    
    return {
      totalCapacity,
      totalPresent,
      occupancyRate,
      zonesCount: pulseData.length
    };
  }, [pulseData]);

  // Fonction pour obtenir la classe de largeur appropriée
  const getWidthClass = (percentage: number) => {
    const roundedPercentage = Math.round(percentage / 5) * 5; // Arrondi aux 5% près
    return `w-${Math.min(roundedPercentage, 100)}`;
  };

  const getOccupancyBadgeColor = (count: number, capacity: number) => {
    const rate = capacity > 0 ? (count / capacity) * 100 : 0;
    if (rate >= 90) return "destructive";
    if (rate >= 70) return "secondary";
    if (rate >= 50) return "outline";
    return "default";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Chargement des données...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête avec statistiques */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Présence Bureau</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble en temps réel</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {error ? (
                  <WifiOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Wifi className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm text-gray-500">
                  {error ? 'Données de démo' : 'Données live'}
                </span>
              </div>
              
              <Button onClick={() => refresh()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <QuickStats
            totalPresent={stats.totalPresent}
            totalCapacity={stats.totalCapacity}
            occupancyRate={stats.occupancyRate}
            zonesCount={stats.zonesCount}
            isLoading={isLoading}
          />
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une personne ou une zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Zones (côté gauche) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Zones du Bureau
            </h2>
            
            <div className="grid gap-4">
              {pulseData.map((zone, index) => {
                const occupancyRate = zone.capacity > 0 ? Math.round((zone.count / zone.capacity) * 100) : 0;
                const peopleNames = parsePersonNames(zone.people);
                
                return (
                  <Card 
                    key={index} 
                    className={`transition-all hover:shadow-md cursor-pointer ${
                      selectedZone === zone.zone ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedZone(selectedZone === zone.zone ? null : zone.zone)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{zone.zone}</CardTitle>
                        <Badge variant={getOccupancyBadgeColor(zone.count, zone.capacity)}>
                          {zone.count}/{zone.capacity}
                        </Badge>
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getWidthClass(occupancyRate)} ${
                            occupancyRate >= 90 ? 'bg-red-500' :
                            occupancyRate >= 70 ? 'bg-orange-500' :
                            occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {zone.count} présent{zone.count > 1 ? 's' : ''}
                        </span>
                        <span>{occupancyRate}% d'occupation</span>
                      </div>
                    </CardHeader>
                    
                    {/* Liste des personnes (collapsible) */}
                    {(selectedZone === zone.zone || peopleNames.length <= 3) && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personnes présentes :
                          </h4>
                          {peopleNames.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {peopleNames.map((name, i) => (
                                <Badge key={i} variant="outline" className="text-sm">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Aucune personne détectée</p>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Liste des personnes (côté droit) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Personnes Présentes ({allPeople.length})
            </h2>
            
            <Card>
              <CardContent className="p-4">
                {filteredPeople.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredPeople.map((person, index) => (
                      <PersonAvatar
                        key={index}
                        name={person.name}
                        zone={person.zone}
                        showZone={true}
                        size="md"
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      />
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun résultat pour "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune personne présente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info de mise à jour */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Mis à jour toutes les 10 secondes</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Dernière mise à jour : {new Date().toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;
