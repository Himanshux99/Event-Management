import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { AlertCircle } from "lucide-react";

export default function Unauthorized() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <NeuCard variant="static" className="max-w-md mx-auto text-center p-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-warning" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
          <div className="flex justify-center">
            <Link to="/">
              <NeuButton>Go Home</NeuButton>
            </Link>
          </div>
        </NeuCard>
      </div>
    </Layout>
  );
}
