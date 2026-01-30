import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoverImageUploader({ coverImage, onCoverImageUpload }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Cover Image</h2>

      <div className="space-y-4">
        <label className="block cursor-pointer">
          <div className={cn("border-[3px] border-dashed border-foreground rounded-[12px] p-8 text-center transition-all hover:bg-muted/50", coverImage && "bg-success/10 border-success")}>
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {coverImage ? (
              <>
                <p className="font-semibold text-foreground">Image selected</p>
                <p className="text-sm text-muted-foreground mt-1">Click to change image</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground">Upload Cover Image</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or GIF up to 5MB</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={onCoverImageUpload} />
        </label>

        {coverImage && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-foreground mb-2">Preview</p>
            <img src={coverImage} alt="Cover preview" className="w-full max-h-[300px] object-cover rounded-[12px] border-[3px] border-foreground shadow-neu" />
          </div>
        )}
      </div>
    </NeuCard>
  );
}
