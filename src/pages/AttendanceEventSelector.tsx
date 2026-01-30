import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { NeuBadge } from '@/components/ui/NeuBadge';
import { useAuth } from '@/context/authContext';
import { eventDB } from '@/lib/firebaseDB';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  status: 'draft' | 'registration-open' | 'live' | 'published';
  title: string;
  date: string;
  time: string;
  venue: string;
  registeredCount?: number;
}

export default function AttendanceEventSelector() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      try {
        if (!currentUser?.uid) return;

        // Fetch all published events for this organizer
        const allEvents = await eventDB.getDrafts(currentUser.uid);
        // Filter for published/registration-open events only
        const publishedEvents = (allEvents as Event[]).filter((e: Event) => 
          e.status === 'registration-open' || e.status === 'live' || e.status === 'published'
        );
        setEvents(publishedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerEvents();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-muted/50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to="/organizer">
              <NeuButton variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </NeuButton>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <NeuBadge variant="secondary" className="mb-4">
              <QrCode className="w-4 h-4 mr-1" />
              Select Event to Scan
            </NeuBadge>
            <h1 className="text-3xl font-bold mb-2">Attendance Scanner</h1>
            <p className="text-muted-foreground">
              Choose an event to start checking in attendees via QR code
            </p>
          </motion.div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <NeuCard className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No Active Events</p>
                <p className="text-muted-foreground mb-6">
                  You don't have any published events yet. Create an event first.
                </p>
                <Link to="/organizer/create-event">
                  <NeuButton variant="primary">Create Event</NeuButton>
                </Link>
              </NeuCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NeuCard
                    variant="flat"
                    className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/organizer/attendance?eventId=${event.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {event.date} • {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {event.registeredCount || 0} registered
                        </div>
                      </div>
                    </div>

                    <NeuButton variant="primary" className="w-full">
                      <QrCode className="w-4 h-4" />
                      Open Scanner
                    </NeuButton>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
