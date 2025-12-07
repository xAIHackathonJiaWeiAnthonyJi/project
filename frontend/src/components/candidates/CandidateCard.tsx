import { Candidate } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Twitter, 
  MapPin, 
  Star,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CandidateCardProps {
  candidate: Candidate;
  jobId?: number;
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  sourced: "outline",
  reached_out: "secondary",
  phone_screened: "default",
  team_matched: "default",
  rejected: "destructive",
};

const statusLabels: Record<string, string> = {
  sourced: "SOURCED",
  reached_out: "REACHED OUT",
  phone_screened: "PHONE SCREENED",
  team_matched: "TEAM MATCHED",
  rejected: "REJECTED",
};

function getScoreColor(score: number): string {
  if (score >= 7) return "text-score-high bg-score-high/10";
  if (score >= 4) return "text-score-medium bg-score-medium/10";
  return "text-score-low bg-score-low/10";
}

export function CandidateCard({ candidate, jobId }: CandidateCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}/candidates/${candidate.id}`);
    } else {
      navigate(`/candidates/${candidate.id}`);
    }
  };

  return (
    <div 
      className="group rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:bg-accent/30 cursor-pointer animate-fade-in"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {candidate.avatarUrl ? (
            <img 
              src={candidate.avatarUrl} 
              alt={candidate.name}
              className="h-11 w-11 rounded-md object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-11 w-11 rounded-md bg-accent flex items-center justify-center ring-1 ring-border">
              <span className="text-base font-semibold text-muted-foreground">
                {candidate.name.charAt(0)}
              </span>
            </div>
          )}
          {candidate.aiScore !== undefined && (
            <div className={cn(
              "absolute -bottom-1 -right-1 h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ring-2 ring-card",
              getScoreColor(candidate.aiScore)
            )}>
              {candidate.aiScore.toFixed(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{candidate.name}</h3>
            <Badge variant={statusVariants[candidate.status || "sourced"]} className="text-[10px]">
              {statusLabels[candidate.status || "sourced"]}
            </Badge>
          </div>
          
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.location}
              </span>
            )}
            {candidate.githubStats && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {candidate.githubStats.stars.toLocaleString()}
              </span>
            )}
          </div>

          {/* Skills */}
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-[10px] py-0">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{candidate.skills.length - 4}</span>
            )}
          </div>

          {/* AI Summary */}
          {candidate.aiSummary && (
            <div className="mt-2 flex items-start gap-1.5 rounded bg-accent/50 px-2 py-1.5">
              <Sparkles className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground line-clamp-1">
                {candidate.aiSummary}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {candidate.githubUrl && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                window.open(candidate.githubUrl, '_blank');
              }}
            >
              <Github className="h-3.5 w-3.5" />
            </Button>
          )}
          {candidate.twitterHandle && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://twitter.com/${candidate.twitterHandle}`, '_blank');
              }}
            >
              <Twitter className="h-3.5 w-3.5" />
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
