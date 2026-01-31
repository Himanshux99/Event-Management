import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyEvents from "./pages/MyEvents";
import QRPass from "./pages/QRPass";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerEventDashboard from "./pages/OrganizerEventDashboard";
import EventCreation from "./pages/EventCreation";
import AttendanceScanner from "./pages/AttendanceScanner";
import AttendanceEventSelector from "./pages/AttendanceEventSelector";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import EditDraft from "./pages/EditDraft";
import AnimatedBackground from "./components/layout/AnimatedBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
            {/* Protected Routes */}
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute allowedRoles={["student"]}><MyEvents /></ProtectedRoute>} />
            <Route path="/my-events/:id/qr" element={<ProtectedRoute allowedRoles={["student"]}><QRPass /></ProtectedRoute>} />
            <Route path="/organizer" element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerDashboard /></ProtectedRoute>} />
            <Route path="/organizer/event/:eventId" element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerEventDashboard /></ProtectedRoute>} />
            <Route path="/organizer/create-event" element={<ProtectedRoute allowedRoles={["organizer"]}><EventCreation /></ProtectedRoute>} />
            <Route path="/organizer/edit-draft/:draftId" element={<ProtectedRoute allowedRoles={["organizer"]}><EditDraft /></ProtectedRoute>} />
            <Route path="/organizer/attendance" element={<ProtectedRoute allowedRoles={["organizer"]}><AttendanceEventSelector /></ProtectedRoute>} />
            <Route path="/organizer/attendance/:eventId" element={<ProtectedRoute allowedRoles={["organizer"]}><AttendanceScanner /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/organizer/settings" element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerSettings /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
