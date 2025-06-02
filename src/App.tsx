
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainDashboard from "./pages/MainDashboard";
import EventManagement from "./pages/EventManagement";
import OfficePulse from "./pages/OfficePulse";
import PeopleDashboard from "./pages/PeopleDashboard";
import PeopleByZonePage from "./pages/PeopleByZonePage";
import SimpleGoogleSheetsTest from "./pages/SimpleGoogleSheetsTest";
import NewOfficePulse from "./pages/NewOfficePulse";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/office-pulse" replace />} />
          
          {/* Route principale - Dashboard unifié */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } />
          
          {/* Routes spécialisées */}
          <Route path="/office-pulse" element={
            <ProtectedRoute>
              <NewOfficePulse />
            </ProtectedRoute>
          } />
          
          <Route path="/office-pulse-old" element={
            <ProtectedRoute>
              <OfficePulse />
            </ProtectedRoute>
          } />
          <Route path="/people" element={
            <ProtectedRoute>
              <PeopleDashboard />
            </ProtectedRoute>
          } />
          <Route path="/people-by-zone" element={
            <ProtectedRoute>
              <PeopleByZonePage />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <EventManagement />
            </ProtectedRoute>
          } />
          
          {/* Route de test/configuration */}
          <Route path="/test-sheets" element={
            <ProtectedRoute>
              <SimpleGoogleSheetsTest />
            </ProtectedRoute>
          } />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
