/**
 * Mock data for Organizer Dashboard.
 * Use this first; later replace with Firebase (events, teams, stats).
 */
import { mockEvents } from "@/data/mockEvents";
import type { Team, TeamStatus, EventSummary } from "@/types/dashboard";

// Re-export so Teams section can use same order when switching to Firebase
export { TEAM_STATUS_ORDER } from "@/types/dashboard";

// Organizer's events list (mock = same as mockEvents for now)
export const mockOrganizerEvents: EventSummary[] = mockEvents.map((e) => ({
  id: e.id,
  title: e.title,
  date: e.date,
  time: e.time,
  venue: e.venue,
  status: e.status,
  maxCapacity: e.maxCapacity,
  registeredCount: e.registeredCount,
}));

// Mock teams per event (eventId -> teams). Event "1" has extra mock data for all statuses.
export const mockTeamsByEventId: Record<string, Team[]> = {
  "1": [
    // ---- Registered ----
    {
      id: "t1-e1",
      eventId: "1",
      name: "Team Beta",
      status: "registered" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u3", name: "Amit Kumar", rollNumber: "EC001" },
        { userId: "u4", name: "Sneha Singh", rollNumber: "EC002" },
      ],
    },
    {
      id: "t2-e1",
      eventId: "1",
      name: "Code Crushers",
      status: "registered" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u12", name: "Riya Verma", rollNumber: "CS010" },
        { userId: "u13", name: "Karthik Nair", rollNumber: "CS011" },
      ],
    },
    {
      id: "t3-e1",
      eventId: "1",
      name: "Byte Builders",
      status: "registered" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u14", name: "Sahil Joshi", rollNumber: "IT005" },
        { userId: "u15", name: "Meera Iyer", rollNumber: "IT006" },
      ],
    },
    // ---- Checked-in ----
    {
      id: "t4-e1",
      eventId: "1",
      name: "Team Alpha",
      status: "checked_in" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u1", name: "Rahul Sharma", rollNumber: "CS001" },
        { userId: "u2", name: "Priya Patel", rollNumber: "CS002" },
      ],
    },
    {
      id: "t5-e1",
      eventId: "1",
      name: "Debug Dynasty",
      status: "checked_in" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u16", name: "Arjun Bhat", rollNumber: "CS020" },
        { userId: "u17", name: "Pooja Reddy", rollNumber: "CS021" },
      ],
    },
    {
      id: "t6-e1",
      eventId: "1",
      name: "Logic Legends",
      status: "checked_in" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u18", name: "Vivek Singh", rollNumber: "EC010" },
        { userId: "u19", name: "Kavya Menon", rollNumber: "EC011" },
      ],
    },
    // ---- Qualified ----
    {
      id: "t7-e1",
      eventId: "1",
      name: "Team Gamma",
      status: "qualified" as TeamStatus,
      currentRound: 2,
      members: [
        { userId: "u5", name: "Vikram Reddy", rollNumber: "IT001" },
        { userId: "u6", name: "Anita Nair", rollNumber: "IT002" },
      ],
    },
    {
      id: "t8-e1",
      eventId: "1",
      name: "Pixel Pioneers",
      status: "qualified" as TeamStatus,
      currentRound: 2,
      members: [
        { userId: "u20", name: "Aditya Rao", rollNumber: "CS030" },
        { userId: "u21", name: "Nisha Krishnan", rollNumber: "CS031" },
      ],
    },
    {
      id: "t9-e1",
      eventId: "1",
      name: "Stack Masters",
      status: "qualified" as TeamStatus,
      currentRound: 2,
      members: [
        { userId: "u22", name: "Rohan Desai", rollNumber: "IT015" },
        { userId: "u23", name: "Anjali Pillai", rollNumber: "IT016" },
      ],
    },
    // ---- Eliminated ----
    {
      id: "t10-e1",
      eventId: "1",
      name: "Bug Busters",
      status: "eliminated" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u24", name: "Varun Kapoor", rollNumber: "EC020" },
        { userId: "u25", name: "Isha Gupta", rollNumber: "EC021" },
      ],
    },
    {
      id: "t11-e1",
      eventId: "1",
      name: "Null Pointers",
      status: "eliminated" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u26", name: "Dev Malhotra", rollNumber: "CS040" },
        { userId: "u27", name: "Simran Chopra", rollNumber: "CS041" },
      ],
    },
    // ---- Waitlisted ----
    {
      id: "t12-e1",
      eventId: "1",
      name: "Queue Crew",
      status: "waitlisted" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u28", name: "Rahul Menon", rollNumber: "IT025" },
        { userId: "u29", name: "Divya Nambiar", rollNumber: "IT026" },
      ],
    },
    {
      id: "t13-e1",
      eventId: "1",
      name: "Cache Kings",
      status: "waitlisted" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u30", name: "Aarav Shah", rollNumber: "CS050" },
        { userId: "u31", name: "Lakshmi Rajan", rollNumber: "CS051" },
      ],
    },
    {
      id: "t14-e1",
      eventId: "1",
      name: "API Avengers",
      status: "waitlisted" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u32", name: "Ravi Kumar", rollNumber: "EC030" },
      ],
    },
  ],
  "2": [
    {
      id: "t4",
      eventId: "2",
      name: "Rhythm Squad",
      status: "checked_in" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u7", name: "Karan Mehta", rollNumber: "ME001" },
        { userId: "u8", name: "Divya Rao", rollNumber: "ME002" },
      ],
    },
    {
      id: "t5",
      eventId: "2",
      name: "Blues Band",
      status: "waitlisted" as TeamStatus,
      currentRound: 0,
      members: [
        { userId: "u9", name: "Arjun Joshi", rollNumber: "EE001" },
      ],
    },
  ],
  "3": [
    {
      id: "t6",
      eventId: "3",
      name: "Debate Masters",
      status: "eliminated" as TeamStatus,
      currentRound: 1,
      members: [
        { userId: "u10", name: "Neha Gupta", rollNumber: "HS001" },
        { userId: "u11", name: "Rohan Verma", rollNumber: "HS002" },
      ],
    },
  ],
};

