import React from "react";
import { NeuButton } from "@/components/ui/NeuButton";
import { Loader } from "lucide-react";

export default function ActionButtons({ onSaveDraft, onPublish, loading }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
      <NeuButton variant="outline" size="lg" onClick={onSaveDraft} disabled={loading} className="flex items-center gap-2">
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>Save as Draft</>
        )}
      </NeuButton>
      <NeuButton variant="primary" size="lg" onClick={onPublish} disabled={loading} className="flex items-center gap-2">
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Publishing...
          </>
        ) : (
          <>Publish Event</>
        )}
      </NeuButton>
    </div>
  );
}
