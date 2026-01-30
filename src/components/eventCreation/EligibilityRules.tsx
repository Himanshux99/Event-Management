import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";

export default function EligibilityRules({ eligibleYear, setEligibleYear, eligibleBranch, setEligibleBranch, eligibleCollege, setEligibleCollege, years, branches, colleges }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Eligibility Rules</h2>

      <div className="space-y-5">
        <div>
          <Label className="text-base font-semibold">Eligible Year</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {years.map((y: string) => {
              const value = y.toLowerCase().replace(/\s+/g, "-");
              const checked = Array.isArray(eligibleYear) ? eligibleYear.includes(value) : false;

              return (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={(e) => {
                      if (!Array.isArray(eligibleYear)) return;
                      if (e.target.checked) {
                        setEligibleYear([...eligibleYear, value]);
                      } else {
                        setEligibleYear(eligibleYear.filter((v: string) => v !== value));
                      }
                    }}
                  />
                  <span className="text-sm">{y}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold">Eligible Branch</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {branches.map((b: string) => {
              const value = String(b).toLowerCase().replace(/\s+/g, "-");
              const checked = Array.isArray(eligibleBranch) ? eligibleBranch.includes(value) : false;

              return (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={(e) => {
                      if (!Array.isArray(eligibleBranch)) return;
                      if (e.target.checked) {
                        setEligibleBranch([...eligibleBranch, value]);
                      } else {
                        setEligibleBranch(eligibleBranch.filter((v: string) => v !== value));
                      }
                    }}
                  />
                  <span className="text-sm">{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </NeuCard>
  );
}
