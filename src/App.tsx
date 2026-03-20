import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Organisation from "./pages/Organisation";
import LifeBucketDetail from "./pages/LifeBucketDetail";
import LifeBucketAnalyse from "./pages/LifeBucketAnalyse";
import Content from "./pages/Content";
import Health from "./pages/Health";

import Skills from "./pages/Skills";
import Finances from "./pages/Finances";
import Agents from "./pages/Agents";
import YouTubePage from "./pages/YouTube";
import CoursPage from "./pages/Cours";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/organisation" element={<Organisation />} />
              <Route path="/content" element={<Content />} />
              <Route path="/health" element={<Health />} />
              
              <Route path="/skills" element={<Skills />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/youtube" element={<YouTubePage />} />
              <Route path="/cours" element={<CoursPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
