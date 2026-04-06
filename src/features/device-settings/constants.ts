import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Battery,
  Bell,
  Clock,
  Cpu,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Headphones,
  Lock,
  MapPin,
  Phone,
  Power,
  Settings2,
  Shield,
  Thermometer,
  Upload,
  Users,
  Wifi,
} from "lucide-react";

export type DeviceSettingsStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
};

export type DeviceSettingsTab = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export type ContactItem = {
  label: string;
  number: string;
  badge: string;
  badgeVariant: "secondary" | "destructive";
  indicatorClassName: string;
};

export type IntervalItem = {
  label: string;
  value: string;
  description: string;
  urgent?: boolean;
};

export type ModeItem = {
  icon: LucideIcon;
  label: string;
  description: string;
  enabled: boolean;
  iconContainerClassName: string;
  iconClassName: string;
};

export type ToggleItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
};

export type PowerItem =
  | {
      label: string;
      description: string;
      icon: LucideIcon;
      enabled: boolean;
      input?: false;
    }
  | {
      label: string;
      description: string;
      icon: LucideIcon;
      value: string;
      input: true;
    };

export const stats: DeviceSettingsStat[] = [
  {
    label: "Active Devices",
    value: "3",
    icon: Cpu,
    iconContainerClassName: "bg-violet-100",
    iconClassName: "text-violet-600",
  },
  {
    label: "Registered Numbers",
    value: "4",
    icon: Phone,
    iconContainerClassName: "bg-blue-100",
    iconClassName: "text-blue-600",
  },
  {
    label: "Active Modes",
    value: "5",
    icon: Power,
    iconContainerClassName: "bg-emerald-100",
    iconClassName: "text-emerald-600",
  },
  {
    label: "Last Updated",
    value: "2 min ago",
    icon: Clock,
    iconContainerClassName: "bg-orange-100",
    iconClassName: "text-orange-600",
  },
];

export const tabs: DeviceSettingsTab[] = [
  { value: "communication", label: "Communication", icon: Phone },
  { value: "intervals", label: "Intervals", icon: Clock },
  { value: "advanced", label: "Advanced", icon: Settings2 },
];

export const contacts: ContactItem[] = [
  {
    label: "Primary Number",
    number: "+91 9988776655",
    badge: "Primary",
    badgeVariant: "secondary",
    indicatorClassName: "bg-green-500",
  },
  {
    label: "Secondary Number",
    number: "+91 7788994433",
    badge: "Secondary",
    badgeVariant: "secondary",
    indicatorClassName: "bg-blue-500",
  },
  {
    label: "Control Room",
    number: "+91 8877665544",
    badge: "Emergency",
    badgeVariant: "destructive",
    indicatorClassName: "bg-red-500",
  },
  {
    label: "Backup Number",
    number: "+91 7799886655",
    badge: "Backup",
    badgeVariant: "secondary",
    indicatorClassName: "bg-blue-500",
  },
];

export const intervalItems: IntervalItem[] = [
  {
    label: "Normal Sending Interval",
    value: "600s",
    description: "Standard data transmission",
  },
  {
    label: "SOS Sending Interval",
    value: "60s",
    description: "Emergency transmission",
    urgent: true,
  },
  {
    label: "Normal GPS Interval",
    value: "300s",
    description: "Standard GPS update",
  },
  {
    label: "Aeroplane Scan Interval",
    value: "400s",
    description: "Flight mode scanning",
  },
  {
    label: "Low Battery Data Interval",
    value: "900s",
    description: "Power saving mode",
  },
  {
    label: "Low Battery GPS Interval",
    value: "600s",
    description: "Power saving GPS",
  },
];

export const modeItems: ModeItem[] = [
  {
    icon: Lock,
    label: "Privacy Mode",
    description: "Enable privacy protection",
    enabled: true,
    iconContainerClassName: "bg-violet-100",
    iconClassName: "text-violet-600",
  },
  {
    icon: EyeOff,
    label: "Incognito Mode",
    description: "Hide device activity",
    enabled: true,
    iconContainerClassName: "bg-blue-100",
    iconClassName: "text-blue-600",
  },
  {
    icon: Wifi,
    label: "Aeroplane Active",
    description: "Flight mode enabled",
    enabled: true,
    iconContainerClassName: "bg-orange-100",
    iconClassName: "text-orange-600",
  },
  {
    icon: Users,
    label: "School Access",
    description: "Educational mode",
    enabled: true,
    iconContainerClassName: "bg-emerald-100",
    iconClassName: "text-emerald-600",
  },
  {
    icon: AlertTriangle,
    label: "DNT",
    description: "Do not track",
    enabled: false,
    iconContainerClassName: "bg-red-100",
    iconClassName: "text-red-600",
  },
  {
    icon: Eye,
    label: "LED ON",
    description: "Indicator lights",
    enabled: false,
    iconContainerClassName: "bg-yellow-100",
    iconClassName: "text-yellow-600",
  },
  {
    icon: Shield,
    label: "Safe Mode",
    description: "Restricted operation",
    enabled: false,
    iconContainerClassName: "bg-indigo-100",
    iconClassName: "text-indigo-600",
  },
];

export const featureToggleItems: ToggleItem[] = [
  {
    label: "I/C Call Enable",
    description: "Incoming calls allowed",
    icon: Phone,
    enabled: false,
  },
];

export const powerItems: PowerItem[] = [
  {
    label: "Calling Enable",
    description: "Enable call features",
    icon: Phone,
    enabled: true,
  },
  {
    label: "O/g Call Enable",
    description: "Outgoing calls allowed",
    icon: Upload,
    enabled: false,
  },
  {
    label: "Temp Comp.",
    description: "Temperature compensation",
    icon: Thermometer,
    enabled: false,
  },
  {
    label: "Battery Reserved %",
    description: "Reserve battery level",
    icon: Battery,
    input: true,
    value: "10",
  },
  {
    label: "Low Battery %",
    description: "Low battery threshold",
    icon: Battery,
    input: true,
    value: "30",
  },
];

export const deprecatedItems: ToggleItem[] = [
  {
    label: "Incog Sett. Allow",
    description: "Allow incognito settings",
    icon: Lock,
    enabled: false,
  },
  {
    label: "Extended History",
    description: "Extended data retention",
    icon: Clock,
    enabled: false,
  },
  {
    label: "Call sec. matrix",
    description: "Secure call routing",
    icon: Shield,
    enabled: false,
  },
  {
    label: "Extended GEO-F",
    description: "Extended geofencing",
    icon: MapPin,
    enabled: false,
  },
  {
    label: "Ble Enabled",
    description: "Bluetooth low energy",
    icon: Wifi,
    enabled: false,
  },
  {
    label: "Accel Enabled",
    description: "Accelerometer active",
    icon: Gauge,
    enabled: false,
  },
  {
    label: "AI Power Save",
    description: "AI power management",
    icon: Battery,
    enabled: false,
  },
  {
    label: "Access to Police",
    description: "Law enforcement access",
    icon: Users,
    enabled: false,
  },
];

export const ambientListeningActions = [
  {
    label: "Stop Ambient Listening",
    icon: Power,
    variant: "destructive" as const,
  },
  {
    label: "View / Download Audio Files",
    icon: Download,
    variant: "outline" as const,
  },
];

export const communicationIcons = {
  bell: Bell,
  headphones: Headphones,
  phone: Phone,
};
