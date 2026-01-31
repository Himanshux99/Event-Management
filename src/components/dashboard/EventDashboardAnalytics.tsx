import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { NeuCard } from "@/components/ui/NeuCard";
import type { Team, TeamStatus } from "@/types/dashboard";
import { TEAM_STATUS_LABELS } from "@/types/dashboard";

const ACTIVE_STATUSES = new Set<TeamStatus>(["registered", "checked_in", "qualified"]);

const STATUS_COLORS: Record<TeamStatus, string> = {
  registered: "hsl(var(--chart-1))",
  checked_in: "hsl(var(--primary))",
  qualified: "hsl(var(--chart-2))",
  eliminated: "hsl(var(--destructive))",
  waitlisted: "hsl(var(--chart-3))",
  disqualified: "hsl(var(--muted-foreground))",
};

interface EventDashboardAnalyticsProps {
  teams: Team[];
  registrationsCount: number;
  checkInsCount: number;
  attendanceOverTime: { time: string; count: number; total: number }[];
}

export function EventDashboardAnalytics({
  teams,
  registrationsCount,
  checkInsCount,
  attendanceOverTime,
}: EventDashboardAnalyticsProps) {
  const funnelData = useMemo(() => {
    const registered = teams.filter((t) => t.status === "registered").length;
    const checkedIn = teams.filter((t) => t.status === "checked_in").length;
    const qualified = teams.filter((t) => t.status === "qualified").length;
    const eliminated = teams.filter((t) => t.status === "eliminated").length;
    return [
      { name: "Registered", value: registered, fill: "var(--chart-1)" },
      { name: "Checked-in", value: checkedIn, fill: "hsl(var(--primary))" },
      { name: "Qualified", value: qualified, fill: "var(--chart-2)" },
      { name: "Eliminated", value: eliminated, fill: "hsl(var(--destructive))" },
    ].filter((d) => d.value > 0);
  }, [teams]);

  const teamsPerRoundData = useMemo(() => {
    const byRound: Record<number, number> = {};
    teams.forEach((t) => {
      const r = t.currentRound ?? 0;
      if (ACTIVE_STATUSES.has(t.status)) byRound[r] = (byRound[r] ?? 0) + 1;
    });
    return Object.entries(byRound)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([round, count]) => ({ round: `Round ${round}`, count }));
  }, [teams]);

  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    teams.forEach((t) => {
      const s = t.status ?? "registered";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: TEAM_STATUS_LABELS[status as TeamStatus] ?? status,
      value,
      fill: STATUS_COLORS[status as TeamStatus] ?? "hsl(var(--muted))",
    })).filter((d) => d.value > 0);
  }, [teams]);

  const attendanceRate = registrationsCount > 0 ? Math.round((checkInsCount / registrationsCount) * 100) : 0;
  const qualifiedCount = teams.filter((t) => t.status === "qualified").length;
  const waitlistedCount = teams.filter((t) => t.status === "waitlisted").length;
  const eliminatedCount = teams.filter((t) => t.status === "eliminated" || t.status === "disqualified").length;
  const waitlistConversion = teams.length > 0 && waitlistedCount + qualifiedCount > 0
    ? Math.round((qualifiedCount / (waitlistedCount + qualifiedCount)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Insights panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NeuCard variant="static" className="p-4">
          <p className="text-xs text-muted-foreground font-semibold">Attendance rate</p>
          <p className="text-2xl font-bold">{attendanceRate}%</p>
        </NeuCard>
        <NeuCard variant="static" className="p-4">
          <p className="text-xs text-muted-foreground font-semibold">Drop-off (eliminated)</p>
          <p className="text-2xl font-bold">{eliminatedCount}</p>
        </NeuCard>
        <NeuCard variant="static" className="p-4">
          <p className="text-xs text-muted-foreground font-semibold">Waitlist conversion</p>
          <p className="text-2xl font-bold">{waitlistConversion}%</p>
        </NeuCard>
        <NeuCard variant="static" className="p-4">
          <p className="text-xs text-muted-foreground font-semibold">Qualified teams</p>
          <p className="text-2xl font-bold">{qualifiedCount}</p>
        </NeuCard>
      </div>

      {/* Registration funnel */}
      {funnelData.length > 0 && (
        <NeuCard variant="static" className="p-4">
          <h3 className="font-bold text-lg mb-4">Registration funnel</h3>
          <ChartContainer config={funnelConfig} className="h-[240px] w-full">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </NeuCard>
      )}

      {/* Teams per round */}
      {teamsPerRoundData.length > 0 && (
        <NeuCard variant="static" className="p-4">
          <h3 className="font-bold text-lg mb-4">Teams per round</h3>
          <ChartContainer config={barConfig} className="h-[240px] w-full">
            <BarChart data={teamsPerRoundData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </NeuCard>
      )}

      {/* Attendance over time */}
      {attendanceOverTime.length > 0 && (
        <NeuCard variant="static" className="p-4">
          <h3 className="font-bold text-lg mb-4">Check-ins over time</h3>
          <ChartContainer config={lineConfig} className="h-[240px] w-full">
            <AreaChart data={attendanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
            </AreaChart>
          </ChartContainer>
        </NeuCard>
      )}

      {/* Status distribution pie */}
      {statusPieData.length > 0 && (
        <NeuCard variant="static" className="p-4">
          <h3 className="font-bold text-lg mb-4">Status distribution</h3>
          <ChartContainer config={pieConfig} className="h-[280px] w-full">
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        </NeuCard>
      )}

      {funnelData.length === 0 && teamsPerRoundData.length === 0 && statusPieData.length === 0 && (
        <NeuCard variant="static" className="p-8 text-center text-muted-foreground">
          No analytics data yet. Teams and check-ins will appear here in real time.
        </NeuCard>
      )}
    </div>
  );
}

const funnelConfig = {
  value: { label: "Count" },
  name: { label: "Stage" },
};
const barConfig = {
  count: { label: "Teams" },
  round: { label: "Round" },
};
const lineConfig = {
  total: { label: "Check-ins" },
  time: { label: "Time" },
};
const pieConfig = {
  value: { label: "Teams" },
};