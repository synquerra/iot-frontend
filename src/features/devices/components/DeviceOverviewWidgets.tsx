import {
  Activity,
  CircleCheckBig,
  CircleOff,
  Filter,
  ShieldCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeviceTable } from "../context/DeviceTableContext";

type WidgetTone = {
  shell: string;
  iconWrap: string;
  footer: string;
  icon: string;
};

const tones: WidgetTone[] = [
  {
    shell: "border-cyan-200 bg-cyan-50/80",
    iconWrap: "bg-cyan-100",
    footer: "bg-cyan-600 text-cyan-50",
    icon: "text-cyan-700",
  },
  {
    shell: "border-emerald-200 bg-emerald-50/80",
    iconWrap: "bg-emerald-100",
    footer: "bg-emerald-600 text-emerald-50",
    icon: "text-emerald-700",
  },
  {
    shell: "border-amber-200 bg-amber-50/90",
    iconWrap: "bg-amber-100",
    footer: "bg-amber-500 text-amber-50",
    icon: "text-amber-700",
  },
  {
    shell: "border-fuchsia-200 bg-fuchsia-50/80",
    iconWrap: "bg-fuchsia-100",
    footer: "bg-fuchsia-600 text-fuchsia-50",
    icon: "text-fuchsia-700",
  },
  {
    shell: "border-violet-200 bg-violet-50/80",
    iconWrap: "bg-violet-100",
    footer: "bg-violet-600 text-violet-50",
    icon: "text-violet-700",
  },
  {
    shell: "border-rose-200 bg-rose-50/80",
    iconWrap: "bg-rose-100",
    footer: "bg-rose-600 text-rose-50",
    icon: "text-rose-700",
  },
];

export function DeviceOverviewWidgets() {
  const { devices, filteredDevices, search, statusFilter } = useDeviceTable();

  const totalDevices = devices.length;
  const visibleDevices = filteredDevices.length;
  const activeDevices = devices.filter((device) => device.status === "active").length;
  const inactiveDevices = totalDevices - activeDevices;
  const assignedDevices = devices.filter((device) => device.studentName).length;
  const unassignedDevices = totalDevices - assignedDevices;
  const recentDevices = devices.filter((device) => {
    if (!device.createdAt) {
      return false;
    }

    const createdAt = new Date(device.createdAt);
    const ageInMs = Date.now() - createdAt.getTime();

    return Number.isFinite(ageInMs) && ageInMs <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  const widgets = [
    {
      title: "Total Devices",
      value: totalDevices,
      description: `${assignedDevices} assigned to students`,
      footer: "Fleet inventory",
      icon: Activity,
    },
    {
      title: "Active",
      value: activeDevices,
      description: `${visibleDevices} currently visible`,
      footer: "Online now",
      icon: CircleCheckBig,
    },
    {
      title: "Inactive",
      value: inactiveDevices,
      description: `${Math.max(inactiveDevices - recentDevices, 0)} older devices inactive`,
      footer: "Needs attention",
      icon: CircleOff,
    },
    {
      title: "Visible Devices",
      value: visibleDevices,
      description: `${totalDevices} total devices in workspace`,
      footer: "Current filters applied",
      icon: Filter,
    },
    {
      title: "Assigned",
      value: assignedDevices,
      description: `${recentDevices} added in the last 7 days`,
      footer: "Linked to students",
      icon: ShieldCheck,
    },
    {
      title: "Unassigned",
      value: unassignedDevices,
      description: "Ready for onboarding",
      footer: "Needs mapping",
      icon: UserRoundX,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold tracking-tight">
                Device Visibility Overview
              </div>
              <div className="text-sm text-muted-foreground">
                {visibleDevices} of {totalDevices} devices currently visible
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Status: {statusFilter === "all" ? "All devices" : statusFilter}
            </Badge>
            {search ? <Badge variant="outline">Search: {search}</Badge> : null}
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Filter className="h-4 w-4" />
              Live Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {widgets.map((widget, index) => {
          const tone = tones[index % tones.length];
          const Icon = widget.icon;

          return (
            <Card
              key={widget.title}
              className={`overflow-hidden border shadow-sm transition-colors ${tone.shell}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between gap-4 px-5 py-5">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold tracking-tight">
                      {widget.value}
                    </div>
                    <div className="text-xl font-semibold leading-none">
                      {widget.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {widget.description}
                    </div>
                  </div>

                  <div className={`rounded-full p-4 ${tone.iconWrap}`}>
                    <Icon className={`h-7 w-7 ${tone.icon}`} />
                  </div>
                </div>

                <div className={`px-5 py-3 text-sm font-medium ${tone.footer}`}>
                  {widget.footer}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
