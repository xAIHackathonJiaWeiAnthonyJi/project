import { ActivityEvent } from "@/types";
import { 
  Users, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  Settings,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  events: ActivityEvent[];
  compact?: boolean;
}

const eventIcons: Record<string, typeof Users> = {
  sourced: Users,
  screened: Sparkles,
  override: RefreshCw,
  status_change: ArrowRight,
  policy_update: Settings,
};

const eventColors: Record<string, string> = {
  sourced: "bg-status-sourced/20 text-status-sourced",
  screened: "bg-primary/20 text-primary",
  override: "bg-warning/20 text-warning",
  status_change: "bg-status-interview/20 text-status-interview",
  policy_update: "bg-status-screened/20 text-status-screened",
};

export function ActivityFeed({ events, compact = false }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const Icon = eventIcons[event.type] || AlertCircle;
        return (
          <div 
            key={event.id}
            className={cn(
              "flex items-start gap-3 animate-fade-in",
              !compact && "p-3 rounded-lg hover:bg-secondary/30 transition-colors"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              eventColors[event.type]
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-foreground",
                compact ? "text-sm" : "text-base"
              )}>
                {event.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
