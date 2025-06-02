
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const PresenceStats = () => {
  const weeklyData = [
    { day: 'Lun', present: 95, absent: 29 },
    { day: 'Mar', present: 98, absent: 26 },
    { day: 'Mer', present: 92, absent: 32 },
    { day: 'Jeu', present: 88, absent: 36 },
    { day: 'Ven', present: 85, absent: 39 },
  ];

  const monthlyTrend = [
    { month: 'Jan', rate: 82 },
    { month: 'Fév', rate: 85 },
    { month: 'Mar', rate: 88 },
    { month: 'Avr', rate: 86 },
    { month: 'Mai', rate: 90 },
    { month: 'Juin', rate: 85 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Présences de la Semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Présents" />
              <Bar dataKey="absent" fill="#ef4444" name="Absents" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendance du Taux de Présence (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[70, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Taux de présence']} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PresenceStats;
