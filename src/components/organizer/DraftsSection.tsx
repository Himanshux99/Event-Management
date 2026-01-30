import { motion } from "framer-motion";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { Clock, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

export default function DraftsSection({ draftEvents, onDelete }: { draftEvents: any[]; onDelete: (id: string) => void }) {
  if (!draftEvents || draftEvents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mb-8"
    >
      <NeuCard variant="static" padding="none" className="border-warning border-[3px]">
        <div className="p-6 border-b-[3px] border-warning bg-warning/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-bold">Draft Events ({draftEvents.length})</h2>
            </div>
            <p className="text-sm text-muted-foreground">Ready to continue editing</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {draftEvents.map((draft) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-card border-[3px] border-foreground rounded-[12px] shadow-neu-sm hover:shadow-neu transition-shadow"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{draft.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {draft.date && draft.time ? `${draft.date} at ${draft.time}` : "No date set"}
                  </p>
                  <NeuBadge variant="warning" size="sm">Draft</NeuBadge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/organizer/edit-draft/${draft.id}`}>
                  <NeuButton variant="primary" size="sm" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Continue Editing
                  </NeuButton>
                </Link>
                <NeuButton
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(draft.id)}
                  className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </NeuButton>
              </div>
            </motion.div>
          ))}
        </div>
      </NeuCard>
    </motion.div>
  );
}
