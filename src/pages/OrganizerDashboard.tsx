import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { mockEvents } from "@/data/mockEvents";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Settings,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Mock organizer's events
const organizerEvents = mockEvents.slice(0, 5);

const stats = [
  { label: "Total Events", value: "12", icon: Calendar, color: "bg-primary" },
  { label: "Total Registrations", value: "1,234", icon: Users, color: "bg-secondary" },
  { label: "Check-ins Today", value: "89", icon: QrCode, color: "bg-accent" },
  { label: "Avg Attendance", value: "85%", icon: TrendingUp, color: "bg-success" },
];

export default function OrganizerDashboard() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <NeuBadge variant="secondary" className="mb-4">
              <Settings className="w-4 h-4 mr-1" />
              Organizer Dashboard
            </NeuBadge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, Organizer!</h1>
            <p className="text-muted-foreground">
              Manage your events, track registrations, and control check-ins
            </p>
          </div>
          <Link to="/organizer/create">
            <NeuButton variant="primary" size="lg">
              <Plus className="w-5 h-5" />
              Create Event
            </NeuButton>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <NeuCard key={index} variant="static" className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </NeuCard>
          ))}
        </motion.div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NeuCard variant="static" padding="none">
            <div className="p-6 border-b-[3px] border-foreground">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Events</h2>
                <NeuButton variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold">Event</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Registrations</th>
                    <th className="text-left p-4 font-semibold">Check-ins</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizerEvents.map((event, index) => (
                    <tr key={event.id} className="border-b border-foreground/10 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{event.date}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </td>
                      <td className="p-4">
                        <EventStatusBadge status={event.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{event.registeredCount}</span>
                          <span className="text-muted-foreground">/ {event.maxCapacity}</span>
                        </div>
                        <div className="w-24 h-2 bg-muted rounded-full mt-1 border border-foreground/20">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(event.registeredCount / event.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{Math.floor(event.registeredCount * 0.7)}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({Math.floor((event.registeredCount * 0.7 / event.registeredCount) * 100)}%)
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/organizer/events/${event.id}`}>
                            <NeuButton variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </NeuButton>
                          </Link>
                          <Link to={`/organizer/events/${event.id}/scan`}>
                            <NeuButton variant="primary" size="sm">
                              <QrCode className="w-4 h-4" />
                            </NeuButton>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {organizerEvents.map((event) => (
                <NeuCard key={event.id} variant="flat" padding="sm" className="border-2 border-foreground/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold">{event.registeredCount}</span>
                      <span className="text-muted-foreground"> / {event.maxCapacity} registered</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/organizer/events/${event.id}`}>
                        <NeuButton variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </NeuButton>
                      </Link>
                      <Link to={`/organizer/events/${event.id}/scan`}>
                        <NeuButton variant="primary" size="sm">
                          <QrCode className="w-4 h-4" />
                        </NeuButton>
                      </Link>
                    </div>
                  </div>
                </NeuCard>
              ))}
            </div>
          </NeuCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold">Create New Event</p>
              <p className="text-sm text-muted-foreground">Start from scratch</p>
            </div>
          </NeuCard>

          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <QrCode className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-bold">Start Scanning</p>
              <p className="text-sm text-muted-foreground">Check-in attendees</p>
            </div>
          </NeuCard>

          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold">View Analytics</p>
              <p className="text-sm text-muted-foreground">Attendance reports</p>
            </div>
          </NeuCard>
        </motion.div>
      </div>
    </Layout>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "primary" }> = {
    "upcoming": { label: "Upcoming", variant: "default" },
    "registration-open": { label: "Open", variant: "success" },
    "registration-closed": { label: "Reg. Closed", variant: "warning" },
    "live": { label: "Live", variant: "destructive" },
    "closed": { label: "Ended", variant: "default" },
  };

  const { label, variant } = config[status] || config["upcoming"];

  return (
    <NeuBadge variant={variant} size="sm">
      {label}
    </NeuBadge>
  );
}
