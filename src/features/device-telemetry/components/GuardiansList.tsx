import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Phone } from "lucide-react";

interface GuardiansListProps {
  guardian1: string;
  guardian1Phone: string;
  guardian2: string;
  guardian2Phone: string;
}

export function GuardiansList({
  guardian1,
  guardian1Phone,
  guardian2,
  guardian2Phone,
}: GuardiansListProps) {
  const guardians = [
    { name: guardian1, phone: guardian1Phone, initials: "RK" },
    { name: guardian2, phone: guardian2Phone, initials: "AS" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardians</CardTitle>
        <CardDescription>Emergency contacts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guardians.map((guardian, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary">
                {guardian.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{guardian.name}</p>
              <p className="text-xs text-muted-foreground">{guardian.phone}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call now</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
