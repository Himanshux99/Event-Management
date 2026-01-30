import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { EventCard } from "@/components/events/EventCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { getEvents, events as eventsData } from "@/data/eventsData";
import { mockEvents, eventCategories } from "@/data/mockEvents";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Building2, School } from "lucide-react";

type EventType = "all" | "inter-college" | "intra-college";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [eventType, setEventType] = useState<EventType>("all");
  const [displayEvents, setDisplayEvents] = useState([]);

  // Initialize events from mock data and eventsData.js
  useEffect(() => {
    // Combine mock events with events from eventsData
    const allEvents = [...mockEvents, ...getEvents()];
    setDisplayEvents(allEvents);
  }, []);

  // Listen for new events added
  useEffect(() => {
    const handleEventAdded = () => {
      // Refresh the events list when a new event is added
      const allEvents = [...mockEvents, ...getEvents()];
      setDisplayEvents(allEvents);
    };

    window.addEventListener("eventAdded", handleEventAdded);
    return () => window.removeEventListener("eventAdded", handleEventAdded);
  }, []);

  const filteredEvents = useMemo(() => {
    return displayEvents.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      const matchesType = eventType === "all" || event.type === eventType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, eventType, displayEvents]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NeuBadge variant="accent" className="mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              Discover Events
            </NeuBadge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Events</h1>
            <p className="text-muted-foreground">
              Find and register for upcoming events at your campus
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <NeuCard variant="static" className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <NeuInput
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>

              {/* Event Type Toggle */}
              <div className="flex gap-2">
                <NeuButton
                  variant={eventType === "all" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setEventType("all")}
                >
                  <Filter className="w-4 h-4" />
                  All
                </NeuButton>
                <NeuButton
                  variant={eventType === "inter-college" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setEventType("inter-college")}
                >
                  <Building2 className="w-4 h-4" />
                  Inter-College
                </NeuButton>
                <NeuButton
                  variant={eventType === "intra-college" ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setEventType("intra-college")}
                >
                  <School className="w-4 h-4" />
                  Intra-College
                </NeuButton>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-4 flex flex-wrap gap-2">
              {eventCategories.map((category) => (
                <NeuButton
                  key={category}
                  variant={selectedCategory === category ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </NeuButton>
              ))}
            </div>
          </NeuCard>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> events
          </p>
        </div>

        {/* Event Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <NeuCard variant="static" className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <NeuButton
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setEventType("all");
              }}
            >
              Clear Filters
            </NeuButton>
          </NeuCard>
        )}
      </div>
    </Layout>
  );
}
