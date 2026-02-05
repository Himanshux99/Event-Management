// src/data/demoEvents.ts
export const DEMO_EVENTS = [
  {
    title: "Inter-College Hackathon 2024",
    type: "inter-college",
    category: "Technical",
    date: "Mar 15, 2024",
    time: "10:00 AM",
    venue: "Main Auditorium",
    description: "A 24-hour coding marathon for students from all colleges.",
    maxCapacity: 200,
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    prizes: { first: "₹20,000", second: "₹10,000", third: "₹5,000" },
    // rounds configuration for demo
    totalRounds: 3,
    currentRound: 1,
    maxTeamsPerRound: [128, 32, 8],
    rounds: [
      { title: "Prelims", startDate: "Mar 15, 2024", description: "24-hour coding session." },
      { title: "Semi-Finals", startDate: "Mar 16, 2024", description: "Top teams present prototypes." },
      { title: "Finals", startDate: "Mar 17, 2024", description: "Final presentations and awards." },
    ]
  },
  {
    title: "Annual Cultural Fest - Euphoria",
    type: "intra-college",
    category: "Cultural",
    date: "Apr 02, 2024",
    time: "05:00 PM",
    venue: "College Ground",
    description: "Music, dance, and drama performances by students.",
    maxCapacity: 1000,
    isTeamEvent: false,
    prizes: { first: "Trophy", second: "Medal", third: "Certificate" }
  },
  {
    title: "Robotics Workshop",
    type: "intra-college",
    category: "Workshop",
    date: "Feb 20, 2024",
    time: "11:00 AM",
    venue: "Lab 302",
    description: "Hands-on session on building autonomous line-follower robots.",
    maxCapacity: 50,
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 2,
    prizes: { first: "Kit", second: "None", third: "None" }
  },
  {
    title: "Inter-Department Football Cup",
    type: "intra-college",
    category: "Sports",
    date: "Mar 05, 2024",
    time: "04:00 PM",
    venue: "Sports Complex",
    description: "Knockout football tournament for all departments.",
    maxCapacity: 100,
    isTeamEvent: true,
    minTeamSize: 11,
    maxTeamSize: 15,
    prizes: { first: "Championship Cup", second: "Runner-up Cup", third: "None" }
  },
  {
    title: "Guest Lecture: AI Trends",
    type: "inter-college",
    category: "Seminar",
    date: "Mar 10, 2024",
    time: "02:00 PM",
    venue: "Seminar Hall A",
    description: "Expert talk on the future of Generative AI in industry.",
    maxCapacity: 120,
    isTeamEvent: false,
    prizes: { first: "None", second: "None", third: "None" }
  }
];
