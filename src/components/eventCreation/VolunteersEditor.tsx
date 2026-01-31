import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuBadge } from "@/components/ui/NeuBadge";

export default function VolunteersEditor({ volunteers, userSearch, setUserSearch, filteredUsers, addVolunteer, removeVolunteer }: any) {
  return (
    <NeuCard variant="static">
      <h2 className="text-xl font-bold text-foreground mb-6">Volunteers</h2>

      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium">Search user by email</label>
            <div className="relative">
              <NeuInput placeholder="Type email to search..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              {filteredUsers.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-card border-[3px] border-foreground rounded-[12px] shadow-neu max-h-48 overflow-auto">
                  {filteredUsers.map((email: string) => (
                    <button key={email} type="button" onClick={() => addVolunteer(email)} className="w-full text-left px-4 py-2 hover:bg-muted font-medium">{email}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium">Add email manually</label>
            <NeuInput placeholder="Add email manually" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
        </div>

        <div>
          <NeuButton variant="outline" onClick={() => addVolunteer(userSearch.trim())}>Add</NeuButton>
        </div>

        {volunteers.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {volunteers.map((email: string) => (
              <NeuBadge key={email} variant="secondary">
                {email}
                <button type="button" className="ml-2 text-xs" onClick={() => removeVolunteer(email)}>✕</button>
              </NeuBadge>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground">Volunteers can scan participant QR codes for this event.</p>
      </div>
    </NeuCard>
  );
}
