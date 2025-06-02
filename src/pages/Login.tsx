
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'une authentification simple
    // En production, vous devriez utiliser une vraie API d'authentification
    setTimeout(() => {
      if (email && password) {
        // Stocker l'état de connexion dans localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/simple-dashboard');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            Dashboard RH
          </CardTitle>
          <p className="text-gray-800">
            Connectez-vous pour accéder au dashboard des présences
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black focus:border-yellow-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-semibold">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black focus:border-yellow-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500 border-2 border-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                "Connexion en cours..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-700 bg-yellow-100 p-3 rounded border-2 border-black">
            <p className="font-semibold">Comptes de démonstration :</p>
            <p className="mt-1">
              <span className="font-medium">admin@entreprise.com</span> / 
              <span className="font-medium"> admin123</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
