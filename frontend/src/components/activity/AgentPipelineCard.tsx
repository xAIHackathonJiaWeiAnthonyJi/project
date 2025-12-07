import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, CheckCircle2, Circle, Clock } from "lucide-react";

interface PipelineStep {
  step: number;
  name: string;
  status: "complete" | "in_progress" | "pending";
  duration?: string;
  result?: string;
}

interface AgentPipelineCardProps {
  agentName: string;
  jobTitle: string;
  steps: PipelineStep[];
  totalCandidates?: number;
}

export function AgentPipelineCard({ agentName, jobTitle, steps, totalCandidates }: AgentPipelineCardProps) {
  const completedSteps = steps.filter(s => s.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;
  
  return (
    <Card className="p-6 bg-card border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{agentName}</h3>
              <Badge variant="secondary" className="text-xs">
                {completedSteps}/{steps.length} steps
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{jobTitle}</p>
          </div>
        </div>
        
        {totalCandidates !== undefined && (
          <Badge variant="outline" className="text-xs">
            {totalCandidates} candidates
          </Badge>
        )}
      </div>
      
      {/* Progress Bar */}
      <Progress value={progress} className="h-1.5 mb-4" />
      
      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.step} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "complete" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : step.status === "in_progress" ? (
                <Clock className="h-4 w-4 text-primary animate-pulse" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={step.status === "complete" ? "text-foreground" : "text-muted-foreground"}>
                  {step.name}
                </span>
                {step.duration && (
                  <span className="text-xs text-muted-foreground">
                    {step.duration}
                  </span>
                )}
              </div>
              {step.result && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.result}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

