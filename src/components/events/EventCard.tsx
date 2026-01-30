import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { NeuCard, NeuCardContent, NeuCardHeader, NeuCardTitle } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { NeuButton } from "@/components/ui/NeuButton";
import { motion } from "framer-motion";

export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  startTime?: string;
  duration?: number;
  venue: string;
  type: "inter-college" | "intra-college";
  category: string;
  registeredCount: number;
  maxCapacity: number;
  status: "upcoming" | "registration-open" | "registration-closed" | "live" | "closed" | "published";
  imageUrl?: string;
  coverImage?: string;
  description?: string;
  eventDescription?: string;
  rounds?: any[];
}

interface EventCardProps {
  event: EventData;
  index?: number;
}

const statusConfig = {
  "upcoming": { label: "Upcoming", variant: "default" as const },
  "registration-open": { label: "Open", variant: "success" as const },
  "registration-closed": { label: "Closed", variant: "warning" as const },
  "live": { label: "Live", variant: "destructive" as const },
  "closed": { label: "Ended", variant: "default" as const },
  "published": { label: "Published", variant: "success" as const },
};

const typeConfig = {
  "inter-college": { label: "Inter-College", variant: "primary" as const },
  "intra-college": { label: "Intra-College", variant: "secondary" as const },
};

// Helper function to format time (HH:MM to HH:MM AM/PM)
const formatTime12Hour = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to convert minutes to readable format
const formatDuration = (minutes?: number): string => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} mins`;
  if (minutes === 60) return "1 hr";
  if (minutes % 60 === 0) return `${minutes / 60} hrs`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const status = statusConfig[event.status];
  const type = typeConfig[event.type];
  const spotsLeft = event.maxCapacity - event.registeredCount;
  const almostFull = spotsLeft <= 10 && spotsLeft > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/events/${event.id}`}>
        <NeuCard className="overflow-hidden h-full group">
          {/* Event Image / Placeholder */}
          <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-foreground/20" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <NeuBadge variant={status.variant} size="sm">
                {status.label}
              </NeuBadge>
            </div>

            {/* Type Badge */}
            <div className="absolute top-3 left-3">
              <NeuBadge variant={type.variant} size="sm">
                {type.label}
              </NeuBadge>
            </div>
          </div>

          <NeuCardHeader className="pb-2 pt-4 px-4">
            <NeuCardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </NeuCardTitle>
          </NeuCardHeader>

          <NeuCardContent className="px-4 pb-4 space-y-3">
            {/* Category */}
            <NeuBadge variant="outline" size="sm">
              {event.category}
            </NeuBadge>

            {/* Event Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                {event.startTime && event.duration ? (
                  <span>{formatTime12Hour(event.startTime)} • {formatDuration(event.duration)}</span>
                ) : (
                  <span>{event.time}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>

            {/* Description Preview */}
            {event.description && (
              <div className="py-2 text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </div>
            )}

            {/* Event Description Preview */}
            {/* {event.eventDescription && (
              <div className="py-2 text-sm text-muted-foreground line-clamp-2">
                {event.eventDescription}
              </div>
            )} */}

            {/* Rounds Preview */}
            {/* {event.rounds && event.rounds.length > 0 && (
              <div className="py-2 space-y-1 border-t-2 border-foreground/10 pt-2">
                <p className="text-xs font-semibold text-foreground">Rounds:</p>
                <div className="flex flex-wrap gap-1">
                  {event.rounds.map((round: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary/20 text-primary rounded"
                    >
                      {round.title || `Round ${idx + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )} */}

            {/* Registration Status */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-foreground/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {event.registeredCount}/{event.maxCapacity}
                </span>
              </div>
              {almostFull && (
                <span className="text-xs font-semibold text-destructive">
                  Only {spotsLeft} spots left!
                </span>
              )}
              {spotsLeft === 0 && (
                <span className="text-xs font-semibold text-warning">
                  Waitlist Only
                </span>
              )}
            </div>

            {/* Action Button */}
            <NeuButton
              variant={event.status === "registration-open" ? "primary" : "outline"}
              className="w-full mt-2"
              size="sm"
            >
              {event.status === "registration-open" ? "Register Now" : "View Details"}
            </NeuButton>
          </NeuCardContent>
        </NeuCard>
      </Link>
    </motion.div>
  );
}
