import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";
import { NeuInput } from "@/components/ui/NeuInput";

export default function PrizesEditor({ prize1st, setPrize1st, prize2nd, setPrize2nd, prize3rd, setPrize3rd }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Prizes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="text-base font-semibold">First Prize</Label>
          <NeuInput placeholder="e.g., ₹5000 + Certificate" value={prize1st} onChange={(e) => setPrize1st(e.target.value)} />
        </div>

        <div>
          <Label className="text-base font-semibold">Second Prize</Label>
          <NeuInput placeholder="e.g., ₹3000 + Certificate" value={prize2nd} onChange={(e) => setPrize2nd(e.target.value)} />
        </div>

        <div>
          <Label className="text-base font-semibold">Third Prize</Label>
          <NeuInput placeholder="e.g., ₹1000 + Certificate" value={prize3rd} onChange={(e) => setPrize3rd(e.target.value)} />
        </div>
      </div>
    </NeuCard>
  );
}
