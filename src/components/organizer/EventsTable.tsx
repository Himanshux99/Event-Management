import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { Link } from "react-router-dom";
import { Edit, Play, Pause, Eye, QrCode, ArrowRight, Calendar, Loader } from "lucide-react";
import EventStatusBadge from "@/components/organizer/EventStatusBadge";

export default function EventsTable({ events, loading, onToggleRegistration }: { events: any[]; loading: boolean; onToggleRegistration: (id: string, status: string) => void }) {
  return (
    <>
      <NeuCard variant="static" padding="none">
        <div className="p-6 border-b-[3px] border-foreground">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Published Events</h2>
            <NeuButton variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4" />
            </NeuButton>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading your events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No published events yet</p>
            <Link to="/organizer/create-event">
              <NeuButton variant="primary">
                <Play className="w-4 h-4" />
                Create Your First Event
              </NeuButton>
            </Link>
          </div>
        ) : (
          <>
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
                  {events.map((event) => (
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
                          <span className="font-semibold">{event.registeredCount || 0}</span>
                          <span className="text-muted-foreground">/ {event.maxCapacity}</span>
                        </div>
                        <div className="w-24 h-2 bg-muted rounded-full mt-1 border border-foreground/20">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${((event.registeredCount || 0) / event.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{Math.floor((event.registeredCount || 0) * 0.7)}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({event.registeredCount ? Math.floor(((event.registeredCount * 0.7) / event.registeredCount) * 100) : 0}%)
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/organizer/edit-draft/${event.id}`}>
                            <NeuButton variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </NeuButton>
                          </Link>
                          <NeuButton
                            variant={event.status === "registration-open" ? "accent" : "outline"}
                            size="sm"
                            onClick={() => onToggleRegistration(event.id, event.status)}
                          >
                            {event.status === "registration-open" ? (
                              <>
                                <Pause className="w-4 h-4" />
                                Close
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Open
                              </>
                            )}
                          </NeuButton>
                          <Link to={`/organizer/event/${event.id}`}>
                            <NeuButton variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </NeuButton>
                          </Link>
                          <Link to={`/organizer/attendance/${event.id}`}>
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

            <div className="md:hidden p-4 space-y-4">
              {events.map((event) => (
                <NeuCard key={event.id} variant="flat" padding="sm" className="border-2 border-foreground/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">
                      <span className="font-semibold">{event.registeredCount || 0}</span>
                      <span className="text-muted-foreground"> / {event.maxCapacity} registered</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/organizer/edit-draft/${event.id}`} className="flex-1">
                      <NeuButton variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4" />
                      </NeuButton>
                    </Link>
                    <NeuButton
                      variant={event.status === "registration-open" ? "accent" : "outline"}
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-1"
                      onClick={() => onToggleRegistration(event.id, event.status)}
                    >
                      {event.status === "registration-open" ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Close
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Open
                        </>
                      )}
                    </NeuButton>
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <NeuButton variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4" />
                      </NeuButton>
                    </Link>
                    <Link to={`/organizer/attendance/${event.id}`} className="flex-1">
                      <NeuButton variant="primary" size="sm" className="w-full">
                        <QrCode className="w-4 h-4" />
                      </NeuButton>
                    </Link>
                  </div>
                </NeuCard>
              ))}
            </div>
          </>
        )}
      </NeuCard>
    </>
  );
}
