import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";

export default function DescriptionEditor({ description, setDescription, guidelines, setGuidelines }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Event Description</h2>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Description (Long Text)</Label>
          <textarea placeholder="Write a detailed description of your event..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[120px] p-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu resize-none" />
        </div>

        <div>
          <Label className="text-base font-semibold">Rules & Guidelines (Bullet Format)</Label>
          <textarea placeholder={"Enter guidelines in bullet format:\n• First guideline\n• Second guideline"} value={guidelines} onChange={(e) => setGuidelines(e.target.value)} className="w-full min-h-[120px] p-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu resize-none" />
        </div>
      </div>
    </NeuCard>
  );
}
