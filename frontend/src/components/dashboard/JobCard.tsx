import { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const progress = Math.round((job.screenedCount / job.candidateCount) * 100);

  return (
    <div 
      className="group rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:bg-accent/30 cursor-pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{job.title}</h3>
            <Badge 
              variant={job.status === "active" ? "default" : "secondary"}
              className="text-[10px] uppercase"
            >
              {job.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{job.description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-3" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.requirements.slice(0, 4).map((req) => (
          <Badge key={req} variant="outline" className="text-[10px] py-0">
            {req}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {job.candidateCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {job.headcount} to hire
          </span>
        </div>
        <span>{job.screenedCount}/{job.candidateCount} screened</span>
      </div>

      <div className="mt-2">
        <div className="h-1 w-full rounded-full bg-accent overflow-hidden">
          <div 
            className="h-full rounded-full bg-muted-foreground/40 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-7"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Zap className="h-3 w-3 mr-1" />
          Source
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-7"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Screen
        </Button>
      </div>
    </div>
  );
}
