import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DispatchInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  onSuccess?: () => void;
}

export function DispatchInterviewModal({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  jobId,
  jobTitle,
  onSuccess,
}: DispatchInterviewModalProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, jobId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.interviews.getTemplates({ job_id: jobId });
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load interview templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.interviews.dispatchInterview({
        candidate_id: candidateId,
        job_id: jobId,
        template_id: parseInt(selectedTemplate),
      });

      toast({
        title: "Interview Dispatched!",
        description: `Interview sent to ${candidateName}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error dispatching interview:", error);
      toast({
        title: "Error",
        description: "Failed to dispatch interview",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplateData = templates.find(
    (t) => t.id.toString() === selectedTemplate
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dispatch Interview</DialogTitle>
          <DialogDescription>
            Send an interview to {candidateName} for {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No interview templates found for this job.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  onOpenChange(false);
                  // TODO: Navigate to template creation
                }}
              >
                Create a template first
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="template">Interview Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateData && (
                <div className="rounded-lg border border-border bg-accent/50 p-4">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <p className="text-sm">
                        {selectedTemplateData.interview_type === "takehome"
                          ? "Take-Home Assignment"
                          : "Phone Screen"}
                      </p>
                    </div>
                    {selectedTemplateData.time_limit_hours && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Time Limit
                        </Label>
                        <p className="text-sm">
                          {selectedTemplateData.time_limit_hours} hours
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplateData.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDispatch}
            disabled={submitting || !selectedTemplate || loading}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Dispatch Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

