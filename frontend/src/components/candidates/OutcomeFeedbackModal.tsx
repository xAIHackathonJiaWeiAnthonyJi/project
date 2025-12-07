import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OutcomeFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
  jobId: number;
  candidateName: string;
}

export function OutcomeFeedbackModal({ 
  isOpen, 
  onClose, 
  candidateId, 
  jobId, 
  candidateName 
}: OutcomeFeedbackModalProps) {
  const [outcome, setOutcome] = useState<string>('');
  const [performanceRating, setPerformanceRating] = useState<number>(0);
  const [retentionMonths, setRetentionMonths] = useState<string>('');
  const [wouldHireAgain, setWouldHireAgain] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) {
      toast({
        title: 'Error',
        description: 'Please select an outcome',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/learning/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          job_id: jobId,
          outcome,
          outcome_reason: reason || null,
          performance_rating: outcome === 'hired' && performanceRating > 0 ? performanceRating : null,
          retention_months: outcome === 'hired' && retentionMonths ? parseInt(retentionMonths) : null,
          would_hire_again: outcome === 'hired' && wouldHireAgain ? wouldHireAgain === 'yes' : null,
          reported_by: 'recruiter'
        })
      });

      if (!response.ok) throw new Error('Failed to record outcome');

      const data = await response.json();

      toast({
        title: 'Success',
        description: `Outcome recorded! AI was ${data.ai_was_correct ? 'correct' : 'incorrect'}. The system will learn from this feedback.`
      });

      // Reset form
      setOutcome('');
      setPerformanceRating(0);
      setRetentionMonths('');
      setWouldHireAgain('');
      setReason('');
      
      onClose();
    } catch (error) {
      console.error('Failed to record outcome:', error);
      toast({
        title: 'Error',
        description: 'Failed to record outcome. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Outcome Feedback</DialogTitle>
          <DialogDescription>
            Help the AI learn by reporting what happened with {candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Outcome */}
          <div className="space-y-2">
            <Label>Outcome *</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hired">✅ Hired</SelectItem>
                <SelectItem value="rejected_interview">❌ Rejected at Interview</SelectItem>
                <SelectItem value="rejected_screen">❌ Rejected at Screening</SelectItem>
                <SelectItem value="rejected_sourcing">❌ Rejected at Sourcing</SelectItem>
                <SelectItem value="withdrew">🚪 Candidate Withdrew</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Performance Rating (if hired) */}
          {outcome === 'hired' && (
            <>
              <div className="space-y-2">
                <Label>Performance Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setPerformanceRating(rating)}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= performanceRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  How well is the candidate performing?
                </p>
              </div>

              <div className="space-y-2">
                <Label>Retention (months)</Label>
                <input
                  type="number"
                  value={retentionMonths}
                  onChange={(e) => setRetentionMonths(e.target.value)}
                  placeholder="e.g., 6"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label>Would hire again?</Label>
                <Select value={wouldHireAgain} onValueChange={setWouldHireAgain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Any additional context..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Recording...' : 'Record Outcome'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

