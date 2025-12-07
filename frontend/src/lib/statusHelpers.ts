import { Badge } from "@/components/ui/badge";
import { badgeVariants } from "@/components/ui/badge";

const statusVariants: Record<string, "sourced" | "screened" | "takehome" | "interview" | "offer" | "rejected"> = {
  sourced: "sourced",
  screened: "screened",
  takehome_assigned: "takehome",
  takehome_reviewed: "takehome",
  interview: "interview",
  offer: "offer",
  rejected: "rejected",
};

const statusLabels: Record<string, string> = {
  sourced: "SOURCED",
  screened: "SCREENED",
  takehome_assigned: "TAKE-HOME",
  takehome_reviewed: "REVIEWED",
  interview: "INTERVIEW",
  offer: "OFFER",
  rejected: "REJECTED",
};

export { statusVariants, statusLabels };
