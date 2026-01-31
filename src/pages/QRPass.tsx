import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Download,
  Share2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { generateQRPayload } from "@/lib/qr";
import { eventDB, userDB } from "@/lib/firebaseDB";
import QRCode from "react-qr-code";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  category: string;
}

interface UserData {
  name: string;
  rollNumber: string;
  college: string;
  branch: string;
}

export default function QRPass() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id || !currentUser) {
          setError("Missing event ID or user not authenticated");
          return;
        }
        
        // Fetch event data
        const eventData = await eventDB.getById(id);
        if (!eventData) {
          setError("Event not found");
          return;
        }
        setEvent({
          id,
          title: (eventData as any).title || "",
          date: (eventData as any).date || "",
          time: (eventData as any).time || "",
          venue: (eventData as any).venue || "",
          category: (eventData as any).category || "",
        });

        // Fetch user data
        const userData = await userDB.getById(currentUser.uid);
        if (userData) {
          setUser({
            name: (userData as any).name || "User",
            rollNumber: (userData as any).rollNumber || "N/A",
            college: (userData as any).college || "N/A",
            branch: (userData as any).branch || "N/A",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load pass details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your pass...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <NeuCard variant="static" className="max-w-md mx-auto py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Pass Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The event pass you're looking for doesn't exist."}
            </p>
            <Link to="/my-events">
              <NeuButton variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Back to My Events
              </NeuButton>
            </Link>
          </NeuCard>
        </div>
      </Layout>
    );
  }

  const handleDownload = () => {
    toast.info("Download feature coming soon!", {
      description: "PDF pass download will be available with backend integration.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // Build QR payload (JSON string) using Firebase uid + event id
  const qrValue = currentUser
    ? generateQRPayload(currentUser.uid, event.id)
    : "";

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-muted/50 py-8 px-4">
        <div className="container mx-auto max-w-md">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Link to="/my-events">
              <NeuButton variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to My Events
              </NeuButton>
            </Link>
          </motion.div>

          {/* Pass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NeuCard variant="static" padding="none" className="overflow-hidden">
              {/* Header */}
              <div className="bg-primary text-primary-foreground p-6 text-center">
                <NeuBadge variant="accent" size="sm" className="mb-3">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  VALID PASS
                </NeuBadge>
                <h1 className="text-xl font-bold mb-1">{event.title}</h1>
                <p className="opacity-80 text-sm">{event.category}</p>
              </div>

              {/* QR Code */}
              <div className="p-6 flex flex-col items-center bg-card">
                <div className="bg-foreground rounded-2xl p-4 shadow-neu">
                  {qrValue ? (
                    <QRCode
                      value={qrValue}
                      size={280}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-muted-foreground">No QR</div>
                  )}
                </div>

                {/* Event name + date/time below QR */}
                <div className="mt-4 text-center">
                  <h2 className="font-bold text-lg">{event.title}</h2>
                  <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative px-6">
                <div className="border-t-2 border-dashed border-foreground/30" />
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
              </div>

              {/* Event Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold text-sm">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold text-sm">{event.time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="font-semibold text-sm">{event.venue}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative px-6">
                <div className="border-t-2 border-dashed border-foreground/30" />
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
              </div>

              {/* Attendee Info */}
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-full border-[3px] border-foreground flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.rollNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.branch}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.college}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex gap-2">
                <NeuButton variant="outline" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </NeuButton>
                <NeuButton variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </NeuButton>
              </div>
            </NeuCard>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6"
          >
            <NeuCard variant="static" className="bg-accent/20">
              <h3 className="font-bold mb-2">📱 How to use this pass</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Show this QR code at the event entrance</li>
                <li>• Keep your college ID ready for verification</li>
                <li>• Arrive 15 minutes before the event starts</li>
              </ul>
            </NeuCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}