// Mock stats per event (eventId -> { registrations, checkIns, currentActiveRound })
export const mockStatsByEventId: Record<
  string,
  { registrations: number; checkIns: number; currentActiveRound: number }
> = {
  "1": { registrations: 180, checkIns: 142, currentActiveRound: 2 },
  "2": { registrations: 450, checkIns: 380, currentActiveRound: 1 },
  "3": { registrations: 64, checkIns: 58, currentActiveRound: 1 },
  "4": { registrations: 24, checkIns: 0, currentActiveRound: 1 },
  "5": { registrations: 75, checkIns: 62, currentActiveRound: 1 },
  "6": { registrations: 120, checkIns: 95, currentActiveRound: 1 },
  "7": { registrations: 30, checkIns: 30, currentActiveRound: 2 },
  "8": { registrations: 200, checkIns: 0, currentActiveRound: 1 },
};

// Mock checked-in user IDs per event (for "Promote" button state)
export const mockCheckedInUserIdsByEventId: Record<string, Set<string>> = {
  "1": new Set(["u1", "u2", "u5", "u6", "u16", "u17", "u18", "u19"]), // Alpha, Gamma, Debug Dynasty, Logic Legends
  "2": new Set(["u7", "u8"]),
  "3": new Set(["u10", "u11"]),
};

export function getMockTeamsForEvent(eventId: string): Team[] {
  return mockTeamsByEventId[eventId] ?? [];
}

export function getMockStatsForEvent(eventId: string) {
  return (
    mockStatsByEventId[eventId] ?? {
      registrations: 0,
      checkIns: 0,
      currentActiveRound: 1,
    }
  );
}

export function getMockCheckedInUserIdsForEvent(eventId: string): Set<string> {
  return mockCheckedInUserIdsByEventId[eventId] ?? new Set();
}
