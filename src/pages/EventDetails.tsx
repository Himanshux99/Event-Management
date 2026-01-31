import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { eventDB, registrationDB } from "@/lib/firebaseDB";
import { useAuth } from "@/context/authContext";
import RegistrationModal from "@/components/eventCreation/RegistrationModal";
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
  Mail,
  Phone,
  User,
  Loader,
} from "lucide-react";
import { toast } from "sonner";

// Type definitions
interface EventParams {
  id: string;
}

interface Contact {
  name: string;
  email: string;
  phone: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  duration?: number;
  time: string;
  venue: string;
  type: "inter-college" | "intra-college";
  category: string;
  registeredCount: number;
  maxCapacity: number;
  status: "upcoming" | "registration-open" | "registration-closed" | "live" | "closed" | "published";
  description?: string;
  guidelines?: string;
  contact?: Contact;
  coverImage?: string;
  isTeamEvent?: boolean;
  minTeamSize?: number | null;
  maxTeamSize?: number | null;
  eventDescription?: string;
  rounds?: any[];
  // Round configuration
  totalRounds?: number;
  currentRound?: number;
  maxTeamsPerRound?: number[]; // [round1Cap, round2Cap, ...]
}

// Helper functions
const formatTime12Hour = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} mins`;
  if (minutes === 60) return "1 hr";
  if (minutes % 66 === 0) return `${minutes / 60} hrs`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export default function EventDetails(): JSX.Element {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Fetch event from Firestore
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedEvent = (await eventDB.getById(id)) as EventData | null;
        setEvent(fetchedEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!currentUser || !id) return;
      
      try {
        const registered = await registrationDB.checkRegistration(currentUser.uid, id);
        setIsRegistered(registered);
      } catch (error) {
        console.error("Error checking registration:", error);
      }
    };

    checkRegistration();
  }, [currentUser, id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading event...</span>
        </div>
      </Layout>
    );
  }

  // Not found state
  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <NeuCard variant="static" className="max-w-md mx-auto py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
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
  const canRegister = !isRegistered && !isFull && (event.status === "registration-open" || event.status === "published");

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    setIsRegistered(true);
    toast.success("Registration successful!", {
      description: "Check your email for confirmation.",
    });
  };

  const handleShare = async (): Promise<void> => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const statusConfig: Record<
    EventData["status"],
    { label: string; variant: "default" | "success" | "warning" | "destructive"; description: string }
  > = {
    upcoming: {
      label: "Upcoming",
      variant: "default",
      description: "Registration opens soon",
    },
    "registration-open": {
      label: "Open",
      variant: "success",
      description: "Registration is open",
    },
    "registration-closed": {
      label: "Closed",
      variant: "warning",
      description: "Registration is closed",
    },
    live: {
      label: "Live Now",
      variant: "destructive",
      description: "Event is happening now",
    },
    closed: {
      label: "Ended",
      variant: "default",
      description: "This event has ended",
    },
    published: {
      label: "Published",
      variant: "success",
      description: "Event is published",
    },
  };

  const status = statusConfig[event.status];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
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

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Card with Cover Image */}
            <NeuCard variant="static" padding="none" className="overflow-hidden">
              {/* Cover Image / Hero Banner */}
              <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary/30 to-secondary/30">
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Calendar className="w-24 h-24 text-foreground/10" />
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-2">
                  <NeuBadge
                    variant={event.type === "inter-college" ? "primary" : "secondary"}
                  >
                    {event.type === "inter-college" ? "Inter-College" : "Intra-College"}
                  </NeuBadge>
                  <NeuBadge variant={status.variant}>{status.label}</NeuBadge>
                </div>

                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                  <NeuBadge variant="outline" size="lg">
                    {event.category}
                  </NeuBadge>
                </div>
              </div>

              {/* Event Header Info */}
              <div className="p-6 md:p-8 space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>

                {/* Event Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border-2 border-foreground/10">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{event.date}</p>
                    </div>
                  </div>

                  {/* Start Time & Duration */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border-2 border-foreground/10">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time & Duration</p>
                      <p className="font-semibold">
                        {event.startTime && event.duration
                          ? `${formatTime12Hour(event.startTime)} • ${formatDuration(event.duration)}`
                          : event.time}
                      </p>
                    </div>
                  </div>

                  {/* Venue - full width */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border-2 border-foreground/10 md:col-span-2">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-semibold">{event.venue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </NeuCard>

            {/* Description */}
            {event.description && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </NeuCard>
            )}

            {/* Event Description */}
            {event.eventDescription && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-4">Event Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.eventDescription}
                </p>
              </NeuCard>
            )}

            {/* Rounds Section */}
            {((event.rounds && event.rounds.length > 0) || event.totalRounds) && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-6">Event Rounds</h2>
                {/* Rounds summary */}
                {(event.totalRounds || event.currentRound || (event.maxTeamsPerRound && event.maxTeamsPerRound.length > 0)) && (
                  <div className="mb-4 grid sm:grid-cols-3 gap-3">
                    {typeof event.totalRounds === 'number' && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Rounds</p>
                        <p className="font-semibold">{event.totalRounds}</p>
                      </div>
                    )}

                    {typeof event.currentRound === 'number' && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Round</p>
                        <p className="font-semibold">{event.currentRound}</p>
                      </div>
                    )}

                    {event.maxTeamsPerRound && event.maxTeamsPerRound.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Round Capacities</p>
                        <p className="font-semibold">{event.maxTeamsPerRound.join(" / ")}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  {event.rounds.map((round: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border-[3px] border-foreground/10 rounded-[12px] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-primary">
                          {round.title || `Round ${index + 1}`}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-medium">
                          Round {index + 1}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {round.startDate && (
                          <div className="flex items-start gap-2 p-2 bg-muted rounded">
                            <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">Start Date</p>
                              <p className="font-medium">{round.startDate}</p>
                            </div>
                          </div>
                        )}
                        {round.endDate && (
                          <div className="flex items-start gap-2 p-2 bg-muted rounded">
                            <Calendar className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">End Date</p>
                              <p className="font-medium">{round.endDate}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {round.description && (
                        <div className="text-sm text-muted-foreground p-3 bg-muted rounded border-l-4 border-primary">
                          {round.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </NeuCard>
            )}

            {/* Guidelines */}
            {event.guidelines && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-4">Rules & Guidelines</h2>
                <div className="space-y-3 text-muted-foreground">
                  {event.guidelines.split("\n").map((guideline, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span>{guideline.replace(/^[•-]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              </NeuCard>
            )}

            {/* Participation Info */}
            {(event.isTeamEvent !== undefined || event.maxCapacity) && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-4">Participation Details</h2>
                <div className="space-y-4">
                  {/* Team/Individual */}
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Participation Type</p>
                      <p className="font-semibold">
                        {event.isTeamEvent ? "Team Event" : "Individual"}
                      </p>
                    </div>
                  </div>

                  {/* Team Size */}
                  {event.isTeamEvent && event.minTeamSize && event.maxTeamSize && (
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Users className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <p className="font-semibold">
                          {event.minTeamSize} - {event.maxTeamSize} members
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Max Capacity */}
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Max Capacity</p>
                      <p className="font-semibold">{event.maxCapacity} spots</p>
                    </div>
                  </div>
                </div>
              </NeuCard>
            )}

            {/* Contact Information */}
            {event.contact && (
              <NeuCard variant="static">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {/* Contact Name */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Organizer</p>
                      <p className="font-semibold">{event.contact.name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <a href={`mailto:${event.contact.email}`} className="block">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold text-blue-600 hover:underline">
                          {event.contact.email}
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Phone */}
                  <a href={`tel:${event.contact.phone}`} className="block">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold text-blue-600 hover:underline">
                          {event.contact.phone}
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </NeuCard>
            )}
          </motion.div>

          {/* Sidebar - Registration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
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

                {/* Status Message */}
                <div className="p-3 bg-muted rounded-xl border-2 border-foreground/10">
                  <p className="text-sm text-muted-foreground">{status.description}</p>
                </div>

                {/* Register Button */}
                {isRegistered ? (
                  <NeuButton variant="accent" className="w-full" disabled>
                    <CheckCircle2 className="w-5 h-5" />
                    Registered
                  </NeuButton>
                ) : canRegister && currentUser ? (
                  <NeuButton 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => setShowRegistrationModal(true)}
                  >
                    {isFull ? "Join Waitlist" : "Register Now"}
                  </NeuButton>
                ) : (
                  <NeuButton variant="outline" className="w-full" disabled>
                    {!currentUser
                      ? "Login to Register"
                      : event.status === "upcoming"
                        ? "Coming Soon"
                        : event.status === "closed"
                          ? "Event Ended"
                          : isFull
                            ? "Event Full"
                            : "Registration Closed"}
                  </NeuButton>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <NeuButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isLiked ? "fill-destructive text-destructive" : ""
                      }`}
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
          </motion.div>
        </div>
      </div>

      {/* Registration Modal */}
      {currentUser && event && (
        <RegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          event={event}
          user={currentUser}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </Layout>
  );
}
