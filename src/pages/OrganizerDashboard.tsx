import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Settings,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader,
  Edit,
  Trash2,
} from "lucide-react";
import { seedAllEvents } from "../service/seedEvents";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { eventDB } from "@/lib/firebaseDB";
import { where } from "firebase/firestore";

const stats = [
  { label: "Total Events", value: "12", icon: Calendar, color: "bg-primary" },
  { label: "Total Registrations", value: "1,234", icon: Users, color: "bg-secondary" },
  { label: "Check-ins Today", value: "89", icon: QrCode, color: "bg-accent" },
  { label: "Avg Attendance", value: "85%", icon: TrendingUp, color: "bg-success" },
];

const handleSeedData = async () => {
  try {
    const message = await seedAllEvents();
  } catch (error) {
    toast.error("Failed to add demo events.");
  }
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [draftEvents, setDraftEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const publishedEvents = await eventDB.getByQuery([
          where('organizerId', '==', user.uid),
          where('status', '!=', 'draft')
        ]);
        const drafts = await eventDB.getDrafts(user.uid);
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
  }, [user]);

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
        where('organizerId', '==', user.uid),
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

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <NeuCard key={index} variant="static" className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </NeuCard>
          ))}
        </motion.div>

        {/* Draft Events Section */}
        {draftEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-8"
          >
            <NeuCard variant="static" padding="none" className="border-warning border-[3px]">
              <div className="p-6 border-b-[3px] border-warning bg-warning/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <h2 className="text-xl font-bold">Draft Events ({draftEvents.length})</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Ready to continue editing</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {draftEvents.map((draft) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu-sm hover:shadow-neu transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{draft.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {draft.date && draft.time ? `${draft.date} at ${draft.time}` : "No date set"}
                        </p>
                        <NeuBadge variant="warning" size="sm">Draft</NeuBadge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/organizer/edit-draft/${draft.id}`}>
                        <NeuButton variant="primary" size="sm" className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Continue Editing
                        </NeuButton>
                      </Link>
                      <NeuButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </NeuButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeuCard>
          </motion.div>
        )}

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NeuCard variant="static" padding="none">
            <div className="p-6 border-b-[3px] border-foreground">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Published Events</h2>
                <NeuButton variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>

            {loading ? (
              <div className="p-8 flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Loading your events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No published events yet</p>
                <Link to="/organizer/create-event">
                  <NeuButton variant="primary">
                    <Plus className="w-4 h-4" />
                    Create Your First Event
                  </NeuButton>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-semibold">Event</th>
                        <th className="text-left p-4 font-semibold">Date</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Registrations</th>
                        <th className="text-left p-4 font-semibold">Check-ins</th>
                        <th className="text-right p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-b border-foreground/10 hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-semibold">{event.title}</p>
                              <p className="text-sm text-muted-foreground">{event.venue}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{event.date}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </td>
                          <td className="p-4">
                            <EventStatusBadge status={event.status} />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{event.registeredCount || 0}</span>
                              <span className="text-muted-foreground">/ {event.maxCapacity}</span>
                            </div>
                            <div className="w-24 h-2 bg-muted rounded-full mt-1 border border-foreground/20">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${((event.registeredCount || 0) / event.maxCapacity) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">{Math.floor((event.registeredCount || 0) * 0.7)}</span>
                            <span className="text-muted-foreground text-sm ml-1">
                              ({event.registeredCount ? Math.floor(((event.registeredCount * 0.7) / event.registeredCount) * 100) : 0}%)
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/organizer/edit-draft/${event.id}`}>
                                <NeuButton variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </NeuButton>
                              </Link>
                              <NeuButton
                                variant={event.status === "registration-open" ? "accent" : "outline"}
                                size="sm"
                                onClick={() => handleToggleRegistration(event.id, event.status)}
                              >
                                {event.status === "registration-open" ? (
                                  <>
                                    <Pause className="w-4 h-4" />
                                    Close
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    Open
                                  </>
                                )}
                              </NeuButton>
                              <Link to={`/events/${event.id}`}>
                                <NeuButton variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </NeuButton>
                              </Link>
                              <Link to={`/organizer/events/${event.id}/scan`}>
                                <NeuButton variant="primary" size="sm">
                                  <QrCode className="w-4 h-4" />
                                </NeuButton>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                  {events.map((event) => (
                    <NeuCard key={event.id} variant="flat" padding="sm" className="border-2 border-foreground/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <EventStatusBadge status={event.status} />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm">
                          <span className="font-semibold">{event.registeredCount || 0}</span>
                          <span className="text-muted-foreground"> / {event.maxCapacity} registered</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/organizer/edit-draft/${event.id}`} className="flex-1">
                          <NeuButton variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4" />
                          </NeuButton>
                        </Link>
                        <NeuButton
                          variant={event.status === "registration-open" ? "accent" : "outline"}
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1"
                          onClick={() => handleToggleRegistration(event.id, event.status)}
                        >
                          {event.status === "registration-open" ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Close
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Open
                            </>
                          )}
                        </NeuButton>
                        <Link to={`/events/${event.id}`} className="flex-1">
                          <NeuButton variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4" />
                          </NeuButton>
                        </Link>
                        <Link to={`/organizer/events/${event.id}/scan`} className="flex-1">
                          <NeuButton variant="primary" size="sm" className="w-full">
                            <QrCode className="w-4 h-4" />
                          </NeuButton>
                        </Link>
                      </div>
                    </NeuCard>
                  ))}
                </div>
               </>
            )}
          </NeuCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold">Create New Event</p>
              <p className="text-sm text-muted-foreground">Start from scratch</p>
            </div>
          </NeuCard>

          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <QrCode className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-bold">Start Scanning</p>
              <p className="text-sm text-muted-foreground">Check-in attendees</p>
            </div>
          </NeuCard>

          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold">View Analytics</p>
              <p className="text-sm text-muted-foreground">Attendance reports</p>
            </div>
          </NeuCard>
        </motion.div>
      </div>
    </Layout>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "primary" }> = {
    "upcoming": { label: "Upcoming", variant: "default" },
    "registration-open": { label: "Open", variant: "success" },
    "registration-closed": { label: "Reg. Closed", variant: "warning" },
    "live": { label: "Live", variant: "destructive" },
    "closed": { label: "Ended", variant: "default" },
    "published": { label: "Published", variant: "success" },
  };

  const { label, variant } = config[status] || config["upcoming"];

  return (
    <NeuBadge variant={variant} size="sm">
      {label}
    </NeuBadge>
  );
}
