import React, { useState } from 'react';
import SimplifiedDashboard from '../components/SimplifiedDashboard';
import PresencePlanning from '../components/PresencePlanning';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, LogOut, Home, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NewOfficePulse: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation rapide */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Office Pulse</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/test-sheets">
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connexion
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des pages principales */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger 
                value="home" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Home className="h-4 w-4" />
                Page d'accueil
              </TabsTrigger>
              <TabsTrigger 
                value="agenda" 
                className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Page agenda
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu des pages */}
            <TabsContent value="home" className="mt-0 border-0 p-0">
              <SimplifiedDashboard />
            </TabsContent>
            
            <TabsContent value="agenda" className="mt-0 border-0 p-0">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Planning des présences</h2>
                  <p className="text-gray-600">Vue hebdomadaire des personnes prévues au bureau</p>
                </div>
                <PresencePlanning />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NewOfficePulse;
