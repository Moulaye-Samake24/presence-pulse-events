import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Employee, simpleGoogleSheetsService } from "@/services/googleSheetsSimple";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading employees data...');
      const employeesData = await simpleGoogleSheetsService.getEmployeesData();
      console.log('📊 Employees loaded:', employeesData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('❌ Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const getStatusFromMood = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('énergique') || moodLower.includes('motivé') || moodLower.includes('excellent')) {
      return 'present';
    } else if (moodLower.includes('fatigué') || moodLower.includes('stress')) {
      return 'late';
    } else if (moodLower.includes('absent') || moodLower.includes('congé')) {
      return 'absent';
    }
    return 'present';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'late': return 'En retard';
      case 'absent': return 'Absent';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Chargement des employés...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEmployees} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Liste des Employés ({employees.length})</CardTitle>
        <Button onClick={loadEmployees} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun employé trouvé dans la base de données.</p>
          ) : (
            employees.map((employee, index) => {
              const status = getStatusFromMood(employee.moodSemaine);
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {employee.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {employee.nom}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{employee.poste}</span>
                        <span>•</span>
                        <span>{employee.equipe}</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{employee.ville}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
