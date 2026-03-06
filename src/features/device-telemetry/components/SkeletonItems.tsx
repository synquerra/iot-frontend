import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const MetricCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="mt-4 pt-3 border-t">
        <Skeleton className="h-4 w-32" />
      </div>
    </CardContent>
  </Card>
);

export const StatusCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ActivityCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40 mt-1" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const SidebarCardSkeleton = ({ lines = 2 }: { lines?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-40" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </CardContent>
  </Card>
);
