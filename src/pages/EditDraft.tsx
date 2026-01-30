import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { eventDB } from "@/lib/firebaseDB";
import { toast } from "@/hooks/use-toast";
import EventCreation from "./EventCreation";

type DraftEvent = {
  id?: string;
  organizerId?: string;
  [key: string]: any;
};

const EditDraft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draftData, setDraftData] = useState<DraftEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraft = async () => {
      if (!draftId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const draft = (await eventDB.getById(draftId)) as DraftEvent | null;

        if (!draft) {
          toast({
            title: "Error",
            description: "Draft not found.",
            variant: "destructive",
          });
          navigate("/organizer");
          return;
        }

        if (draft.organizerId !== user.uid) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this draft.",
            variant: "destructive",
          });
          navigate("/organizer");
          return;
        }

        setDraftData(draft);
      } catch (error) {
        console.error("Error fetching draft:", error);
        toast({
          title: "Error",
          description: "Failed to load draft.",
          variant: "destructive",
        });
        navigate("/organizer");
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, [draftId, user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading draft...</span>
        </div>
      </Layout>
    );
  }

  return (
    <EventCreation initialData={draftData} draftId={draftId} isEditingDraft={true} />
  );
};

export default EditDraft;
