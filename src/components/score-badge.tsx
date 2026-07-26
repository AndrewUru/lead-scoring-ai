import type { LeadStatus } from "@/types/lead";

const labels: Record<LeadStatus, string> = {
  hot: "Hot",
  warm: "Warm",
  nurturing: "Nurturing",
  cold: "Cold",
};
const styles: Record<LeadStatus, string> = {
  hot: "bg-[#fee8e4] text-[#a63c2d]",
  warm: "bg-[#fff0cf] text-[#8b5b00]",
  nurturing: "bg-[#e4edff] text-[#315a9b]",
  cold: "bg-[#edf0ee] text-[#66706a]",
};

export function ScoreBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{labels[status]}</span>;
}
