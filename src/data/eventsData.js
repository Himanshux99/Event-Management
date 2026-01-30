/**
 * Mock Events Data Layer
 * This file serves as the mock database for events.
 * It will be replaced with API calls to a real backend later.
 */

export let events = [
  {
    id: "1",
    title: "TechFest 2026 - Hackathon Championship",
    date: "Feb 15, 2026",
    startTime: "09:00",
    duration: 1440,
    time: "9:00 AM - 9:00 PM",
    venue: "Main Auditorium, Block A",
    type: "inter-college",
    category: "Technology",
    registeredCount: 180,
    maxCapacity: 200,
    status: "registration-open",
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 5,
    rounds: 3,
    description: "Join the most exciting hackathon championship of the year! Compete with brilliant minds from various colleges and showcase your coding skills. Build innovative solutions to real-world problems within 24 hours.",
    guidelines: "• Participants must bring their own laptops\n• Internet will be provided\n• Teams of 2-5 members\n• Pre-registration required\n• Judging criteria: Innovation, Functionality, Presentation",
    contact: {
      name: "Alex Johnson",
      email: "hackathon@techfest.com",
      phone: "+91-9876543210"
    },
    coverImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%234F46E5' width='400' height='200'/%3E%3Ctext x='50%' y='50%' font-size='28' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3EHackathon 2026%3C/text%3E%3C/svg%3E",
  },
  {
    id: "2",
    title: "Annual Cultural Night - Rhythm & Blues",
    date: "Feb 20, 2026",
    startTime: "18:00",
    duration: 300,
    time: "6:00 PM - 11:00 PM",
    venue: "Open Air Theatre",
    type: "intra-college",
    category: "Cultural",
    registeredCount: 450,
    maxCapacity: 500,
    status: "registration-open",
    isTeamEvent: false,
    minTeamSize: null,
    maxTeamSize: null,
    rounds: 1,
    description: "Experience the magic of our annual cultural night featuring mesmerizing performances from talented students. From classical dance to modern music, enjoy a spectacular evening celebrating diverse cultures and artistic expressions.",
    guidelines: "• Audience entry from 5:30 PM\n• Seating on first-come-first-serve basis\n• No professional cameras allowed\n• Mobile phones on silent mode\n• Free refreshments for registered participants",
    contact: {
      name: "Priya Sharma",
      email: "culture@college.edu",
      phone: "+91-8765432109"
    },
    coverImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23EC4899' width='400' height='200'/%3E%3Ctext x='50%' y='50%' font-size='28' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ECultural Night%3C/text%3E%3C/svg%3E",
  },
];

/**
 * Add a new event to the mock data
 * @param {Object} newEvent - Event object without id
 * @returns {Object} The newly created event with id
 */
export const addEvent = (newEvent) => {
  const eventWithId = {
    id: Date.now().toString(),
    registeredCount: 0,
    status: "upcoming",
    ...newEvent,
  };
  
  events.push(eventWithId);
  
  // Trigger a custom event to notify listeners about the change
  window.dispatchEvent(
    new CustomEvent("eventAdded", { detail: eventWithId })
  );
  
  return eventWithId;
};

/**
 * Get all events
 * @returns {Array} Array of all events
 */
export const getEvents = () => {
  return events;
};

/**
 * Get event by id
 * @param {string} id - Event id
 * @returns {Object|null} Event object or null if not found
 */
export const getEventById = (id) => {
  return events.find((event) => event.id === id) || null;
};

/**
 * Delete event by id
 * @param {string} id - Event id
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteEvent = (id) => {
  const index = events.findIndex((event) => event.id === id);
  if (index > -1) {
    events.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Update event by id
 * @param {string} id - Event id
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated event or null if not found
 */
export const updateEvent = (id, updates) => {
  const event = getEventById(id);
  if (event) {
    Object.assign(event, updates);
    return event;
  }
  return null;
};
