/**
 * Campus Event Management — Dashboard & Firestore types.
 * Teams, events, attendance, eventUpdates. Strictly typed, no mock.
 */

// Firestore: teams.status (lowercase snake_case)
export type TeamStatus =
  | "registered"
  | "checked_in"
  | "qualified"
  | "eliminated"
  | "waitlisted"
  | "disqualified";

export interface TeamMember {
  name: string;
  rollNumber: string;
  userId: string;
  /** Optional for backward compat; prefer userId */
  id?: string;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  members: TeamMember[];
  status: TeamStatus;
  currentRound: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Event document fields for rounds
export interface EventRoundsConfig {
  totalRounds?: number;
  currentRound?: number;
  /** Max teams per round: [round1, round2, ...] */
  maxTeamsPerRound?: number[];
}

export interface EventSummary {
  id: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  status?: string;
  organizerId?: string;
  maxCapacity?: number;
  registeredCount?: number;
}

export type EventWithRounds = EventSummary & EventRoundsConfig;

export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: unknown;
}

// Phase 2: eventUpdates collection
export type EventUpdateType = "venue_change" | "announcement" | "delay";

export interface EventUpdate {
  id: string;
  eventId: string;
  message: string;
  type: EventUpdateType;
  createdAt: unknown;
}

export type DashboardTab = "overview" | "teams" | "rounds" | "analytics" | "updates";

/** Order for grouping teams by status in the Teams section (display labels) */
export const TEAM_STATUS_ORDER: TeamStatus[] = [
  "registered",
  "checked_in",
  "qualified",
  "eliminated",
  "waitlisted",
  "disqualified",
];

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  registered: "Registered",
  checked_in: "Checked-in",
  qualified: "Qualified",
  eliminated: "Eliminated",
  waitlisted: "Waitlisted",
  disqualified: "Disqualified",
};
