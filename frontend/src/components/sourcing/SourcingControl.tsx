import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bot, 
  Play, 
  Square, 
  Settings, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { Job } from "@/types";

interface SourcingControlProps {
  job: Job;
  onPipelineStart?: () => void;
  onPipelineComplete?: () => void;
}

interface PipelineStatus {
  job_id: number;
  is_running: boolean;
  pipeline_id?: string;
  status: string;
}

export function SourcingControl({ job, onPipelineStart, onPipelineComplete }: SourcingControlProps) {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendOutreach, setSendOutreach] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [jobLink, setJobLink] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Poll pipeline status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const statusData = await api.sourcing.getStatus(job.id);
        setStatus(statusData);
      } catch (error) {
        console.error("Error checking pipeline status:", error);
      }
    };

    checkStatus();
    
    // Poll every 2 seconds if pipeline is running
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [job.id]);

  const handleStartPipeline = async () => {
    try {
      setLoading(true);
      const result = await api.sourcing.startPipeline(job.id, {
        sendOutreach,
        dryRun,
        jobLink: jobLink || undefined
      });

      if (result.success) {
        setLastResult(result.message);
        onPipelineStart?.();
      } else {
        setLastResult(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error starting pipeline:", error);
      setLastResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopPipeline = async () => {
    try {
      setLoading(true);
      const result = await api.sourcing.stopPipeline(job.id);
      
      if (result.success) {
        setLastResult(result.message);
        onPipelineComplete?.();
      } else {
        setLastResult(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error stopping pipeline:", error);
      setLastResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = status?.is_running || false;

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Sourcing Agent</h3>
            <p className="text-sm text-muted-foreground">
              Automated candidate discovery pipeline
            </p>
          </div>
        </div>
        
        <Badge variant={isRunning ? "default" : "secondary"} className="flex items-center gap-1.5">
          {isRunning ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3" />
              Ready
            </>
          )}
        </Badge>
      </div>

      {/* Pipeline Status */}
      {status?.pipeline_id && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pipeline ID:</span>
            <code className="font-mono text-xs">{status.pipeline_id}</code>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="send-outreach" className="text-sm font-medium">
              Send Outreach
            </Label>
            <Switch
              id="send-outreach"
              checked={sendOutreach}
              onCheckedChange={setSendOutreach}
              disabled={isRunning}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dry-run" className="text-sm font-medium">
              Dry Run Mode
            </Label>
            <Switch
              id="dry-run"
              checked={dryRun}
              onCheckedChange={setDryRun}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-link" className="text-sm font-medium">
            Job Application Link (Optional)
          </Label>
          <Input
            id="job-link"
            placeholder="https://jobs.company.com/apply/123"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <Button 
            onClick={handleStartPipeline}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Start Sourcing Pipeline
          </Button>
        ) : (
          <Button 
            onClick={handleStopPipeline}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            Stop Pipeline
          </Button>
        )}
        
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{lastResult}</p>
          </div>
        </div>
      )}

      {/* Pipeline Steps Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Pipeline Steps:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <span className="text-muted-foreground">1. Job Embedding</span>
          <span className="text-muted-foreground">2. Topic Discovery</span>
          <span className="text-muted-foreground">3. X User Search</span>
          <span className="text-muted-foreground">4. Role Verification</span>
          <span className="text-muted-foreground">5. LinkedIn Enrichment</span>
          <span className="text-muted-foreground">6. Compatibility Scoring</span>
          <span className="text-muted-foreground">7. Candidate Routing</span>
          <span className="text-muted-foreground">8. Outreach (Optional)</span>
        </div>
      </div>
    </Card>
  );
}