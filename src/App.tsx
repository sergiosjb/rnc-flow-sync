import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NovaRNC from "./pages/NovaRNC";
import Dashboard from "./pages/Dashboard";
import RNCDetails from "./pages/RNCDetails";
import EditarRNC from "./pages/EditarRNC";
import AcaoImediata from "./pages/AcaoImediata";
import AcaoCorretiva from "./pages/AcaoCorretiva";
import AvaliacaoEficacia from "./pages/AvaliacaoEficacia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/nova-rnc" element={<NovaRNC />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rnc/:id" element={<RNCDetails />} />
          <Route path="/editar-rnc/:id" element={<EditarRNC />} />
          <Route path="/rnc/:id/acao-imediata" element={<AcaoImediata />} />
          <Route path="/rnc/:id/acao-corretiva" element={<AcaoCorretiva />} />
          <Route path="/rnc/:id/avaliacao-eficacia" element={<AvaliacaoEficacia />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
