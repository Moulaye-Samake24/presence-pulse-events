import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, TrendingUp, Clock } from "lucide-react";

interface QuickStatsProps {
  totalPresent: number;
  totalCapacity: number;
  occupancyRate: number;
  zonesCount: number;
  isLoading?: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  totalPresent,
  totalCapacity,
  occupancyRate,
  zonesCount,
  isLoading = false
}) => {
  const stats = [
    {
      label: "Personnes présentes",
      value: totalPresent,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      label: "Capacité totale",
      value: totalCapacity,
      icon: Building,
      color: "text-gray-700",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-500"
    },
    {
      label: "Taux d'occupation",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: occupancyRate >= 80 ? "text-red-600" : occupancyRate >= 60 ? "text-orange-600" : "text-green-600",
      bgColor: occupancyRate >= 80 ? "bg-red-50" : occupancyRate >= 60 ? "bg-orange-50" : "bg-green-50",
      iconColor: occupancyRate >= 80 ? "text-red-500" : occupancyRate >= 60 ? "text-orange-500" : "text-green-500"
    },
    {
      label: "Zones actives",
      value: zonesCount,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickStats;
