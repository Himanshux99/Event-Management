import { NeuBadge } from "@/components/ui/NeuBadge";
import React from "react";

export default function EventStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "primary" }> = {
    "upcoming": { label: "Upcoming", variant: "default" },
    "registration-open": { label: "Open", variant: "success" },
    "registration-closed": { label: "Reg. Closed", variant: "warning" },
    "live": { label: "Live", variant: "destructive" },
    "closed": { label: "Ended", variant: "default" },
    "published": { label: "Published", variant: "success" },
  };

  const { label, variant } = config[status] || config["upcoming"];

  return (
    <NeuBadge variant={variant} size="sm">
      {label}
    </NeuBadge>
  );
}
