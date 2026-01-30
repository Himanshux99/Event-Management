import { motion } from "framer-motion";
import { NeuCard } from "@/components/ui/NeuCard";
import React from "react";

type Stat = { label: string; value: string; icon: any; color: string };

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <NeuCard key={index} variant="static" className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </NeuCard>
        );
      })}
    </motion.div>
  );
}
