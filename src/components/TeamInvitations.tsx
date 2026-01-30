import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader } from "lucide-react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { toast } from "sonner";
import { teamInvitesDB, registrationDB } from "@/lib/firebaseDB";

interface TeamInvitation {
  id: string;
  fromUserName: string;
  fromUserId: string;
  eventTitle: string;
  eventId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
  teamSize?: number;
  maxTeamSize?: number;
}

interface TeamInvitationsProps {
  userId: string;
}

export default function TeamInvitations({ userId }: TeamInvitationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        const pendingInvites = await teamInvitesDB.getPendingByUserId(userId);
        setInvitations(
          pendingInvites.map((inv: any) => ({
            id: inv.id,
            fromUserName: inv.fromUserName,
            fromUserId: inv.fromUserId,
            eventTitle: inv.eventTitle,
            eventId: inv.eventId,
            status: inv.status,
            createdAt: inv.createdAt,
            teamSize: inv.teamSize,
            maxTeamSize: inv.maxTeamSize,
          }))
        );
      } catch (error) {
        console.error("Error fetching invitations:", error);
        toast.error("Failed to load team invitations");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [userId]);

  const handleAcceptInvite = async (inviteId: string, eventId: string, fromUserId: string) => {
    try {
      setProcessingId(inviteId);

      // Update invitation status
      await teamInvitesDB.updateStatus(inviteId, "accepted");

      // Add this user to the team member in the registration
      // This will need to be handled through a firestore function or update operation

      setInvitations(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: "accepted" } : inv
      ));

      toast.success("Invitation accepted!", {
        description: "You are now part of the team.",
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      setProcessingId(inviteId);

      // Update invitation status
      await teamInvitesDB.updateStatus(inviteId, "rejected");

      setInvitations(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: "rejected" } : inv
      ));

      toast.success("Invitation declined");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error("Failed to decline invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingInvites = invitations.filter(inv => inv.status === "pending");
  const acceptedInvites = invitations.filter(inv => inv.status === "accepted");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        <span>Loading invitations...</span>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <NeuCard variant="static" className="text-center py-8">
        <p className="text-muted-foreground">No team invitations yet</p>
      </NeuCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Pending Invitations ({pendingInvites.length})
          </h3>
          <AnimatePresence>
            <div className="space-y-3">
              {pendingInvites.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NeuCard variant="static" className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary mb-1">
                          {invite.eventTitle}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Invited by <span className="font-medium">{invite.fromUserName}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <NeuBadge variant="secondary" size="sm">
                            Team Event
                          </NeuBadge>
                          {invite.maxTeamSize && (
                            <span className="text-xs text-muted-foreground">
                              Max {invite.maxTeamSize} members
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <NeuButton
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleAcceptInvite(
                              invite.id,
                              invite.eventId,
                              invite.fromUserId
                            )
                          }
                          disabled={processingId === invite.id}
                        >
                          {processingId === invite.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </NeuButton>
                        <NeuButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectInvite(invite.id)}
                          disabled={processingId === invite.id}
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </NeuButton>
                      </div>
                    </div>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* Accepted Invitations */}
      {acceptedInvites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Accepted ({acceptedInvites.length})
          </h3>
          <AnimatePresence>
            <div className="space-y-3">
              {acceptedInvites.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NeuCard variant="static" className="p-4 border-success/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-success mb-1">
                          {invite.eventTitle}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Team member: <span className="font-medium">{invite.fromUserName}</span>
                        </p>
                        <NeuBadge variant="success" size="sm">
                          Participation Confirmed
                        </NeuBadge>
                      </div>

                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    </div>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
