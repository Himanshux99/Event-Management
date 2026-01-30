import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttachmentsUploader({ rulebookFile, onFileUpload }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Attachments</h2>

      <label className="block cursor-pointer">
        <div className={cn("border-[3px] border-dashed border-foreground rounded-[12px] p-8 text-center transition-all hover:bg-muted/50", rulebookFile && "bg-success/10 border-success")}>
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {rulebookFile ? (
            <>
              <p className="font-semibold text-foreground">{rulebookFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Click to replace file</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Upload Rulebook / Brochure</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOC, or image files up to 10MB</p>
            </>
          )}
        </div>
        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={onFileUpload} />
      </label>
    </NeuCard>
  );
}
