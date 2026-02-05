import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { userDB } from "@/lib/firebaseDB";
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types/user";

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const doc = await userDB.getById(currentUser.uid);
        if (doc) {
          setProfile(doc as UserProfile);
        } else {
          setProfile({ uid: currentUser.uid, name: currentUser.name || "", email: currentUser.email || "", role: currentUser.role });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setImageFile(f);
      const url = URL.createObjectURL(f);
      setProfile((p) => ({ ...(p || {}), photoURL: url }));
    }
  };

  const uploadImageAndGetUrl = async (uid: string) => {
    if (!imageFile) return profile?.photoURL;
    const path = `profiles/${uid}/${Date.now()}_${imageFile.name}`;
    const r = storageRef(storage, path);
    await uploadBytes(r, imageFile);
    const url = await getDownloadURL(r);
    return url;
  };

  const handleSave = async () => {
    if (!currentUser || !profile) return;
    setSaving(true);
    try {
      const photoURL = await uploadImageAndGetUrl(currentUser.uid);
      const payload: Partial<UserProfile> = {
        name: profile.name || "",
        phone: profile.phone || "",
        photoURL: photoURL || profile.photoURL,
        role: profile.role as any,
        rollNumber: profile.rollNumber,
        branch: profile.branch,
        college: profile.college,
        organizerName: profile.organizerName,
      };

      await userDB.upsert(currentUser.uid, payload);
      toast({ title: "Profile saved", description: "Your profile was updated successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Save failed", description: "Could not save profile." });
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return <div className="p-4">Please login to view profile.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center md:items-start space-y-3">
              <Avatar>
                {profile?.photoURL ? <AvatarImage src={profile.photoURL} alt={profile.name} /> : <AvatarFallback>{(profile?.name || "?").charAt(0)}</AvatarFallback>}
              </Avatar>
              <label className="text-sm text-muted-foreground">Change photo</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={profile?.name || ""} onChange={(e) => setProfile({ ...(profile || {}), name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={profile?.email || currentUser.email || ""} readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input value={profile?.phone || ""} onChange={(e) => setProfile({ ...(profile || {}), phone: e.target.value })} />
              </div>

              {profile?.role === "student" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Roll number</label>
                    <Input value={profile?.rollNumber || ""} onChange={(e) => setProfile({ ...(profile || {}), rollNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <Input value={profile?.branch || ""} onChange={(e) => setProfile({ ...(profile || {}), branch: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">College</label>
                    <Input value={profile?.college || ""} onChange={(e) => setProfile({ ...(profile || {}), college: e.target.value })} />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Organization / Committee</label>
                  <Input value={profile?.organizerName || ""} onChange={(e) => setProfile({ ...(profile || {}), organizerName: e.target.value })} />
                </div>
              )}

              <div className="pt-3">
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
