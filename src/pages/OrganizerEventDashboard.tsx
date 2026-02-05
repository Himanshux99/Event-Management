import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Users,
  QrCode,
  BarChart3,
  Clock,
  LayoutDashboard,
  UsersRound,
  Trophy,
  ArrowLeft,
  Loader,
  ChevronRight,
  Megaphone,
  TrendingUp,
  ArrowUp,
  XCircle,
  Ban,
  ListOrdered,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { seedEventSampleData } from "@/service/seedEventSampleData";
import { eventDB, teamDB, eventUpdatesDB, paymentDB } from "@/lib/firebaseDB";
import { where, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Team, TeamStatus, DashboardTab, EventUpdate, EventUpdateType } from "@/types/dashboard";
import { TEAM_STATUS_ORDER, TEAM_STATUS_LABELS } from "@/types/dashboard";
import { EventDashboardAnalytics } from "@/components/dashboard/EventDashboardAnalytics";

function TeamStatusBadge({ status }: { status?: TeamStatus | string }) {
  const s = (status ?? "registered") as TeamStatus;
  const labels: Record<TeamStatus, string> = TEAM_STATUS_LABELS;
  const config: Record<TeamStatus, "default" | "success" | "warning" | "destructive" | "primary"> = {
    registered: "default",
    checked_in: "primary",
    qualified: "success",
    eliminated: "destructive",
    waitlisted: "warning",
    disqualified: "destructive",
  };
  return <NeuBadge variant={config[s] ?? "default"} size="sm">{labels[s] ?? s}</NeuBadge>;
}

