
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin } from "lucide-react";

const EmployeeList = () => {
  const employees = [
    {
      id: 1,
      name: "Marie Dubois",
      department: "Marketing",
      status: "present",
      arrival: "08:15",
      location: "Bureau Paris"
    },
    {
      id: 2,
      name: "Jean Martin",
      department: "Développement",
      status: "present",
      arrival: "09:00",
      location: "Télétravail"
    },
    {
      id: 3,
      name: "Sophie Laurent",
      department: "RH",
      status: "absent",
      arrival: "-",
      location: "Congé maladie"
    },
    {
      id: 4,
      name: "Pierre Durand",
      department: "Commercial",
      status: "present",
      arrival: "08:45",
      location: "Bureau Lyon"
    },
    {
      id: 5,
      name: "Emma Rousseau",
      department: "Design",
      status: "late",
      arrival: "09:30",
      location: "Bureau Paris"
    },
    {
      id: 6,
      name: "Thomas Bernard",
      department: "Finance",
      status: "present",
      arrival: "08:00",
      location: "Bureau Paris"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Présent</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">En retard</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Employés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {employee.name}
                  </p>
                  {getStatusBadge(employee.status)}
                </div>
                
                <p className="text-xs text-gray-500 mb-1">
                  {employee.department}
                </p>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{employee.arrival}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{employee.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
