import {
  Activity,
  BellRing,
  Building2,
  Home,
  Info,
  LifeBuoy,
  Map,
  Hospital,
  ShieldCheck,
  History,
  Palette,
  Siren,
  ClipboardList,
  ShieldAlert,
  LayoutDashboard,
  UserCog,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  description?: string;
};

export const PUBLIC_NAV: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Live Map", to: "/map", icon: Map, description: "Real-time incident map" },
  { label: "Disasters", to: "/disasters", icon: Activity, description: "Active and past events" },
  { label: "Alerts", to: "/alerts", icon: BellRing, description: "Emergency broadcasts" },
  { label: "Shelters", to: "/shelters", icon: LifeBuoy, description: "Relief camps and capacity" },
  { label: "Hospitals", to: "/hospitals", icon: Hospital, description: "Medical facilities" },
  { label: "NGOs", to: "/ngos", icon: Building2, description: "Verified relief organisations" },
  { label: "History", to: "/history", icon: History, description: "Disaster archive" },
  { label: "Safety", to: "/safety", icon: ShieldCheck, description: "Preparedness guidance" },
  { label: "About", to: "/about", icon: Info },
];

/** Shown in the app shell sidebar. Role-aware filtering arrives in Phase 4. */
export const WORKSPACE_NAV: NavItem[] = [
  { label: "Report incident", to: "/report", icon: Siren },
  { label: "My reports", to: "/my-reports", icon: ClipboardList },
  { label: "Live Map", to: "/map", icon: Map },
  { label: "Disasters", to: "/disasters", icon: Activity },
  { label: "Alerts", to: "/alerts", icon: BellRing },
  { label: "Shelters", to: "/shelters", icon: LifeBuoy },
  { label: "Hospitals", to: "/hospitals", icon: Hospital },
  { label: "NGOs", to: "/ngos", icon: Building2 },
  { label: "Rescue teams", to: "/rescue-teams", icon: LifeBuoy },
  { label: "Design System", to: "/design-system", icon: Palette },
];

/** Extra sidebar entries shown only to responders and admins. */
export const RESPONDER_NAV: NavItem[] = [
  { label: "Verification queue", to: "/queue", icon: ShieldAlert },
  { label: "Operations console", to: "/operations", icon: LayoutDashboard },
];

/** Extra sidebar entries shown only to administrators. */
export const ADMIN_NAV: NavItem[] = [
  { label: "Team & roles", to: "/admin", icon: UserCog },
];

export const BRAND = {
  name: "DISASTRA",
  tagline: "Detect. Respond. Protect. Recover.",
  headline: "Disaster Intelligence. Faster Response. Safer Communities.",
} as const;
