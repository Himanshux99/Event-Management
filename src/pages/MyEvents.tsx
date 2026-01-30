import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import TeamInvitations from "@/components/TeamInvitations";
import { mockEvents } from "@/data/mockEvents";
import { useAuth } from "@/context/authContext";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
} from "lucide-react";

type TabType = "upcoming" | "past" | "waitlisted" | "invitations";

// Mock user's registered events
const userEvents = {
  upcoming: mockEvents.slice(0, 3),
  past: mockEvents.slice(3, 5),
  waitlisted: mockEvents.slice(5, 6),
};

export default function MyEvents() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const tabs = [
    { id: "upcoming" as TabType, label: "Upcoming", count: userEvents.upcoming.length },
    { id: "past" as TabType, label: "Past", count: userEvents.past.length },
    { id: "waitlisted" as TabType, label: "Waitlisted", count: userEvents.waitlisted.length },
    { id: "invitations" as TabType, label: "Team Invitations", icon: Users },
  ];

  const currentEvents = activeTab !== "invitations" ? userEvents[activeTab as Exclude<TabType, "invitations">] : [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <NeuBadge variant="primary" className="mb-4">
            <Ticket className="w-4 h-4 mr-1" />
            My Events
          </NeuBadge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Registrations</h1>
          <p className="text-muted-foreground">
            View your registered events and access your QR passes
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <NeuButton
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "outline"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon && <tab.icon className="w-4 h-4 mr-1" />}
                {tab.label}
                {tab.id !== "invitations" && (
                  <NeuBadge
                    variant={activeTab === tab.id ? "accent" : "default"}
                    size="sm"
                  >
                    {tab.count}
                  </NeuBadge>
                )}
              </NeuButton>
            ))}
          </div>
        </motion.div>

        {/* Events List */}
        {activeTab === "invitations" ? (
          currentUser ? (
            <TeamInvitations userId={currentUser.uid} />
          ) : (
            <NeuCard variant="static" className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">Please Login</h3>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to see team invitations.
              </p>
            </NeuCard>
          )
        ) : currentEvents.length > 0 ? (
          <div className="space-y-4">
            {currentEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NeuCard variant="static" padding="none" className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="md:w-48 h-32 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-12 h-12 text-foreground/30" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <NeuBadge variant={event.type === "inter-college" ? "primary" : "secondary"} size="sm">
                          {event.type === "inter-college" ? "Inter-College" : "Intra-College"}
                        </NeuBadge>
                        <NeuBadge variant="outline" size="sm">
                          {event.category}
                        </NeuBadge>
                        {activeTab === "upcoming" && (
                          <NeuBadge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirmed
                          </NeuBadge>
                        )}
                        {activeTab === "waitlisted" && (
                          <NeuBadge variant="warning" size="sm">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Waitlisted
                          </NeuBadge>
                        )}
                      </div>

                      <h3 className="text-lg md:text-xl font-bold mb-3">{event.title}</h3>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link to={`/events/${event.id}`}>
                          <NeuButton variant="outline" size="sm">
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </NeuButton>
                        </Link>
                        {activeTab === "upcoming" && (
                          <Link to={`/my-events/${event.id}/qr`}>
                            <NeuButton variant="primary" size="sm">
                              <QrCode className="w-4 h-4" />
                              View QR Pass
                            </NeuButton>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </NeuCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <NeuCard variant="static" className="text-center py-16">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === "upcoming"
                ? "You haven't registered for any upcoming events yet."
                : activeTab === "past"
                ? "You haven't attended any events yet."
                : "You're not on any waitlists."}
            </p>
            <Link to="/events">
              <NeuButton variant="primary">
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </NeuButton>
            </Link>
          </NeuCard>
        )}
      </div>
    </Layout>
  );
}
