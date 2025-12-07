import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Phone, 
  Users, 
  X,
  MessageSquare,
  Check,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { CandidateStatus, CandidateStage } from "@/types";

interface StageManagerProps {
  candidateId: number;
  jobId: number;
  currentStage: CandidateStatus;
  candidateName: string;
  onStageUpdate?: (newStage: CandidateStatus) => void;
}

const stageIcons: Record<CandidateStatus, typeof CheckCircle> = {
  sourced: CheckCircle,
  reached_out: MessageSquare,
  phone_screened: Phone,
  team_matched: Users,
  rejected: X,
};

const stageColors: Record<CandidateStatus, string> = {
  sourced: "bg-blue-100 text-blue-800 border-blue-200",
  reached_out: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  phone_screened: "bg-orange-100 text-orange-800 border-orange-200",
  team_matched: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function StageManager({ 
  candidateId, 
  jobId, 
  currentStage, 
  candidateName,
  onStageUpdate 
}: StageManagerProps) {
  const [stages, setStages] = useState<CandidateStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CandidateStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [checkingPipeline, setCheckingPipeline] = useState(false);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await api.candidates.getStages();
        setStages(response.stages);
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };

    const checkPipelineStatus = async () => {
      try {
        setCheckingPipeline(true);
        const response = await api.sourcing.listRunningPipelines();
        const isRunning = response.running_pipelines.some(pipeline => pipeline.job_id === jobId);
        setIsPipelineRunning(isRunning);
      } catch (error) {
        console.error("Error checking pipeline status:", error);
        setIsPipelineRunning(false);
      } finally {
        setCheckingPipeline(false);
      }
    };

    fetchStages();
    checkPipelineStatus();
  }, [jobId]);

  const getCurrentStageInfo = () => {
    return stages.find(stage => stage.id === currentStage);
  };

  const getNextStages = () => {
    const currentStageInfo = getCurrentStageInfo();
    if (!currentStageInfo) return [];
    
    return stages.filter(stage => 
      currentStageInfo.next_stages.includes(stage.id)
    );
  };

  const handleStageUpdate = async () => {
    if (!selectedStage) return;

    setLoading(true);
    try {
      const response = await api.candidates.updateStage(candidateId, jobId, {
        stage: selectedStage,
        notes: notes.trim() || undefined
      });

      if (response.success) {
        onStageUpdate?.(selectedStage);
        setIsDialogOpen(false);
        setSelectedStage(null);
        setNotes("");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
    } finally {
      setLoading(false);
    }
  };

  const openStageDialog = (stage: CandidateStatus) => {
    setSelectedStage(stage);
    setIsDialogOpen(true);
  };

  const handleQuickAction = async (action: 'advance' | 'reject') => {
    if (isPipelineRunning) return;

    const currentStageInfo = getCurrentStageInfo();
    if (!currentStageInfo) return;

    let targetStage: CandidateStatus;
    let actionNotes: string;

    if (action === 'reject') {
      targetStage = 'rejected';
      actionNotes = 'Quick reject action';
    } else {
      // Find the next non-reject stage
      const nextStages = currentStageInfo.next_stages.filter(stage => stage !== 'rejected');
      if (nextStages.length === 0) return;
      targetStage = nextStages[0];
      actionNotes = 'Quick advance action';
    }

    setLoading(true);
    try {
      const response = await api.candidates.updateStage(candidateId, jobId, {
        stage: targetStage,
        notes: actionNotes
      });

      if (response.success) {
        onStageUpdate?.(targetStage);
      }
    } catch (error) {
      console.error("Error updating stage:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentStageInfo = getCurrentStageInfo();
  const nextStages = getNextStages();
  const CurrentIcon = currentStageInfo ? stageIcons[currentStageInfo.id] : CheckCircle;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="h-5 w-5" />
          Candidate Stage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Status Warning */}
        {checkingPipeline ? (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Checking pipeline status...
            </AlertDescription>
          </Alert>
        ) : isPipelineRunning ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sourcing pipeline is currently running for this job. Stage changes are disabled.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Current Stage */}
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`${stageColors[currentStage]} px-3 py-1`}
          >
            {currentStageInfo?.name || currentStage}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentStageInfo?.description}
          </span>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Debug: Stage={currentStage}, Pipeline={isPipelineRunning ? 'Running' : 'Not Running'}, NextStages={nextStages.length}
        </div>

        {/* Quick Actions */}
        {!isPipelineRunning && currentStage !== "rejected" && currentStage !== "team_matched" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Actions:</Label>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleQuickAction('advance')}
                disabled={loading || !nextStages.some(s => s.id !== 'rejected')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Yes - Advance
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleQuickAction('reject')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                No - Reject
              </Button>
            </div>
          </div>
        )}

        {/* Stage Progression */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Manual Actions:</Label>
          
          {nextStages.length > 0 && !isPipelineRunning ? (
            <div className="flex flex-wrap gap-2">
              {nextStages.map((stage) => {
                const StageIcon = stageIcons[stage.id];
                return (
                  <Button
                    key={stage.id}
                    variant="outline"
                    size="sm"
                    onClick={() => openStageDialog(stage.id)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <StageIcon className="h-4 w-4" />
                    Move to {stage.name}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                );
              })}
            </div>
          ) : isPipelineRunning ? (
            <p className="text-sm text-muted-foreground">
              Actions disabled while pipeline is running
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentStage === "rejected" 
                ? "Candidate has been rejected"
                : currentStage === "team_matched"
                ? "Candidate is ready for hire! 🎉"
                : "No further actions available"
              }
            </p>
          )}
        </div>

        {/* Stage Update Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Update Stage: {candidateName}
              </DialogTitle>
              <DialogDescription>
                {selectedStage && stages.find(s => s.id === selectedStage)?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this stage transition..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={loading || isPipelineRunning}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStageUpdate}
                disabled={loading || isPipelineRunning}
              >
                {loading ? "Updating..." : `Move to ${selectedStage && stages.find(s => s.id === selectedStage)?.name}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}