import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SimpleDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const teamData = [
    {
      name: "Marketing",
      present: 8,
      total: 12,
      members: ["Marie Dubois", "Sophie Martin", "Lucas Bernard", "Emma Rousseau", "Thomas Lopez", "Julie Petit", "Nicolas Roux", "Camille Moreau"]
    },
    {
      name: "Développement",
      present: 15,
      total: 18,
      members: ["Jean Martin", "Pierre Durand", "Alexandre Leroy", "Sarah Cohen", "David Michel", "Laura Garcia", "Antoine Blanc", "Manon Fournier", "Julien Simon", "Léa Moreau", "Maxime Dupont", "Chloé Lambert", "Hugo Martinez", "Amélie Robert", "Florian Dubois"]
    },
    {
      name: "Commercial",
      present: 6,
      total: 8,
      members: ["Pierre Durand", "Isabelle Martin", "François Lefevre", "Caroline Dubois", "Stéphane Bernard", "Nathalie Petit"]
    },
    {
      name: "RH",
      present: 3,
      total: 4,
      members: ["Sophie Laurent", "Marine Rousseau", "Olivier Moreau"]
    },
    {
      name: "Finance",
      present: 4,
      total: 5,
      members: ["Thomas Bernard", "Valérie Durand", "Jean-Luc Martin", "Sylvie Robert"]
    },
    {
      name: "Design",
      present: 5,
      total: 6,
      members: ["Emma Rousseau", "Clément Garcia", "Pauline Michel", "Arthur Leroy", "Océane Bernard"]
    }
  ];

  const totalPresent = teamData.reduce((sum, team) => sum + team.present, 0);
  const totalEmployees = teamData.reduce((sum, team) => sum + team.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Simplifié
            </h1>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button variant="outline">
                  Dashboard Principal
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Vue simplifiée des présences par équipe
          </p>
        </div>

        {/* Total Summary Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Total Présents Aujourd'hui</CardTitle>
            <Building2 className="h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalPresent}</div>
            <p className="text-sm opacity-80">
              sur {totalEmployees} employés ({Math.round((totalPresent / totalEmployees) * 100)}%)
            </p>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamData.map((team) => (
            <Card key={team.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {team.name}
                </CardTitle>
                <Users className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      {team.present}
                    </div>
                    <div className="text-sm text-gray-500">
                      / {team.total} employés
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(team.present / team.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-center text-sm font-medium text-gray-700">
                    {Math.round((team.present / team.total) * 100)}% présents
                  </div>
                  
                  {/* Present Members List */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Présents :</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {team.members.slice(0, team.present).map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
