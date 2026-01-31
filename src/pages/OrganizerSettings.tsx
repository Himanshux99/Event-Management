import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { functions } from "@/lib/firebase"; // ← ADD THIS IMPORT
import { httpsCallable } from "firebase/functions"; // ← ADD THIS IMPORT

export default function OrganizerSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Firebase Function to create Razorpay Route account
      const createAccountFunction = httpsCallable(functions, 'createOrganizerAccount');
      const result: any = await createAccountFunction({
        organizerId: currentUser?.uid,
        ...formData,
      });

      if (result.data.success) {
        toast.success("Bank account linked successfully!");
        // Optionally reset form
        setFormData({
          organizationName: "",
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          email: "",
          phone: "",
        });
      } else {
        toast.error(result.data.error || "Failed to link account");
      }
    } catch (error: any) {
      console.error("Error linking account:", error);
      toast.error(error.message || "Failed to link bank account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>
        
        <NeuCard variant="static" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <NeuInput
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                placeholder="e.g., Tech Events Society"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <NeuInput
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                placeholder="Name as per bank account"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Bank Account Number</Label>
              <NeuInput
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <NeuInput
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                placeholder="e.g., SBIN0001234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <NeuInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@organization.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <NeuInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <NeuButton type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Linking Account...
                </>
              ) : (
                "Link Bank Account"
              )}
            </NeuButton>
          </form>
        </NeuCard>
      </div>
    </Layout>
  );
}