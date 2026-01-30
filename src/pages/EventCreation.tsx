import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Upload,
  AlertTriangle,
  Users,
  User,
  Trophy,
  FileText,
  MapPin,
  Save,
  Send,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { eventDB } from "@/lib/firebaseDB";
import { useAuth } from "@/context/authContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EventCreationProps {
  initialData?: any;
  draftId?: string;
  isEditingDraft?: boolean;
}

const eventTypes = ["Technical", "Cultural", "Sports", "Workshop"];
const venues = [
  { id: "1", name: "Main Auditorium", hasClash: false },
  { id: "2", name: "Seminar Hall A", hasClash: true, clashEvent: "Tech Talk 2026" },
  { id: "3", name: "Sports Ground", hasClash: false },
  { id: "4", name: "Open Air Theatre", hasClash: false },
  { id: "5", name: "Conference Room B", hasClash: true, clashEvent: "Workshop Series" },
];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"];
const branches = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "All Branches"];
const colleges = ["Host College Only", "Partner Colleges", "All Colleges"];

const EventCreation = ({ initialData, draftId, isEditingDraft }: EventCreationProps) => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.currentUser;

  const initialDate = initialData?.date
    ? parse(initialData.date, "MMM d, yyyy", new Date())
    : undefined;

  const [eventTitle, setEventTitle] = useState(initialData?.title || "");
  const [eventType, setEventType] = useState(initialData?.category?.toLowerCase() || "");
  const [isInterCollege, setIsInterCollege] = useState(initialData?.type === "inter-college");
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState(initialData?.time || "");
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [isTeamEvent, setIsTeamEvent] = useState(!!initialData?.isTeamEvent);
  const [minTeamSize, setMinTeamSize] = useState(String(initialData?.minTeamSize || "2"));
  const [maxTeamSize, setMaxTeamSize] = useState(String(initialData?.maxTeamSize || "4"));
  const [maxRegistrations, setMaxRegistrations] = useState(String(initialData?.maxCapacity || ""));
  const [numberOfRounds, setNumberOfRounds] = useState(String(initialData?.rounds || "1"));
  const [eligibleYear, setEligibleYear] = useState(initialData?.eligibility?.year || "");
  const [eligibleBranch, setEligibleBranch] = useState(initialData?.eligibility?.branch || "");
  const [eligibleCollege, setEligibleCollege] = useState(initialData?.eligibility?.college || "");
  const [prize1st, setPrize1st] = useState(initialData?.prizes?.first || "");
  const [prize2nd, setPrize2nd] = useState(initialData?.prizes?.second || "");
  const [prize3rd, setPrize3rd] = useState(initialData?.prizes?.third || "");
  const [rulebookFile, setRulebookFile] = useState<File | null>(null);
  const [description, setDescription] = useState(initialData?.description || "");
  const [guidelines, setGuidelines] = useState(initialData?.guidelines || "");
  const [contactName, setContactName] = useState(initialData?.contact?.name || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contact?.email || "");
  const [contactPhone, setContactPhone] = useState(initialData?.contact?.phone || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [duration, setDuration] = useState(String(initialData?.duration || "60"));
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState<string[]>(
    Array.isArray(initialData?.volunteers) ? initialData.volunteers : []
  );
  const [userSearch, setUserSearch] = useState("");
  const [allUserEmails, setAllUserEmails] = useState<string[]>([]);

  const selectedVenue = venues.find((v) => v.id === venue);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const emails = snapshot.docs
          .map((doc) => doc.data()?.email as string | undefined)
          .filter(Boolean) as string[];
        setAllUserEmails(emails);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = userSearch
    ? allUserEmails
        .filter(
          (email) =>
            email.toLowerCase().includes(userSearch.toLowerCase()) &&
            !volunteers.includes(email)
        )
        .slice(0, 8)
    : [];

  const addVolunteer = (email: string) => {
    if (!email) return;
    if (volunteers.includes(email)) return;
    setVolunteers([...volunteers, email]);
    setUserSearch("");
  };

  const removeVolunteer = (email: string) => {
    setVolunteers(volunteers.filter((v) => v !== email));
  };

  const handleSaveDraft = async () => {
    if (!eventTitle) {
      toast({
        title: "Missing Event Title",
        description: "Please enter an event title to save as draft.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save drafts.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const draftEvent = {
        title: eventTitle,
        type: isInterCollege ? "inter-college" : "intra-college",
        category: eventType ? eventType.charAt(0).toUpperCase() + eventType.slice(1) : "",
        date: date ? format(date, "MMM d, yyyy") : "",
        time: time,
        startTime: startTime,
        duration: parseInt(duration) || 60,
        venue: selectedVenue?.name || venue,
        maxCapacity: parseInt(maxRegistrations) || 100,
        registeredCount: initialData?.registeredCount || 0,
        isTeamEvent: isTeamEvent,
        minTeamSize: isTeamEvent ? parseInt(minTeamSize) : null,
        maxTeamSize: isTeamEvent ? parseInt(maxTeamSize) : null,
        rounds: parseInt(numberOfRounds) || 1,
        description: description,
        guidelines: guidelines,
        eligibility: {
          year: eligibleYear,
          branch: eligibleBranch,
          college: eligibleCollege,
        },
        prizes: {
          first: prize1st,
          second: prize2nd,
          third: prize3rd,
        },
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
        volunteers,
        coverImage: coverImage,
        organizerId: user.uid,
        organizerEmail: user.email,
        status: 'draft',
      };

      if (isEditingDraft && draftId) {
        // Update existing draft
        await eventDB.update(draftId, draftEvent);
        toast({
          title: "Draft Updated",
          description: "Your event draft has been updated successfully.",
        });
      } else {
        // Create new draft
        await eventDB.create(draftEvent);
        toast({
          title: "Draft Saved",
          description: "Your event has been saved as a draft. You can continue editing later.",
        });
      }

      navigate("/organizer");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!eventTitle || !eventType || !date || !venue) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create an event.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const newEvent = {
        title: eventTitle,
        type: isInterCollege ? "inter-college" : "intra-college",
        category: eventType.charAt(0).toUpperCase() + eventType.slice(1),
        date: format(date, "MMM d, yyyy"),
        time: time,
        startTime: startTime,
        duration: parseInt(duration) || 60,
        venue: selectedVenue?.name || venue,
        maxCapacity: parseInt(maxRegistrations) || 100,
        registeredCount: 0,
        isTeamEvent: isTeamEvent,
        minTeamSize: isTeamEvent ? parseInt(minTeamSize) : null,
        maxTeamSize: isTeamEvent ? parseInt(maxTeamSize) : null,
        rounds: parseInt(numberOfRounds) || 1,
        description: description,
        guidelines: guidelines,
        eligibility: {
          year: eligibleYear,
          branch: eligibleBranch,
          college: eligibleCollege,
        },
        prizes: {
          first: prize1st,
          second: prize2nd,
          third: prize3rd,
        },
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
        volunteers,
        coverImage: coverImage,
        organizerId: user.uid,
        organizerEmail: user.email,
        status: 'published',
      };

      await eventDB.create(newEvent);

      toast({
        title: "Event Published!",
        description: "Your event is now live and visible to participants.",
      });

      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRulebookFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been attached.`,
      });
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
        toast({
          title: "Image Uploaded",
          description: "Cover image has been set.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {isEditingDraft ? "Edit Event Draft" : "Create New Event"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isEditingDraft 
                ? "Continue editing your event draft" 
                : "Fill in the details to create and publish your campus event"}
            </p>
          </div>

          {/* Two Column Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Basic Info Card */}
              <NeuCard variant="static">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </h2>

                <div className="space-y-5">
                  {/* Event Title */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Event Title <span className="text-destructive">*</span>
                    </Label>
                    <NeuInput
                      placeholder="Enter event title..."
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                    />
                  </div>

                  {/* Event Type */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Event Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="h-12 bg-card border-[1px] border-foreground rounded-[12px] shadow-neu font-medium">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[1px] border-foreground rounded-[12px] shadow-neu z-50">
                        {eventTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type.toLowerCase()}
                            className="font-medium hover:bg-muted cursor-pointer"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Inter/Intra College Toggle */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Event Scope</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsInterCollege(false)}
                        className={cn(
                          "flex-1 h-12 px-4 font-semibold border-[1px] border-foreground rounded-[12px] transition-all",
                          !isInterCollege
                            ? "bg-primary text-primary-foreground shadow-neu"
                            : "bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        Intra-College
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInterCollege(true)}
                        className={cn(
                          "flex-1 h-12 px-4 font-semibold border-[3px] border-foreground rounded-[12px] transition-all",
                          isInterCollege
                            ? "bg-accent text-accent-foreground shadow-neu"
                            : "bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        Inter-College
                      </button>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "w-full h-12 px-4 flex items-center justify-between bg-card border-[1px] border-foreground rounded-[12px] shadow-neu font-medium text-left",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date ? format(date, "PPP") : "Pick a date"}
                            <CalendarIcon className="w-5 h-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-card border-[1px] border-foreground rounded-[12px] shadow-neu z-50"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Time <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <NeuInput
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="pr-10"
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Start Time & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Start Time
                      </Label>
                      <div className="relative">
                        <NeuInput
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="pr-10"
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Duration (Minutes)
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                          <SelectItem value="30" className="font-medium hover:bg-muted cursor-pointer">30 mins</SelectItem>
                          <SelectItem value="60" className="font-medium hover:bg-muted cursor-pointer">1 hour</SelectItem>
                          <SelectItem value="90" className="font-medium hover:bg-muted cursor-pointer">1.5 hours</SelectItem>
                          <SelectItem value="120" className="font-medium hover:bg-muted cursor-pointer">2 hours</SelectItem>
                          <SelectItem value="180" className="font-medium hover:bg-muted cursor-pointer">3 hours</SelectItem>
                          <SelectItem value="240" className="font-medium hover:bg-muted cursor-pointer">4 hours</SelectItem>
                          <SelectItem value="300" className="font-medium hover:bg-muted cursor-pointer">5 hours</SelectItem>
                          <SelectItem value="480" className="font-medium hover:bg-muted cursor-pointer">8 hours</SelectItem>
                          <SelectItem value="1440" className="font-medium hover:bg-muted cursor-pointer">Full day (24 hrs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Venue <span className="text-destructive">*</span>
                    </Label>
                    <Select value={venue} onValueChange={setVenue}>
                      <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                        <SelectValue placeholder="Select venue" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                        {venues.map((v) => (
                          <SelectItem
                            key={v.id}
                            value={v.id}
                            className="font-medium hover:bg-muted cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              {v.name}
                              {v.hasClash && (
                                <AlertTriangle className="w-4 h-4 text-warning" />
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Clash Warning */}
                    {selectedVenue?.hasClash && (
                      <div className="flex items-center gap-3 p-3 bg-warning/20 border-[1px] border-warning rounded-[12px]">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            Venue Clash Detected!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            "{selectedVenue.clashEvent}" is scheduled at this
                            venue on the selected date.
                          </p>
                        </div>
                        <NeuBadge variant="warning" size="sm">
                          Conflict
                        </NeuBadge>
                      </div>
                    )}
                  </div>
                </div>
              </NeuCard>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Participation Settings */}
              <NeuCard variant="static">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participation Settings
                </h2>

                <div className="space-y-5">
                  {/* Individual/Team Toggle */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Participation Type
                    </Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsTeamEvent(false)}
                        className={cn(
                          "flex-1 h-12 px-4 font-semibold border-[3px] border-foreground rounded-[12px] transition-all",
                          !isTeamEvent
                            ? "bg-secondary text-secondary-foreground shadow-neu"
                            : "bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        <User className="w-5 h-5" />
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTeamEvent(true)}
                        className={cn(
                          "flex-1 h-12 px-4 font-semibold border-[3px] border-foreground rounded-[12px] transition-all",
                          isTeamEvent
                            ? "bg-secondary text-secondary-foreground shadow-neu"
                            : "bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        <Users className="w-5 h-5" />
                        Team
                      </button>
                    </div>
                  </div>

                  {/* Team Size Fields */}
                  {isTeamEvent && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 border-[1px] border-foreground rounded-[12px]">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Min Team Size
                        </Label>
                        <NeuInput
                          type="number"
                          min="2"
                          value={minTeamSize}
                          onChange={(e) => setMinTeamSize(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Max Team Size
                        </Label>
                        <NeuInput
                          type="number"
                          min="2"
                          value={maxTeamSize}
                          onChange={(e) => setMaxTeamSize(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Max Registrations */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Maximum Registrations
                    </Label>
                    <NeuInput
                      type="number"
                      placeholder="e.g., 100"
                      value={maxRegistrations}
                      onChange={(e) => setMaxRegistrations(e.target.value)}
                    />
                  </div>

                  {/* Number of Rounds */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Number of Rounds
                    </Label>
                    <NeuInput
                      type="number"
                      min="1"
                      value={numberOfRounds}
                      onChange={(e) => setNumberOfRounds(e.target.value)}
                    />
                  </div>
                </div>
              </NeuCard>

              {/* Eligibility Rules */}
              <NeuCard variant="static">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Eligibility Rules
                </h2>

                <div className="space-y-5">
                  {/* Year */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Eligible Year
                    </Label>
                    <Select value={eligibleYear} onValueChange={setEligibleYear}>
                      <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                        <SelectValue placeholder="Select eligible years" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                        {years.map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toLowerCase().replace(" ", "-")}
                            className="font-medium hover:bg-muted cursor-pointer"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Eligible Branch
                    </Label>
                    <Select
                      value={eligibleBranch}
                      onValueChange={setEligibleBranch}
                    >
                      <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                        <SelectValue placeholder="Select eligible branches" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch}
                            value={branch.toLowerCase().replace(" ", "-")}
                            className="font-medium hover:bg-muted cursor-pointer"
                          >
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* College */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Eligible Colleges
                    </Label>
                    <Select
                      value={eligibleCollege}
                      onValueChange={setEligibleCollege}
                    >
                      <SelectTrigger className="h-12 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium">
                        <SelectValue placeholder="Select eligible colleges" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[3px] border-foreground rounded-[12px] shadow-neu z-50">
                        {colleges.map((college) => (
                          <SelectItem
                            key={college}
                            value={college.toLowerCase().replace(" ", "-")}
                            className="font-medium hover:bg-muted cursor-pointer"
                          >
                            {college}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </NeuCard>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="space-y-6">
            {/* Event Description Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Event Description
              </h2>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Description (Long Text)
                </Label>
                <textarea
                  placeholder="Write a detailed description of your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] p-4 bg-card border-[1px] border-foreground rounded-[12px] shadow-neu font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </NeuCard>

            {/* Guidelines Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                General Guidelines
              </h2>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Rules & Guidelines (Bullet Format)
                </Label>
                <textarea
                  placeholder="Enter guidelines in bullet format:&#10;• First guideline&#10;• Second guideline&#10;• Third guideline"
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full min-h-[120px] p-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </NeuCard>

            {/* Contact Information Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Organizer Name
                  </Label>
                  <NeuInput
                    placeholder="Enter organizer name..."
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Email Address
                  </Label>
                  <NeuInput
                    type="email"
                    placeholder="Enter email address..."
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Phone Number
                  </Label>
                  <NeuInput
                    type="tel"
                    placeholder="Enter phone number..."
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </NeuCard>

            {/* Volunteers Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Volunteers
              </h2>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Search user by email</Label>
                <div className="relative">
                  <NeuInput
                    placeholder="Type email to search..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {filteredUsers.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full bg-card border-[3px] border-foreground rounded-[12px] shadow-neu max-h-48 overflow-auto">
                      {filteredUsers.map((email) => (
                        <button
                          key={email}
                          type="button"
                          onClick={() => addVolunteer(email)}
                          className="w-full text-left px-4 py-2 hover:bg-muted font-medium"
                        >
                          {email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <NeuInput
                    placeholder="Add email manually"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <NeuButton
                    type="button"
                    variant="outline"
                    onClick={() => addVolunteer(userSearch.trim())}
                  >
                    Add
                  </NeuButton>
                </div>

                {volunteers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {volunteers.map((email) => (
                      <NeuBadge key={email} variant="secondary">
                        {email}
                        <button
                          type="button"
                          className="ml-2 text-xs"
                          onClick={() => removeVolunteer(email)}
                        >
                          ✕
                        </button>
                      </NeuBadge>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Volunteers can scan participant QR codes for this event.
                </p>
              </div>
            </NeuCard>

            {/* Cover Image Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Cover Image
              </h2>

              <div className="space-y-4">
                <label className="block cursor-pointer">
                  <div
                    className={cn(
                      "border-[3px] border-dashed border-foreground rounded-[12px] p-8 text-center transition-all hover:bg-muted/50",
                      coverImage && "bg-success/10 border-success"
                    )}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    {coverImage ? (
                      <>
                        <p className="font-semibold text-foreground">
                          Image selected
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click to change image
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground">
                          Upload Cover Image
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG, or GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </label>

                {/* Cover Image Preview */}
                {coverImage && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Preview
                    </p>
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full max-h-[300px] object-cover rounded-[12px] border-[3px] border-foreground shadow-neu"
                    />
                  </div>
                )}
              </div>
            </NeuCard>

            {/* Prizes Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Prizes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold border-[1px] border-foreground">
                      1st
                    </span>
                    First Prize
                  </Label>
                  <NeuInput
                    placeholder="e.g., ₹5000 + Certificate"
                    value={prize1st}
                    onChange={(e) => setPrize1st(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 bg-muted text-foreground rounded-full flex items-center justify-center text-sm font-bold border-[1px] border-foreground">
                      2nd
                    </span>
                    Second Prize
                  </Label>
                  <NeuInput
                    placeholder="e.g., ₹3000 + Certificate"
                    value={prize2nd}
                    onChange={(e) => setPrize2nd(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold border-[1px] border-foreground">
                      3rd
                    </span>
                    Third Prize
                  </Label>
                  <NeuInput
                    placeholder="e.g., ₹1000 + Certificate"
                    value={prize3rd}
                    onChange={(e) => setPrize3rd(e.target.value)}
                  />
                </div>
              </div>
            </NeuCard>

            {/* Upload Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Attachments
              </h2>

              <label className="block cursor-pointer">
                <div
                  className={cn(
                    "border-[3px] border-dashed border-foreground rounded-[12px] p-8 text-center transition-all hover:bg-muted/50",
                    rulebookFile && "bg-success/10 border-success"
                  )}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {rulebookFile ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {rulebookFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click to replace file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        Upload Rulebook / Brochure
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, DOC, or image files up to 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
              </label>
            </NeuCard>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <NeuButton
                variant="outline"
                size="lg"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save as Draft
                  </>
                )}
              </NeuButton>
              <NeuButton
                variant="primary"
                size="lg"
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish Event
                  </>
                )}
              </NeuButton>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventCreation;
