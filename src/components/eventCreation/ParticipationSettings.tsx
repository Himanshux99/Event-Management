import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Label } from "@/components/ui/label";
import { NeuInput } from "@/components/ui/NeuInput";
import { NeuButton } from "@/components/ui/NeuButton";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Round {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ParticipationSettings({
  isTeamEvent,
  setIsTeamEvent,
  minTeamSize,
  setMinTeamSize,
  maxTeamSize,
  setMaxTeamSize,
  maxRegistrations,
  setMaxRegistrations,
  eventDescription,
  setEventDescription,
  rounds,
  setRounds,
  registrationFeeEnabled,
  setRegistrationFeeEnabled,
  registrationFeeAmount,
  setRegistrationFeeAmount,
}: any) {
  const addRound = () => {
    const newRound: Round = {
      id: Date.now().toString(),
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setRounds([...(rounds || []), newRound]);
  };

  const updateRound = (id: string, field: string, value: string) => {
    setRounds((prevRounds: Round[]) =>
      prevRounds.map((round: Round) =>
        round.id === id ? { ...round, [field]: value } : round,
      ),
    );
  };

  const removeRound = (id: string) => {
    setRounds((prevRounds: Round[]) =>
      prevRounds.filter((round: Round) => round.id !== id),
    );
  };
  return (
    <>
      <NeuCard variant="static">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Participation Settings
        </h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Participation Type
            </Label>
            <div className="flex gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setIsTeamEvent(false)}
                className={cn(
                  "flex-1 h-10 px-3 text-sm font-semibold border-[3px] border-foreground rounded-[12px] transition-all",
                  !isTeamEvent
                    ? "bg-secondary text-secondary-foreground shadow-neu"
                    : "bg-card text-foreground hover:bg-muted",
                )}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setIsTeamEvent(true)}
                className={cn(
                  "flex-1 h-10 px-3 text-sm font-semibold border-[3px] border-foreground rounded-[12px] transition-all",
                  isTeamEvent
                    ? "bg-secondary text-secondary-foreground shadow-neu"
                    : "bg-card text-foreground hover:bg-muted",
                )}
              >
                Team
              </button>
            </div>
          </div>

          {isTeamEvent && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 border-[3px] border-foreground rounded-[12px]">
              <div>
                <Label className="text-base font-semibold">Min Team Size</Label>
                <NeuInput
                  type="number"
                  min={1}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-base font-semibold">Max Team Size</Label>
                <NeuInput
                  type="number"
                  min={2}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Maximum Registrations
            </Label>
            <NeuInput
              type="number"
              placeholder="e.g., 100"
              value={maxRegistrations}
              onChange={(e) => setMaxRegistrations(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Registration Fee</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Apply fee</label>
                <input
                  type="checkbox"
                  checked={!!registrationFeeEnabled}
                  onChange={(e) => setRegistrationFeeEnabled(!!e.target.checked)}
                />
              </div>

              <div className="flex-1">
                <NeuInput
                  type="number"
                  placeholder="Amount (e.g., 50)"
                  value={registrationFeeAmount ?? ""}
                  onChange={(e) => setRegistrationFeeAmount(e.target.value)}
                  disabled={!registrationFeeEnabled}
                />
              </div>
            </div>
          </div>
        </div>
      </NeuCard>

      {/* Event Description Card */}
      <NeuCard variant="static">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Event Description
        </h2>
        <div className="space-y-2">
          <Label className="text-base font-semibold">Description</Label>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Enter event description..."
            className="w-full h-28 p-3 border-[3px] border-foreground rounded-[12px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </NeuCard>

      {/* Rounds Manager Card */}
      <NeuCard variant="static">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Event Rounds</h2>
          <NeuButton
            type="button"
            onClick={addRound}
            variant="primary"
            size="sm"
          >
            + Add Round
          </NeuButton>
        </div>

        <div className="space-y-4">
          {rounds && rounds.length > 0 ? (
            rounds.map((round: Round, index: number) => (
              <div
                key={round.id}
                className="p-4 bg-muted/50 border-[3px] border-foreground rounded-[12px] space-y-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">Round {index + 1}</h3>
                  <NeuButton
                    type="button"
                    onClick={() => removeRound(round.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </NeuButton>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Round Title</Label>
                  <NeuInput
                    type="text"
                    placeholder="e.g., Prelims, Finals"
                    value={round.title}
                    onChange={(e) =>
                      updateRound(round.id, "title", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold">Start Date</Label>
                    <NeuInput
                      type="date"
                      value={round.startDate}
                      onChange={(e) =>
                        updateRound(round.id, "startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">End Date</Label>
                    <NeuInput
                      type="date"
                      value={round.endDate}
                      onChange={(e) =>
                        updateRound(round.id, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    Round Description
                  </Label>
                  <textarea
                    value={round.description}
                    onChange={(e) =>
                      updateRound(round.id, "description", e.target.value)
                    }
                    placeholder="Enter round details..."
                    className="w-full h-20 p-3 border-[3px] border-foreground rounded-[12px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground border-[3px] border-dashed border-foreground rounded-[12px]">
              No rounds added yet. Click "Add Round" to create one.
            </div>
          )}
        </div>
      </NeuCard>
    </>
  );
}
