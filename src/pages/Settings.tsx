import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { userDB } from "@/lib/firebaseDB";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types/user";

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const doc = await userDB.getById(currentUser.uid);
        if (doc) setProfile(doc as UserProfile);
        else setProfile({ uid: currentUser.uid, name: currentUser.name || "", email: currentUser.email || "", role: currentUser.role });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser || !profile) return;
    setSaving(true);
    try {
      const payload: Partial<UserProfile> = {
        calendarLink: profile.calendarLink || null,
      };
      await userDB.upsert(currentUser.uid, payload);
      toast({ title: "Settings saved", description: "Settings updated." });
    } catch (err) {
      console.error(err);
      toast({ title: "Save failed", description: "Could not save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return <div className="p-4">Please login to view settings.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Calendar link</label>
              <Input value={profile?.calendarLink || ""} onChange={(e) => setProfile({ ...(profile || {}), calendarLink: e.target.value })} placeholder="Paste your Google Calendar link (will be used later)" />
            </div>

            <div>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save settings"}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