export default function OrganizerEventDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const isMobile = useIsMobile();
  const currentEventId = eventId ?? null;

  const [eventTitle, setEventTitle] = useState("");
  const [eventRounds, setEventRounds] = useState<{ totalRounds?: number; currentRound?: number; maxTeamsPerRound?: number[] }>({});
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [checkInsCount, setCheckInsCount] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [checkedInUserIds, setCheckedInUserIds] = useState<Set<string>>(new Set());
  const [attendanceSnap, setAttendanceSnap] = useState<{ time: number; userId: string }[]>([]);
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [paidRegistrationsCount, setPaidRegistrationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateType, setUpdateType] = useState<EventUpdateType>("announcement");
  const [isSeeding, setIsSeeding] = useState(false);

  // Event doc for title + rounds
  useEffect(() => {
    if (!currentEventId) return;
    const unsub = () => {};
    eventDB.getById(currentEventId).then((event) => {
      if (event) {
        setEventTitle((event as { title?: string }).title ?? currentEventId);
        setEventRounds({
          totalRounds: (event as { totalRounds?: number }).totalRounds,
          currentRound: (event as { currentRound?: number }).currentRound,
          maxTeamsPerRound: (event as { maxTeamsPerRound?: number[] }).maxTeamsPerRound,
        });
      }
    });
    return unsub;
  }, [currentEventId]);

  // Real-time: registrations, attendance, teams, event updates
  useEffect(() => {
    if (!currentEventId) {
      setLoading(false);
      return;
    }
    const regsRef = collection(db, "registrations");
    const regsQ = query(regsRef, where("eventId", "==", currentEventId));
    const unsubRegs = onSnapshot(regsQ, (snap) => setRegistrationsCount(snap.size));

    const attRef = collection(db, "attendance");
    const attQ = query(attRef, where("eventId", "==", currentEventId));
    const unsubAtt = onSnapshot(attQ, (snap) => {
      setCheckInsCount(snap.size);
      const ids = new Set(snap.docs.map((d) => (d.data().userId as string) ?? "").filter(Boolean));
      setCheckedInUserIds(ids);
      setAttendanceSnap(
        snap.docs.map((d) => {
          const data = d.data();
          const t = data.checkedInAt && typeof (data.checkedInAt as { toMillis?: () => number }).toMillis === "function"
            ? (data.checkedInAt as { toMillis: () => number }).toMillis()
            : Date.now();
          return { time: t, userId: (data.userId as string) ?? "" };
        })
      );
    });

    const teamsRef = collection(db, "teams");
    const teamsQ = query(teamsRef, where("eventId", "==", currentEventId));
    const unsubTeams = onSnapshot(teamsQ, (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Team)));
      setLoading(false);
    });

    const updatesRef = collection(db, "eventUpdates");
    const updatesQ = query(updatesRef, where("eventId", "==", currentEventId));
    const unsubUpdates = onSnapshot(updatesQ, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventUpdate));
      list.sort((a, b) => {
        const aAt = a.createdAt && typeof (a.createdAt as { toMillis?: () => number }).toMillis === "function" ? (a.createdAt as { toMillis: () => number }).toMillis() : 0;
        const bAt = b.createdAt && typeof (b.createdAt as { toMillis?: () => number }).toMillis === "function" ? (b.createdAt as { toMillis: () => number }).toMillis() : 0;
        return bAt - aAt;
      });
      setUpdates(list);
    });

    // Real-time: collected amount from payments
    const unsubPayments = paymentDB.subscribeToCollectedAmount(currentEventId, async (amount) => {
      setCollectedAmount(amount);
      const paidCount = await paymentDB.getCountByEvent(currentEventId);
      setPaidRegistrationsCount(paidCount);
    });

    return () => {
      unsubRegs();
      unsubAtt();
      unsubTeams();
      unsubUpdates();
      unsubPayments();
    };
  }, [currentEventId]);

  const currentActiveRound = useMemo(() => {
    if (teams.length === 0) return eventRounds.currentRound ?? 1;
    return Math.max(eventRounds.currentRound ?? 1, ...teams.map((t) => t.currentRound ?? 0));
  }, [teams, eventRounds.currentRound]);

  const teamsPerRound = useMemo(() => {
    const map: Record<number, number> = {};
    teams.forEach((t) => {
      const r = t.currentRound ?? 0;
      if (["registered", "checked_in", "qualified"].includes(t.status)) map[r] = (map[r] ?? 0) + 1;
    });
    return map;
  }, [teams]);

  const attendanceOverTime = useMemo(() => {
    const sorted = [...attendanceSnap].sort((a, b) => a.time - b.time);
    if (sorted.length === 0) return [];
    const buckets: { time: string; count: number; total: number }[] = [];
    let total = 0;
    const bucketMs = 15 * 60 * 1000;
    let bucketStart = Math.floor(sorted[0].time / bucketMs) * bucketMs;
    sorted.forEach(({ time }) => {
      const key = Math.floor(time / bucketMs) * bucketMs;
      while (bucketStart < key) {
        buckets.push({
          time: new Date(bucketStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          count: 0,
          total,
        });
        bucketStart += bucketMs;
      }
      total += 1;
      buckets.push({
        time: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        count: 1,
        total,
      });
      bucketStart = key + bucketMs;
    });
    return buckets.length > 20 ? buckets.filter((_, i) => i % Math.ceil(buckets.length / 20) === 0) : buckets;
  }, [attendanceSnap]);

  const isTeamCheckedIn = (team: Team): boolean => {
    const members = team.members ?? [];
    return members.some((m) => {
      const id = (m as { userId?: string }).userId ?? "";
      return id && checkedInUserIds.has(id);
    });
  };

  const canPromote = (team: Team) =>
    team.status === "checked_in" && isTeamCheckedIn(team);

  const promoteTeam = async (team: Team) => {
    if (!currentEventId) return;
    if (!canPromote(team)) {
      toast.error("Only checked-in teams can be promoted.");
      return;
    }
    try {
      const result = await teamDB.promote(currentEventId, team.id, { currentRound: team.currentRound ?? 0, status: team.status });
      if (result.promoted) toast.success(`${team.name} promoted to round ${result.newRound}`);
      else toast.info(`${team.name} moved to waitlist (round full)`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to promote team");
    }
  };

  const eliminateTeam = async (team: Team) => {
    if (!currentEventId) return;
    try {
      await teamDB.eliminate(team.id, currentEventId);
      toast.success(`${team.name} eliminated`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to eliminate team");
    }
  };

  const disqualifyTeam = async (team: Team) => {
    if (!currentEventId) return;
    try {
      await teamDB.disqualify(team.id, currentEventId);
      toast.success(`${team.name} disqualified`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to disqualify team");
    }
  };

  const moveToWaitlist = async (team: Team) => {
    try {
      await teamDB.moveToWaitlist(team.id);
      toast.success(`${team.name} moved to waitlist`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to move to waitlist");
    }
  };

  const addSampleData = async () => {
    if (!currentEventId) return;
    setIsSeeding(true);
    try {
      const result = await seedEventSampleData(currentEventId);
      toast.success(`Added ${result.teams} teams, ${result.attendance} check-ins, ${result.registrations} registrations.`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add sample data");
    } finally {
      setIsSeeding(false);
    }
  };

  const postUpdate = async () => {
    if (!currentEventId || !updateMessage.trim()) return;
    try {
      await eventUpdatesDB.create(currentEventId, { message: updateMessage.trim(), type: updateType });
      setUpdateMessage("");
      toast.success("Update posted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to post update");
    }
  };

  const navItems: { tab: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
    { tab: "overview", label: "Overview", icon: LayoutDashboard },
    { tab: "teams", label: "Teams", icon: UsersRound },
    { tab: "rounds", label: "Rounds", icon: Trophy },
    { tab: "updates", label: "Updates", icon: Megaphone },
    { tab: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  if (!currentEventId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <NeuCard variant="static" className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No event selected.</p>
            <Link to="/organizer">
              <NeuButton variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Back to events
              </NeuButton>
            </Link>
          </NeuCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <Link to="/organizer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              All events
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{eventTitle || currentEventId}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{eventTitle || "Event"}</h1>
              <p className="text-muted-foreground text-sm md:text-base">Event dashboard · teams, check-ins, rounds</p>
            </div>
            <NeuButton
              variant="outline"
              size="sm"
              onClick={addSampleData}
              disabled={isSeeding}
              className="shrink-0"
            >
              {isSeeding ? <Loader className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isSeeding ? "Adding…" : "Add sample data"}
            </NeuButton>
          </motion.div>

          {!isMobile && (
            <div className="mb-6 flex flex-wrap items-center gap-1 p-1 rounded-xl border-2 border-foreground bg-card shadow-neu-sm w-fit">
              {navItems.map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab ? "bg-primary text-primary-foreground shadow-neu-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
          {isMobile && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DashboardTab)} className="mb-6">
              <TabsList className="flex flex-wrap gap-1 rounded-xl border-2 border-foreground p-1 bg-card">
                {navItems.map(({ tab, label }) => (
                  <TabsTrigger key={tab} value={tab} className="rounded-lg font-semibold text-xs flex-1 min-w-[80px]">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader className="w-6 h-6 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <NeuCard variant="static" className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-secondary shadow-neu-sm flex items-center justify-center">
                        <Users className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{registrationsCount}</p>
                        <p className="text-xs text-muted-foreground">Total registrations</p>
                      </div>
                    </NeuCard>
                    <NeuCard variant="static" className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-accent shadow-neu-sm flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{checkInsCount}</p>
                        <p className="text-xs text-muted-foreground">Total check-ins</p>
                      </div>
                    </NeuCard>
                    <NeuCard variant="static" className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-primary shadow-neu-sm flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teams.length}</p>
                        <p className="text-xs text-muted-foreground">Total teams</p>
                      </div>
                    </NeuCard>
                    <NeuCard variant="static" className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-success shadow-neu-sm flex items-center justify-center">
                        <Clock className="w-6 h-6 text-success-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{currentActiveRound}</p>
                        <p className="text-xs text-muted-foreground">Current round</p>
                      </div>
                    </NeuCard>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="font-semibold">Teams per round</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(teamsPerRound)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([round, count]) => (
                          <NeuBadge key={round} variant="secondary">
                            Round {round}: {count}
                          </NeuBadge>
                        ))}
                      {Object.keys(teamsPerRound).length === 0 && (
                        <span className="text-sm text-muted-foreground">No teams in rounds yet</span>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to={`/organizer/attendance?eventId=${currentEventId}`} className="block">
                      <NeuCard className="flex items-center gap-4 p-4 hover:shadow-neu transition-shadow cursor-pointer">
                        <div className="w-12 h-12 rounded-xl border-2 border-foreground bg-accent flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-bold">Scan attendance</p>
                          <p className="text-sm text-muted-foreground">Check-in for this event</p>
                        </div>
                      </NeuCard>
                    </Link>
                    <Link to={`/events/${currentEventId}`} className="block">
                      <NeuCard className="flex items-center gap-4 p-4 hover:shadow-neu transition-shadow cursor-pointer">
                        <div className="w-12 h-12 rounded-xl border-2 border-foreground bg-secondary flex items-center justify-center">
                          <UsersRound className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-bold">View public page</p>
                          <p className="text-sm text-muted-foreground">Event details</p>
                        </div>
                      </NeuCard>
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === "teams" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Teams</h2>
                    <span className="text-sm text-muted-foreground">{teams.length} teams</span>
                  </div>
                  {teams.length === 0 ? (
                    <NeuCard variant="static" className="p-8 text-center">
                      <UsersRound className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No teams for this event yet.</p>
                    </NeuCard>
                  ) : (
                    TEAM_STATUS_ORDER.map((status) => {
                      const teamsInStatus = teams.filter((t) => (t.status ?? "registered") === status);
                      if (teamsInStatus.length === 0) return null;
                      const isWaitlisted = status === "waitlisted";
                      return (
                        <div key={status} className="space-y-4">
                          <div className="flex items-center gap-2 border-b-2 border-foreground pb-2">
                            <TeamStatusBadge status={status} />
                            <span className="text-sm font-semibold text-muted-foreground">
                              {teamsInStatus.length} team{teamsInStatus.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${isWaitlisted ? "opacity-75" : ""}`}>
                            {teamsInStatus.map((team) => (
                              <NeuCard
                                key={team.id}
                                variant="static"
                                className={`flex flex-col border-2 border-foreground ${isWaitlisted ? "bg-muted/30" : ""}`}
                              >
                                <div className="p-4 border-b-2 border-foreground flex items-center justify-between gap-2">
                                  <p className="font-bold text-lg truncate">{team.name}</p>
                                  <TeamStatusBadge status={team.status} />
                                </div>
                                <div className="p-4 flex-1">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">Round {team.currentRound ?? 0}</p>
                                  <p className="text-sm font-semibold mb-1">Members</p>
                                  <ul className="text-sm space-y-1">
                                    {(team.members ?? []).map((m, i) => {
                                      const member = m as { name?: string; displayName?: string; rollNumber?: string; roll?: string };
                                      return (
                                        <li key={i} className="flex justify-between gap-2">
                                          <span>{member.name ?? member.displayName ?? "—"}</span>
                                          <span className="text-muted-foreground shrink-0">{member.rollNumber ?? member.roll ?? "—"}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div className="p-4 pt-0 space-y-2">
                                  {team.status === "checked_in" && (
                                    <NeuButton
                                      variant="primary"
                                      size="sm"
                                      className="w-full"
                                      disabled={!canPromote(team)}
                                      onClick={() => promoteTeam(team)}
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                      Promote to Next Round
                                    </NeuButton>
                                  )}
                                  {!["eliminated", "disqualified"].includes(team.status) && (
                                    <div className="flex flex-wrap gap-2">
                                      {team.status !== "waitlisted" && (
                                        <NeuButton variant="outline" size="sm" onClick={() => moveToWaitlist(team)}>
                                          <ListOrdered className="w-4 h-4" />
                                          Move to waitlist
                                        </NeuButton>
                                      )}
                                      <NeuButton variant="outline" size="sm" className="text-destructive" onClick={() => eliminateTeam(team)}>
                                        <XCircle className="w-4 h-4" />
                                        Eliminate
                                      </NeuButton>
                                      <NeuButton variant="outline" size="sm" className="text-destructive" onClick={() => disqualifyTeam(team)}>
                                        <Ban className="w-4 h-4" />
                                        Disqualify
                                      </NeuButton>
                                    </div>
                                  )}
                                  {team.status === "checked_in" && !canPromote(team) && (
                                    <p className="text-xs text-muted-foreground text-center">Team must be checked in to promote</p>
                                  )}
                                </div>
                              </NeuCard>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {activeTab === "rounds" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Rounds</h2>
                    <span className="text-sm text-muted-foreground">Current round: {currentActiveRound}</span>
                  </div>
                  {(() => {
                    const byRound = teams.reduce<Record<number, Team[]>>((acc, t) => {
                      const r = t.currentRound ?? 0;
                      if (!acc[r]) acc[r] = [];
                      acc[r].push(t);
                      return acc;
                    }, {});
                    const roundNumbers = Object.keys(byRound).map(Number).sort((a, b) => a - b);
                    if (roundNumbers.length === 0) {
                      return (
                        <NeuCard variant="static" className="p-8 text-center">
                          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">No round data yet.</p>
                        </NeuCard>
                      );
                    }
                    return (
                      <div className="space-y-6">
                        {roundNumbers.map((roundNum) => (
                          <NeuCard key={roundNum} variant="static" padding="none">
                            <div className="p-4 border-b-2 border-foreground bg-muted/50">
                              <h3 className="font-bold text-lg">Round {roundNum}</h3>
                              <p className="text-sm text-muted-foreground">{byRound[roundNum].length} team(s)</p>
                            </div>
                            <ul className="divide-y-2 divide-foreground/10">
                              {byRound[roundNum].map((team) => (
                                <li key={team.id} className="flex items-center justify-between gap-4 p-4">
                                  <div>
                                    <p className="font-semibold">{team.name}</p>
                                    <TeamStatusBadge status={team.status} />
                                  </div>
                                  <span className="text-sm text-muted-foreground">{(team.members ?? []).length} member(s)</span>
                                </li>
                              ))}
                            </ul>
                          </NeuCard>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {activeTab === "updates" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h2 className="text-xl font-bold">Event updates</h2>
                  <NeuCard variant="static" className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Post update</label>
                      <select
                        value={updateType}
                        onChange={(e) => setUpdateType(e.target.value as EventUpdateType)}
                        className="w-full max-w-xs rounded-lg border-2 border-foreground bg-card px-3 py-2 text-sm mb-2"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="venue_change">Venue change</option>
                        <option value="delay">Delay</option>
                      </select>
                      <textarea
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        placeholder="Message..."
                        className="w-full rounded-lg border-2 border-foreground bg-card px-3 py-2 text-sm min-h-[80px]"
                        rows={3}
                      />
                      <NeuButton variant="primary" size="sm" className="mt-2" onClick={postUpdate} disabled={!updateMessage.trim()}>
                        Post update
                      </NeuButton>
                    </div>
                  </NeuCard>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Recent updates</h3>
                    {updates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No updates yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {updates.map((u) => (
                          <NeuCard key={u.id} variant="static" className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <NeuBadge variant="outline" size="sm">{u.type}</NeuBadge>
                            </div>
                            <p className="text-sm">{u.message}</p>
                          </NeuCard>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <EventDashboardAnalytics
                    teams={teams}
                    registrationsCount={registrationsCount}
                    checkInsCount={checkInsCount}
                    attendanceOverTime={attendanceOverTime}
                    collectedAmount={collectedAmount}
                    paidRegistrationsCount={paidRegistrationsCount}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
