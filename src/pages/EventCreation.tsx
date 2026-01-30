import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { Label } from "@/components/ui/label";
import BasicInfo from "@/components/eventCreation/BasicInfo";
import ParticipationSettings from "@/components/eventCreation/ParticipationSettings";
import EligibilityRules from "@/components/eventCreation/EligibilityRules";
import DescriptionEditor from "@/components/eventCreation/DescriptionEditor";
import VolunteersEditor from "@/components/eventCreation/VolunteersEditor";
import CoverImageUploader from "@/components/eventCreation/CoverImageUploader";
import PrizesEditor from "@/components/eventCreation/PrizesEditor";
import AttachmentsUploader from "@/components/eventCreation/AttachmentsUploader";
import ActionButtons from "@/components/eventCreation/ActionButtons";

import { format, parse } from "date-fns";
import { User, X} from "lucide-react";
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
  const [eventDescription, setEventDescription] = useState(initialData?.eventDescription || "");
  const [rounds, setRounds] = useState(
    initialData?.rounds || []
  );
  const [eligibleYear, setEligibleYear] = useState<string[]>(
    (() => {
      const y = initialData?.eligibility?.year;
      if (!y) return [];
      if (Array.isArray(y)) return y.map((v: string) => String(v).toLowerCase().replace(/\s+/g, "-"));
      return [String(y).toLowerCase().replace(/\s+/g, "-")];
    })()
  );
  const [eligibleBranch, setEligibleBranch] = useState<string[]>(
    (() => {
      const b = initialData?.eligibility?.branch;
      if (!b) return [];
      if (Array.isArray(b)) return b.map((v: string) => String(v).toLowerCase().replace(/\s+/g, "-"));
      return [String(b).toLowerCase().replace(/\s+/g, "-")];
    })()
  );
  const [eligibleCollege, setEligibleCollege] = useState(initialData?.eligibility?.college || "");
  const [prize1st, setPrize1st] = useState(initialData?.prizes?.first || "");
  const [prize2nd, setPrize2nd] = useState(initialData?.prizes?.second || "");
  const [prize3rd, setPrize3rd] = useState(initialData?.prizes?.third || "");
  const [rulebookFile, setRulebookFile] = useState<File | null>(null);
  const [description, setDescription] = useState(initialData?.description || "");
  const [guidelines, setGuidelines] = useState(initialData?.guidelines || "");
  const [eventHeads, setEventHeads] = useState<any[]>(
    Array.isArray(initialData?.contact)
      ? initialData.contact
      : initialData?.contact
      ? [{ name: initialData.contact.name || "", email: initialData.contact.email || "", phone: initialData.contact.phone || "" }]
      : [{ name: "", email: "", phone: "" }]
  );
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

  const addEventHead = () => {
    setEventHeads([...eventHeads, { name: "", email: "", phone: "" }]);
  };

  const updateEventHead = (index: number, field: string, value: string) => {
    setEventHeads((prev) => {
      const copy = [...prev];
      copy[index] = { ...(copy[index] || {}), [field]: value };
      return copy;
    });
  };

  const removeEventHead = (index: number) => {
    setEventHeads((prev) => prev.filter((_, i) => i !== index));
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
        eventDescription: eventDescription,
        rounds: rounds,
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
        contact: eventHeads,
        volunteers,
        coverImage: coverImage,
        organizerId: user.uid,
        organizerEmail: user.email,
        organizerCollege: user?.organizerCollege || "",
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
        eventDescription: eventDescription,
        rounds: rounds,
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
        contact: eventHeads,
        volunteers,
        coverImage: coverImage,
        organizerId: user.uid,
        organizerEmail: user.email,
        organizerCollege: user?.organizerCollege || "",
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
              <BasicInfo
                eventTitle={eventTitle}
                setEventTitle={setEventTitle}
                eventType={eventType}
                setEventType={setEventType}
                isInterCollege={isInterCollege}
                setIsInterCollege={setIsInterCollege}
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                startTime={startTime}
                setStartTime={setStartTime}
                duration={duration}
                setDuration={setDuration}
                venue={venue}
                setVenue={setVenue}
                venues={venues}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <ParticipationSettings
                isTeamEvent={isTeamEvent}
                setIsTeamEvent={setIsTeamEvent}
                minTeamSize={minTeamSize}
                setMinTeamSize={setMinTeamSize}
                maxTeamSize={maxTeamSize}
                setMaxTeamSize={setMaxTeamSize}
                maxRegistrations={maxRegistrations}
                setMaxRegistrations={setMaxRegistrations}
                eventDescription={eventDescription}
                setEventDescription={setEventDescription}
                rounds={rounds}
                setRounds={setRounds}
              />

              <EligibilityRules
                eligibleYear={eligibleYear}
                setEligibleYear={setEligibleYear}
                eligibleBranch={eligibleBranch}
                setEligibleBranch={setEligibleBranch}
                eligibleCollege={eligibleCollege}
                setEligibleCollege={setEligibleCollege}
                years={years}
                branches={branches}
                colleges={colleges}
              />
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="space-y-6">
            <DescriptionEditor description={description} setDescription={setDescription} guidelines={guidelines} setGuidelines={setGuidelines} />

            {/* Event Head(s) Card */}
            <NeuCard variant="static">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Event Head(s)
              </h2>

              <div className="space-y-4">
                {eventHeads.map((head, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Name</Label>
                      <NeuInput value={head.name} onChange={(e) => updateEventHead(idx, "name", e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Email</Label>
                      <NeuInput type="email" value={head.email} onChange={(e) => updateEventHead(idx, "email", e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-sm font-medium">Phone</Label>
                      <NeuInput type="tel" value={head.phone} onChange={(e) => updateEventHead(idx, "phone", e.target.value)} placeholder="Phone number" />
                    </div>
                    <div className="col-span-1">
                      <NeuButton type="button" onClick={() => removeEventHead(idx)} variant="destructive"><X /></NeuButton>
                    </div>
                  </div>
                ))}

                <div>
                  <NeuButton type="button" onClick={addEventHead} variant="primary">+ Add Event Head</NeuButton>
                </div>
              </div>
            </NeuCard>

            <VolunteersEditor volunteers={volunteers} userSearch={userSearch} setUserSearch={setUserSearch} filteredUsers={filteredUsers} addVolunteer={addVolunteer} removeVolunteer={removeVolunteer} />

            <CoverImageUploader coverImage={coverImage} onCoverImageUpload={handleCoverImageUpload} />

            <PrizesEditor prize1st={prize1st} setPrize1st={setPrize1st} prize2nd={prize2nd} setPrize2nd={setPrize2nd} prize3rd={prize3rd} setPrize3rd={setPrize3rd} />

            <AttachmentsUploader rulebookFile={rulebookFile} onFileUpload={handleFileUpload} />

            <ActionButtons onSaveDraft={handleSaveDraft} onPublish={handlePublish} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventCreation;
