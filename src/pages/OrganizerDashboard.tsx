import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Settings,
  ChevronRight,
  Loader,
  Edit,
  Trash2,
  Clock,
  Users,
  QrCode,
  TrendingUp,
} from "lucide-react";
import { seedAllEvents } from "../service/seedEvents";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { eventDB } from "@/lib/firebaseDB";
import { where } from "firebase/firestore";
import type { EventSummary } from "@/types/dashboard";

// placeholder; actual stats are computed from events below

const handleSeedData = async () => {
  try {
    await seedAllEvents();
    toast.success("Demo data added.");
  } catch {
    toast.error("Failed to add demo events.");
  }
};

function EventStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; variant: "default" | "success" | "warning" | "destructive" | "primary" }
  > = {
    upcoming: { label: "Upcoming", variant: "default" },
    "registration-open": { label: "Open", variant: "success" },
    "registration-closed": { label: "Reg. Closed", variant: "warning" },
    live: { label: "Live", variant: "destructive" },
    closed: { label: "Ended", variant: "default" },
    published: { label: "Published", variant: "success" },
  };
  const { label, variant } = config[status] ?? config.upcoming;
  return <NeuBadge variant={variant} size="sm">{label}</NeuBadge>;
}

export default function OrganizerDashboard() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [draftEvents, setDraftEvents] = useState<EventSummary[]>([]);
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

  // Load events from Firebase (organizer's published + drafts)
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!currentUser) {
        setEvents([]);
        setDraftEvents([]);
        setLoading(false);
        return;
      }
      try {
        const published = await eventDB.getByQuery([
          where("organizerId", "==", currentUser.uid),
          where("status", "!=", "draft"),
        ]);
        const drafts = await eventDB.getDrafts(currentUser.uid);
        setEvents((published || []) as EventSummary[]);
        setDraftEvents((drafts || []) as EventSummary[]);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentUser]);

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await eventDB.delete(draftId);
      setDraftEvents((d) => d.filter((x) => x.id !== draftId));
      toast.success("Draft deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete draft");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <NeuBadge variant="secondary" className="mb-2">
                <Settings className="w-4 h-4 mr-1" />
                Organizer Dashboard
              </NeuBadge>
              <h1 className="text-2xl md:text-3xl font-bold">Your events</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Click an event to open its dashboard (teams, check-ins, rounds)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NeuButton variant="outline" size="sm" onClick={handleSeedData}>
                Add Demo Data
              </NeuButton>
              <Link to="/organizer/create-event">
                <NeuButton variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  Create Event
                </NeuButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
          >
            {computedStats.map((stat, idx) => (
              <NeuCard key={idx} variant="static" className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 ${stat.color} border-2 border-foreground rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </NeuCard>
            ))}
          </motion.div>

          {/* Draft events */}
          {draftEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <NeuCard variant="static" padding="none" className="border-2 border-warning">
                <div className="p-4 border-b-2 border-warning bg-warning/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <h2 className="text-lg font-bold">Draft events ({draftEvents.length})</h2>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {draftEvents.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-foreground bg-card"
                    >
                      <div>
                        <p className="font-semibold">{draft.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {draft.date && draft.time ? `${draft.date} · ${draft.time}` : "No date set"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/organizer/edit-draft/${draft.id}`}>
                          <NeuButton variant="primary" size="sm">
                            <Edit className="w-4 h-4" />
                            Edit
                          </NeuButton>
                        </Link>
                        <NeuButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </NeuButton>
                      </div>
                    </div>
                  ))}
                </div>
              </NeuCard>
            </motion.div>
          )}

          {/* Event list - click goes to per-event dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-lg font-bold mb-4">Published events</h2>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader className="w-5 h-5 animate-spin" />
                Loading events…
              </div>
            ) : events.length === 0 ? (
              <NeuCard variant="static" className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No events yet</p>
                <Link to="/organizer/create-event">
                  <NeuButton variant="primary">
                    <Plus className="w-4 h-4" />
                    Create your first event
                  </NeuButton>
                </Link>
              </NeuCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/organizer/event/${event.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
                  >
                    <NeuCard
                      variant="static"
                      className="h-full flex flex-col border-2 border-foreground hover:shadow-neu transition-shadow cursor-pointer group"
                    >
                      <div className="p-4 flex-1">
                        <p className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.venue ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {event.date} {event.time}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <EventStatusBadge status={event.status ?? "upcoming"} />
                          <span className="text-sm font-semibold">
                            {event.registeredCount ?? 0}
                            {event.maxCapacity != null && ` / ${event.maxCapacity}`} reg
                          </span>
                        </div>
                      </div>
                      <div className="p-4 pt-0 flex items-center justify-end gap-1 text-primary font-semibold text-sm">
                        Open dashboard
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </NeuCard>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
