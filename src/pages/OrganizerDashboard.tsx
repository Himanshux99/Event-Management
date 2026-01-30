import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { motion } from "framer-motion";
import { Plus, Settings, Calendar, Users, QrCode, TrendingUp } from "lucide-react";
import { seedAllEvents } from "../service/seedEvents";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { eventDB } from "@/lib/firebaseDB";
import { where } from "firebase/firestore";
import StatsGrid from "@/components/organizer/StatsGrid";
import DraftsSection from "@/components/organizer/DraftsSection";
import EventsTable from "@/components/organizer/EventsTable";
import QuickActions from "@/components/organizer/QuickActions";

// placeholder; actual stats are computed from events below

const handleSeedData = async () => {
  try {
    await seedAllEvents();
  } catch (error) {
    toast.error("Failed to add demo events.");
  }
};

export default function OrganizerDashboard() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [draftEvents, setDraftEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const computedStats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
    const checkInsToday = events.reduce((sum, e) => sum + Math.floor((e.registeredCount || 0) * 0.7), 0);
    const totalCapacity = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
    const avgAttendance = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return [
      { label: "Total Events", value: String(totalEvents), icon: Calendar, color: "bg-primary" },
      { label: "Total Registrations", value: String(totalRegistrations), icon: Users, color: "bg-secondary" },
      { label: "Check-ins Today", value: String(checkInsToday), icon: QrCode, color: "bg-accent" },
      { label: "Avg Attendance", value: `${avgAttendance}%`, icon: TrendingUp, color: "bg-success" },
    ];
  }, [events]);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const publishedEvents = await eventDB.getByQuery([
          where('organizerId', '==', currentUser.uid),
          where('status', '!=', 'draft')
        ]);
        const drafts = await eventDB.getDrafts(currentUser.uid);
        setEvents(publishedEvents);
        setDraftEvents(drafts);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerEvents();
  }, [currentUser]);

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      try {
        await eventDB.delete(draftId);
        setDraftEvents(draftEvents.filter(d => d.id !== draftId));
        toast.success("Draft deleted successfully");
      } catch (error) {
        console.error("Error deleting draft:", error);
        toast.error("Failed to delete draft");
      }
    }
  };

  const handleToggleRegistration = async (eventId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "registration-open" ? "registration-closed" : "registration-open";
      await eventDB.update(eventId, { status: newStatus });
      
      // Refresh events
      const publishedEvents = await eventDB.getByQuery([
        where('organizerId', '==', currentUser.uid),
        where('status', '!=', 'draft')
      ]);
      setEvents(publishedEvents);
      
      toast.success(
        newStatus === "registration-open"
          ? "Registration opened!"
          : "Registration closed!"
      );
    } catch (error) {
      console.error("Error toggling registration:", error);
      toast.error("Failed to update registration status");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <NeuBadge variant="secondary" className="mb-4">
              <Settings className="w-4 h-4 mr-1" />
              Organizer Dashboard
            </NeuBadge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, Organizer!</h1>
            <p className="text-muted-foreground">
              Manage your events, track registrations, and control check-ins
            </p>
          </div>
          <NeuButton 
            variant="primary" 
            size="lg"
            onClick={handleSeedData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            ⚡ Add Demo Data
          </NeuButton>
          <Link to="/organizer/create-event">
            <NeuButton variant="primary" size="lg">
              <Plus className="w-5 h-5" />
              Create Event
            </NeuButton>
          </Link>
        </motion.div>

        <StatsGrid stats={computedStats} />

        <DraftsSection draftEvents={draftEvents} onDelete={handleDeleteDraft} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <EventsTable events={events} loading={loading} onToggleRegistration={handleToggleRegistration} />
        </motion.div>

        <QuickActions />
      </div>
    </Layout>
  );
}
