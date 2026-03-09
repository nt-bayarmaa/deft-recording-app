import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import CreateLoan from "./pages/CreateLoan";
import RecordRepayment from "./pages/RecordRepayment";
import Approvals from "./pages/Approvals";
import History from "./pages/History";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Scan from "./pages/Scan";
import ApproveLoan from "./pages/ApproveLoan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/loan/:type" element={<CreateLoan />} />
          <Route path="/repayment/:type" element={<RecordRepayment />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/history" element={<History />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/approve/:id" element={<ApproveLoan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
