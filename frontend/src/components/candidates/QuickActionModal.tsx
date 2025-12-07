import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { 
  Check,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle,
  MessageSquare,
  Phone,
  Users
} from "lucide-react";
import { api } from "@/lib/api";
import { CandidateStatus, CandidateStage } from "@/types";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
  candidateName: string;
  currentStage: CandidateStatus;
  jobId?: number;
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

export function QuickActionModal({ 
  isOpen,
  onClose,
  candidateId, 
  candidateName,
  currentStage,
  jobId,
  onStageUpdate 
}: QuickActionModalProps) {
  const [stages, setStages] = useState<CandidateStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [checkingPipeline, setCheckingPipeline] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(jobId || null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        // Fetch stages
        const stagesResponse = await api.candidates.getStages();
        setStages(stagesResponse.stages);

        // If no jobId provided, fetch candidate's jobs
        if (!jobId) {
          const candidateJobs = await api.candidates.getById(candidateId);
          // For now, we'll need to get all jobs and find which ones the candidate is associated with
          const allJobs = await api.jobs.getAll();
          setAvailableJobs(allJobs);
          if (allJobs.length > 0) {
            setSelectedJobId(allJobs[0].id);
          }
        }

        // Check pipeline status if we have a job
        if (jobId || selectedJobId) {
          setCheckingPipeline(true);
          const response = await api.sourcing.listRunningPipelines();
          const targetJobId = jobId || selectedJobId;
          const isRunning = response.running_pipelines.some(pipeline => pipeline.job_id === targetJobId);
          setIsPipelineRunning(isRunning);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCheckingPipeline(false);
      }
    };

    fetchData();
  }, [isOpen, candidateId, jobId, selectedJobId]);

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

  const handleQuickAction = async (action: 'advance' | 'reject') => {
    if (isPipelineRunning || !selectedJobId) return;

    const currentStageInfo = getCurrentStageInfo();
    if (!currentStageInfo) return;

    let targetStage: CandidateStatus;
    let actionNotes: string;

    if (action === 'reject') {
      targetStage = 'rejected';
      actionNotes = notes || 'Quick reject action';
    } else {
      // Find the next non-reject stage
      const nextStages = currentStageInfo.next_stages.filter(stage => stage !== 'rejected');
      if (nextStages.length === 0) return;
      targetStage = nextStages[0];
      actionNotes = notes || 'Quick advance action';
    }

    setLoading(true);
    try {
      const response = await api.candidates.updateStage(candidateId, selectedJobId, {
        stage: targetStage,
        notes: actionNotes
      });

      if (response.success) {
        onStageUpdate?.(targetStage);
        onClose();
        setNotes("");
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
  const canTakeAction = selectedJobId && !isPipelineRunning && currentStage !== "rejected" && currentStage !== "team_matched";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrentIcon className="h-5 w-5" />
            Quick Actions: {candidateName}
          </DialogTitle>
          <DialogDescription>
            Current stage: {currentStageInfo?.name || currentStage}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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
                Sourcing pipeline is currently running. Actions are disabled.
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Job Selection (if multiple jobs available) */}
          {!jobId && availableJobs.length > 1 && (
            <div>
              <Label className="text-sm font-medium">Select Job:</Label>
              <select 
                value={selectedJobId || ""} 
                onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              >
                {availableJobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Current Stage Display */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
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

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Quick Actions */}
          {canTakeAction && (
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => handleQuickAction('advance')}
                disabled={loading || !nextStages.some(s => s.id !== 'rejected')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Accept & Advance"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleQuickAction('reject')}
                disabled={loading}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Reject"}
              </Button>
            </div>
          )}

          {!canTakeAction && !isPipelineRunning && (
            <div className="text-sm text-muted-foreground text-center p-4 bg-muted rounded">
              {currentStage === "rejected" 
                ? "Candidate has been rejected"
                : currentStage === "team_matched"
                ? "Candidate is ready for hire! 🎉"
                : !selectedJobId
                ? "Please select a job to take actions"
                : "No actions available for this stage"
              }
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}