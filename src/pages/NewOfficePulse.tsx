import React from 'react';
import SimplifiedDashboard from '../components/SimplifiedDashboard';
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NewOfficePulse: React.FC = () => {
  const navigate = useNavigate();

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
              
              <Button variant="outline" size="sm" asChild>
                <Link to="/simple-dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ancien Dashboard
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

      {/* Dashboard principal */}
      <SimplifiedDashboard />
    </div>
  );
};

export default NewOfficePulse;
