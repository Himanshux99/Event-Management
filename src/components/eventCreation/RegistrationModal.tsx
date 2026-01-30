import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Trash2, CheckCircle2, Clock, AlertCircle, Loader } from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { toast } from "sonner";
import { registrationDB, userDB, teamInvitesDB } from "@/lib/firebaseDB";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  user: any;
  onRegistrationSuccess: () => void;
}

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  branch?: string;
  college?: string;
  rollNumber?: string;
  year?: string;
}

interface TeamMember {
  uid: string;
  name: string;
  email: string;
  status: "pending" | "accepted";
}

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  user,
  onRegistrationSuccess,
}: RegistrationModalProps) {
  const [step, setStep] = useState<"confirmation" | "team">("confirmation");
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Fetch current user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoadingUser(true);
        const profile: any = await userDB.getById(user.uid);
        setUserDetails({
          uid: user.uid,
          name: profile?.name || user.email,
          email: user.email,
          branch: profile?.branch,
          college: profile?.college,
          rollNumber: profile?.rollNumber,
          year: profile?.year,
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoadingUser(false);
      }
    };

    if (isOpen && user) {
      fetchUserDetails();
    }
  }, [isOpen, user]);

  // Search for users to add to team
  const handleSearchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (!userDetails?.college) {
      setSearchResults([]);
      toast.error("Your college is missing in profile. Update your profile to search team members.");
      return;
    }

    try {
      setSearching(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("college", "==", userDetails.college));
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs
        .map((doc: any) => ({
          uid: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          branch: doc.data().branch,
          college: doc.data().college,
          rollNumber: doc.data().rollNumber,
          year: doc.data().year,
        }))
        .filter(
          (u: UserProfile) =>
            ((u.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())) &&
            u.uid !== user.uid && // Exclude current user
            !teamMembers.some((tm) => tm.uid === u.uid) // Exclude already added members
        );

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const addTeamMember = (member: UserProfile) => {
    if (teamMembers.length >= (event.maxTeamSize - 1 || 0)) {
      toast.error(`Maximum team size is ${event.maxTeamSize}`);
      return;
    }

    setTeamMembers([
      ...teamMembers,
      {
        uid: member.uid,
        name: member.name,
        email: member.email,
        status: "pending",
      },
    ]);
    setSearchResults(searchResults.filter((u) => u.uid !== member.uid));
    setSearchQuery("");
    toast.success(`${member.name} added to team`);
  };

  const removeTeamMember = (uid: string) => {
    setTeamMembers(teamMembers.filter((tm) => tm.uid !== uid));
  };

  const handleRegister = async () => {
    if (!userDetails) return;

    try {
      setRegistering(true);

      // Create registration for current user
      const registrationData = {
        userId: user.uid,
        eventId: event.id,
        eventTitle: event.title,
        userName: userDetails.name,
        userEmail: user.email,
        userBranch: userDetails.branch,
        userCollege: userDetails.college,
        userRollNumber: userDetails.rollNumber,
        userYear: userDetails.year,
        status: "registered",
        teamMembers: teamMembers.map((tm) => ({
          uid: tm.uid,
          name: tm.name,
          email: tm.email,
          status: "pending",
        })),
        registeredAt: new Date(),
      };

      await registrationDB.create(registrationData);

      // Send invitations to team members
      if (event.isTeamEvent && teamMembers.length > 0) {
        for (const member of teamMembers) {
          const inviteData = {
            fromUserId: user.uid,
            fromUserName: userDetails.name,
            fromUserEmail: user.email,
            toUserId: member.uid,
            toUserEmail: member.email,
            toUserName: member.name,
            eventId: event.id,
            eventTitle: event.title,
            teamSize: teamMembers.length + 1, // Including the organizer
            maxTeamSize: event.maxTeamSize,
            status: "pending", // pending, accepted, rejected
          };

          // Save invite to teamInvites collection
          await teamInvitesDB.create(inviteData);
        }
      }

      toast.success("Registration successful! Invitations sent to team members.");
      onRegistrationSuccess();
      onClose();
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Failed to register for event");
    } finally {
      setRegistering(false);
    }
  };

  const handleConfirmAndContinue = () => {
    if (event.isTeamEvent) {
      setStep("team");
    } else {
      handleRegister();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <NeuCard variant="static" className="relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold">
                    {step === "confirmation" ? "Event Registration" : "Add Team Members"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {step === "confirmation"
                      ? "Confirm your details to register for this event"
                      : "Add team members to participate together"}
                  </p>
                </div>

                {/* Step Indicator */}
                {event.isTeamEvent && (
                  <div className="flex gap-2">
                    <div
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        step === "confirmation" ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <div
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        step === "team" ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  </div>
                )}

                {/* Confirmation Step */}
                {step === "confirmation" && (
                  <div className="space-y-6">
                    {loadingUser ? (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Loading your details...</span>
                      </div>
                    ) : userDetails ? (
                      <>
                        {/* Your Details */}
                        <div>
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Your Details
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-semibold">{userDetails.name}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-semibold text-sm">{userDetails.email}</p>
                            </div>
                            {userDetails.rollNumber && (
                              <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                                <p className="text-sm text-muted-foreground">Roll Number</p>
                                <p className="font-semibold">{userDetails.rollNumber}</p>
                              </div>
                            )}
                            {userDetails.branch && (
                              <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                                <p className="text-sm text-muted-foreground">Branch</p>
                                <p className="font-semibold">{userDetails.branch}</p>
                              </div>
                            )}
                            {userDetails.year && (
                              <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                                <p className="text-sm text-muted-foreground">Year</p>
                                <p className="font-semibold">{userDetails.year}</p>
                              </div>
                            )}
                            {userDetails.college && (
                              <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                                <p className="text-sm text-muted-foreground">College</p>
                                <p className="font-semibold">{userDetails.college}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div>
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            Event Details
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                              <p className="text-sm text-muted-foreground">Event Title</p>
                              <p className="font-semibold">{event.title}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                              <p className="text-sm text-muted-foreground">Type</p>
                              <NeuBadge variant={event.type === "inter-college" ? "primary" : "secondary"}>
                                {event.type === "inter-college" ? "Inter-College" : "Intra-College"}
                              </NeuBadge>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-semibold">{event.date}</p>
                            </div>
                            {event.isTeamEvent && (
                              <div className="p-4 bg-muted rounded-lg border-2 border-foreground/10">
                                <p className="text-sm text-muted-foreground">Participation</p>
                                <p className="font-semibold">
                                  Team ({event.minTeamSize} - {event.maxTeamSize} members)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info Alert */}
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Registration Confirmation</p>
                            <p className="text-sm text-blue-800 mt-1">
                              By registering, you confirm that all the above details are correct. You will
                              receive a confirmation email at {userDetails.email}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <p>Failed to load your details</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Selection Step */}
                {step === "team" && (
                  <div className="space-y-6">
                    {/* Team Size Info */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Team Requirements</p>
                        <p className="text-sm text-blue-800 mt-1">
                          Add {event.minTeamSize - 1} to {event.maxTeamSize - 1} team members from your college.
                          They will receive an invitation to join.
                        </p>
                      </div>
                    </div>

                    {/* Search for Members */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Search & Add Team Members</label>
                      <div className="relative">
                        <NeuInput
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearchUsers(e.target.value);
                          }}
                        />
                        {searching && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="mt-2 border-2 border-foreground/10 rounded-lg max-h-48 overflow-y-auto">
                          {searchResults.map((result) => (
                            <div
                              key={result.uid}
                              className="p-3 border-b-2 border-foreground/5 last:border-b-0 flex items-center justify-between hover:bg-muted transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{result.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {result.email} • {result.branch}
                                </p>
                              </div>
                              <NeuButton
                                variant="primary"
                                size="sm"
                                onClick={() => addTeamMember(result)}
                              >
                                <UserPlus className="w-4 h-4" />
                              </NeuButton>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchQuery && !searching && searchResults.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">No users found from your college</p>
                      )}
                    </div>

                    {/* Selected Team Members */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Selected Team Members ({teamMembers.length}/{event.maxTeamSize - 1})
                      </h3>

                      {/* Current User (Team Lead) */}
                      <div className="mb-4 p-3 bg-muted rounded-lg border-2 border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{userDetails?.name}</p>
                            <p className="text-xs text-muted-foreground">You (Team Lead)</p>
                          </div>
                          <NeuBadge variant="primary">Lead</NeuBadge>
                        </div>
                      </div>

                      {/* Team Members */}
                      {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member) => (
                            <div
                              key={member.uid}
                              className="p-3 bg-muted rounded-lg border-2 border-foreground/10 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold text-sm">{member.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-600">Pending invitation</span>
                                </div>
                              </div>
                              <NeuButton
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTeamMember(member.uid)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </NeuButton>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg border-2 border-foreground/10">
                          No team members added yet. Search and add members above.
                        </p>
                      )}
                    </div>

                    {/* Validation Message */}
                    {teamMembers.length < event.minTeamSize - 1 && (
                      <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-sm text-yellow-800">
                        Add at least {event.minTeamSize - 1} team members to complete registration
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-foreground/10">
                  <NeuButton variant="outline" className="flex-1" onClick={onClose} disabled={registering}>
                    Cancel
                  </NeuButton>

                  {step === "confirmation" ? (
                    <NeuButton
                      variant="primary"
                      className="flex-1"
                      onClick={handleConfirmAndContinue}
                      disabled={registering}
                    >
                      {event.isTeamEvent ? "Next: Add Team" : "Confirm Registration"}
                    </NeuButton>
                  ) : (
                    <NeuButton
                      variant="primary"
                      className="flex-1"
                      onClick={handleRegister}
                      disabled={
                        registering || teamMembers.length < event.minTeamSize - 1
                      }
                    >
                      {registering ? "Registering..." : "Complete Registration"}
                    </NeuButton>
                  )}
                </div>
              </div>
            </NeuCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
