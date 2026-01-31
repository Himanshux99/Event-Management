import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Venue = { id: string; name: string; hasClash?: boolean; clashEvent?: string };

export default function BasicInfo({
  eventTitle,
  setEventTitle,
  eventType,
  setEventType,
  isInterCollege,
  setIsInterCollege,
  date,
  setDate,
  time,
  setTime,
  startTime,
  setStartTime,
  duration,
  setDuration,
  venue,
  setVenue,
  venues,
}: any) {
  const selectedVenue = venues.find((v: Venue) => v.id === venue);

  return (
    <div className="space-y-6">
      <NeuCard variant="static">
        <h2 className="text-xl font-bold text-foreground mb-6">Basic Information</h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Event Title <span className="text-destructive">*</span></Label>
            <input value={eventTitle || ""} placeholder="Tech-Fest" onChange={(e) => setEventTitle(e.target.value)} className="w-full h-12 px-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Event Type <span className="text-destructive">*</span></Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Event Scope</Label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsInterCollege(false)} className={cn("flex-1 h-12 px-4 font-semibold border-[3px] border-foreground rounded-[12px] transition-all", !isInterCollege ? "bg-primary text-primary-foreground shadow-neu" : "bg-card text-foreground hover:bg-muted")}>Intra-College</button>
              <button type="button" onClick={() => setIsInterCollege(true)} className={cn("flex-1 h-12 px-4 font-semibold border-[3px] border-foreground rounded-[12px] transition-all", isInterCollege ? "bg-accent text-accent-foreground shadow-neu" : "bg-card text-foreground hover:bg-muted")}>Inter-College</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("w-full h-12 px-4 flex items-center justify-between bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium text-left", !date && "text-muted-foreground")}>
                    {date ? format(date, "PPP") : "Pick a date"}
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50" align="start">
                  <CalendarUI mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Time <span className="text-destructive">*</span></Label>
              <div className="relative">
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-12 px-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu pr-10" />
                {/* <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" /> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold">Start Time</Label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full h-12 px-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu pr-10" />
            </div>
            <div>
              <Label className="text-base font-semibold">Duration (Minutes)</Label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-12 px-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu">
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Venue <span className="text-destructive">*</span></Label>
            <Select value={venue} onValueChange={setVenue}>
              <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                {venues.map((v: Venue) => (
                  <SelectItem key={v.id} value={v.id} className="font-medium hover:bg-muted cursor-pointer">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVenue?.hasClash && (
              <div className="flex items-center gap-3 p-3 bg-warning/20 border-[3px] border-warning rounded-[12px]">
                <div>
                  <p className="font-semibold text-foreground text-sm">Venue Clash Detected!</p>
                  <p className="text-sm text-muted-foreground">"{selectedVenue.clashEvent}" is scheduled at this venue on the selected date.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </NeuCard>
    </div>
  );
}
