import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";

export default function EligibilityRules({ eligibleYear, setEligibleYear, eligibleBranch, setEligibleBranch, eligibleCollege, setEligibleCollege, years, branches, colleges }: any) {
  const normalizeValue = (value: string) => String(value).toLowerCase().replace(/\s+/g, "-");

  const getAllOptionValue = (values: string[], fallback: string) => {
    const normalized = values.map(normalizeValue);
    return normalized.includes(fallback) ? fallback : "";
  };

  const toggleCheckboxGroup = (
    currentValues: string[],
    setValues: (values: string[]) => void,
    allValue: string,
    individualValues: string[],
    nextChecked: boolean,
    nextValue: string,
  ) => {
    const next = new Set(currentValues || []);

    if (nextValue === allValue) {
      // If "All" is toggled, sync every checkbox in the group.
      if (nextChecked) {
        individualValues.forEach((v) => next.add(v));
        next.add(allValue);
      } else {
        next.clear();
      }
      setValues(Array.from(next));
      return;
    }

    if (nextChecked) {
      next.add(nextValue);
    } else {
      next.delete(nextValue);
    }

    const hasAllIndividuals =
      individualValues.length > 0 && individualValues.every((v) => next.has(v));
    // Keep "All" in sync with individual selections.
    if (hasAllIndividuals) {
      next.add(allValue);
    } else {
      next.delete(allValue);
    }

    setValues(Array.from(next));
  };

  const yearValues = (years || []).map(normalizeValue);
  const allYearsValue = getAllOptionValue(years || [], "all-years");
  const individualYearValues = allYearsValue
    ? yearValues.filter((v) => v !== allYearsValue)
    : yearValues;

  const branchValues = (branches || []).map(normalizeValue);
  const allBranchesValue = getAllOptionValue(branches || [], "all-branches");
  const individualBranchValues = allBranchesValue
    ? branchValues.filter((v) => v !== allBranchesValue)
    : branchValues;

  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Eligibility Rules</h2>

      <div className="space-y-5">
        <div>
          <Label className="text-base font-semibold">Eligible Year</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {years.map((y: string) => {
              const value = normalizeValue(y);
              const checked = Array.isArray(eligibleYear) ? eligibleYear.includes(value) : false;
              const id = `eligible-year-${value}`;

              return (
                <label key={value} htmlFor={id} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={(e) => {
                      if (!Array.isArray(eligibleYear)) return;
                      toggleCheckboxGroup(
                        eligibleYear,
                        setEligibleYear,
                        allYearsValue,
                        individualYearValues,
                        e.target.checked,
                        value,
                      );
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
          <div className="flex flex-wrap gap-3 mt-2">
            {branches.map((b: string) => {
              const value = normalizeValue(b);
              const checked = Array.isArray(eligibleBranch) ? eligibleBranch.includes(value) : false;
              const id = `eligible-branch-${value}`;

              return (
                <label key={value} htmlFor={id} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={(e) => {
                      if (!Array.isArray(eligibleBranch)) return;
                      toggleCheckboxGroup(
                        eligibleBranch,
                        setEligibleBranch,
                        allBranchesValue,
                        individualBranchValues,
                        e.target.checked,
                        value,
                      );
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
