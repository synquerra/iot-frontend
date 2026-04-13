import type { LucideIcon } from "lucide-react";

export type ViewMode = "errors" | "alerts";

export interface SeverityCard {
  label: "Critical" | "Warning" | "Advisory";
  count: number;
  icon: LucideIcon;
  subtitle?: string;
}
export type HistoryItem = {
  id: string;
  title: string;
  name: string;
  imei: string;
  timestamp: string;
  severity: string;
  type: string;
  color: string;
  is_acknowledged: boolean;
  code: string;
};
// types.ts

