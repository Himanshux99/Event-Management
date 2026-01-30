import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { mockEvents } from "@/data/mockEvents";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <NeuCard variant="static" className="max-w-md mx-auto py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist.
            </p>
            <Link to="/events">
              <NeuButton variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </NeuButton>
            </Link>
          </NeuCard>
        </div>
      </Layout>
    );
  }

  const spotsLeft = event.maxCapacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const canRegister = event.status === "registration-open" && !isRegistered;

  const handleRegister = () => {
    if (canRegister) {
      setIsRegistered(true);
      toast.success("Successfully registered!", {
        description: "Check your email for the QR pass.",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const statusConfig = {
    "upcoming": { label: "Upcoming", variant: "default" as const, description: "Registration opens soon" },
    "registration-open": { label: "Open", variant: "success" as const, description: "Registration is open" },
    "registration-closed": { label: "Closed", variant: "warning" as const, description: "Registration is closed" },
    "live": { label: "Live Now", variant: "destructive" as const, description: "Event is happening now" },
    "closed": { label: "Ended", variant: "default" as const, description: "This event has ended" },
  };

  const status = statusConfig[event.status];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link to="/events">
            <NeuButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </NeuButton>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Card */}
            <NeuCard variant="static" padding="none" className="overflow-hidden">
              {/* Event Image */}
              <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 to-secondary/30 relative">
                <div className="absolute top-4 left-4 flex gap-2">
                  <NeuBadge variant={event.type === "inter-college" ? "primary" : "secondary"}>
                    {event.type === "inter-college" ? "Inter-College" : "Intra-College"}
                  </NeuBadge>
                  <NeuBadge variant={status.variant}>
                    {status.label}
                  </NeuBadge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <NeuBadge variant="outline" size="lg">
                    {event.category}
                  </NeuBadge>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {event.title}
                </h1>

                {/* Event Details Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl md:col-span-2">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-semibold">{event.venue}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-lg font-bold mb-3">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Join us for an exciting event that brings together the best minds from across campuses. 
                    This event promises to be an unforgettable experience with engaging activities, 
                    networking opportunities, and amazing prizes for winners.
                  </p>
                </div>
              </div>
            </NeuCard>

            {/* Rules & Guidelines */}
            <NeuCard variant="static">
              <h2 className="text-lg font-bold mb-4">Rules & Guidelines</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Valid college ID required for entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>QR pass must be shown at the venue for check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Arrive at least 15 minutes before the event starts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Follow the event code of conduct at all times</span>
                </li>
              </ul>
            </NeuCard>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Registration Card */}
            <NeuCard variant="static" className="sticky top-24">
              <div className="space-y-4">
                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Registrations
                    </span>
                    <span className="font-semibold">
                      {event.registeredCount}/{event.maxCapacity}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-foreground">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(event.registeredCount / event.maxCapacity) * 100}%`,
                      }}
                    />
                  </div>
                  {spotsLeft > 0 && spotsLeft <= 10 && (
                    <p className="text-sm text-destructive font-semibold mt-2">
                      Only {spotsLeft} spots left!
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground">{status.description}</p>
                </div>

                {/* Register Button */}
                {isRegistered ? (
                  <NeuButton variant="accent" className="w-full" disabled>
                    <CheckCircle2 className="w-5 h-5" />
                    Registered
                  </NeuButton>
                ) : canRegister ? (
                  <NeuButton
                    variant="primary"
                    className="w-full"
                    onClick={handleRegister}
                  >
                    {isFull ? "Join Waitlist" : "Register Now"}
                  </NeuButton>
                ) : (
                  <NeuButton variant="outline" className="w-full" disabled>
                    {event.status === "upcoming"
                      ? "Coming Soon"
                      : event.status === "closed"
                      ? "Event Ended"
                      : "Registration Closed"}
                  </NeuButton>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <NeuButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-destructive text-destructive" : ""}`}
                    />
                    Save
                  </NeuButton>
                  <NeuButton variant="outline" className="flex-1" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                    Share
                  </NeuButton>
                </div>
              </div>
            </NeuCard>

            {/* Organizer Info */}
            <NeuCard variant="static">
              <h3 className="font-bold mb-3">Organized By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full border-[3px] border-foreground flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">CS</span>
                </div>
                <div>
                  <p className="font-semibold">Computer Science Club</p>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
                </div>
              </div>
            </NeuCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
