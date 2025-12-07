import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Code,
  ThumbsUp,
  Mail,
  Clock,
} from "lucide-react";

interface TeamMatchCardProps {
  match: {
    match_id: number;
    team: {
      id: number;
      name: string;
      description: string;
      tech_stack: string[];
      team_size: number;
      manager_name: string;
      location: string;
    };
    scores: {
      final_score: number;
      similarity_score: number;
      reasoning_adjustment: number;
    };
    match_reasoning: string;
    strengths: string[];
    concerns: string[];
    recommendation: string;
    status: string;
    passes_threshold?: boolean;
    profile_sent_to_manager?: boolean;
    sent_to_manager_at?: string;
    manager_email?: string;
  };
  onApprove?: (matchId: number) => void;
}

const recommendationConfig: Record<string, { label: string; color: string; icon: any }> = {
  strong_match: { label: "Strong Match", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  good_match: { label: "Good Match", color: "bg-blue-100 text-blue-800 border-blue-200", icon: ThumbsUp },
  possible_match: { label: "Possible Match", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle },
  not_recommended: { label: "Not Recommended", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
};

export function TeamMatchCard({ match, onApprove }: TeamMatchCardProps) {
  const config = recommendationConfig[match.recommendation] || recommendationConfig.possible_match;
  const Icon = config.icon;

  const scoreColor =
    match.scores.final_score >= 0.8 ? "text-green-600" :
    match.scores.final_score >= 0.65 ? "text-blue-600" :
    match.scores.final_score >= 0.5 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">{match.team.name}</h3>
            <Badge className={`${config.color} flex items-center gap-1`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
            {match.profile_sent_to_manager && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Sent to Manager
              </Badge>
            )}
            {match.passes_threshold && !match.profile_sent_to_manager && (
              <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Above Threshold
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{match.team.description}</p>
          {match.profile_sent_to_manager && match.manager_email && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Profile sent to <span className="font-medium">{match.manager_email}</span>
              {match.sent_to_manager_at && (
                <span className="ml-1">
                  • {new Date(match.sent_to_manager_at).toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>
        
        <div className="text-right ml-4">
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {(match.scores.final_score * 100).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">Match Score</div>
        </div>
      </div>

      {/* Team Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{match.team.team_size} people</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>{match.team.manager_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{match.team.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>{match.team.tech_stack.length} techs</span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Tech Stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {match.team.tech_stack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Match Analysis
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {match.match_reasoning}
        </p>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {match.strengths && match.strengths.length > 0 && (
          <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border border-emerald-200/50 dark:border-emerald-900/30">
            <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Strengths
            </div>
            <ul className="space-y-1.5">
              {match.strengths.slice(0, 3).map((strength, i) => (
                <li key={i} className="text-xs text-foreground/90 flex items-start gap-2">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.concerns && match.concerns.length > 0 && (
          <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/20 p-3 border border-amber-200/50 dark:border-amber-900/30">
            <div className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Considerations
            </div>
            <ul className="space-y-1.5">
              {match.concerns.slice(0, 3).map((concern, i) => (
                <li key={i} className="text-xs text-foreground/90 flex items-start gap-2">
                  <div className="h-1 w-1 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-3 border border-slate-200 dark:border-slate-800 mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Score Breakdown
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Similarity</div>
            <div className="font-semibold">{(match.scores.similarity_score * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Reasoning</div>
            <div className="font-semibold">{(match.scores.reasoning_adjustment * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Final</div>
            <div className={`font-semibold ${scoreColor}`}>
              {(match.scores.final_score * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {match.status === "pending" && onApprove && (
        <Button
          onClick={() => onApprove(match.match_id)}
          className="w-full"
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Place with This Team
        </Button>
      )}

      {match.status === "offered" && (
        <div className="text-center py-2 text-sm text-muted-foreground">
          ✅ Placement offered
        </div>
      )}
    </Card>
  );
}

