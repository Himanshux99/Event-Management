import { motion } from "framer-motion";
import { NeuCard } from "@/components/ui/NeuCard";
import { Plus, QrCode, BarChart3 } from "lucide-react";
import React from "react";

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-8 grid md:grid-cols-3 gap-4"
    >
      <NeuCard className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold">Create New Event</p>
          <p className="text-sm text-muted-foreground">Start from scratch</p>
        </div>
      </NeuCard>

      <NeuCard className="flex items-center gap-4">
        <div className="w-12 h-12 bg-secondary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
          <QrCode className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div>
          <p className="font-bold">Start Scanning</p>
          <p className="text-sm text-muted-foreground">Check-in attendees</p>
        </div>
      </NeuCard>

      <NeuCard className="flex items-center gap-4">
        <div className="w-12 h-12 bg-accent border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-accent-foreground" />
        </div>
        <div>
          <p className="font-bold">View Analytics</p>
          <p className="text-sm text-muted-foreground">Attendance reports</p>
        </div>
      </NeuCard>
    </motion.div>
  );
}
