import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { mockEvents } from "@/data/mockEvents";
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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { generateQRPayload } from "@/lib/qr";
import {QRCodeCanvas} from "qrcode.react";
import QRCode from "react-qr-code";

// Mock user data
const mockUser = {
  name: "John Doe",
  rollNumber: "21CS1234",
  college: "ABC Engineering College",
  branch: "Computer Science",
  year: "3rd Year",
};

export default function QRPass() {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find((e) => e.id === id);
  const { currentUser } = useAuth();

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <NeuCard variant="static" className="max-w-md mx-auto py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Pass Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event pass you're looking for doesn't exist.
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
                    <p className="font-bold">{mockUser.name}</p>
                    <p className="text-sm text-muted-foreground">{mockUser.rollNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {mockUser.branch} • {mockUser.year}
                    </p>
                    <p className="text-xs text-muted-foreground">{mockUser.college}</p>
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
