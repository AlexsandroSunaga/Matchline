import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  GitMerge,
  LayoutDashboard,
  Settings,
  Upload,
  Workflow,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
  group: "workspace" | "pipeline" | "admin";
};

export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "workspace" },
  { href: "/dashboard/match", label: "Match workspace", icon: Upload, group: "workspace", keywords: "csv dedup" },
  { href: "/dashboard/clusters", label: "Clusters", icon: GitMerge, group: "pipeline" },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: Workflow, group: "pipeline" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, group: "pipeline" },
  { href: "/dashboard/activity", label: "Job log", icon: Activity, group: "admin" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, group: "admin" },
];

export const navGroups = [
  { id: "workspace" as const, label: "Workspace" },
  { id: "pipeline" as const, label: "Data pipeline" },
  { id: "admin" as const, label: "Administration" },
];
