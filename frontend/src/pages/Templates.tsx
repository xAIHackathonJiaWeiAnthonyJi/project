import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, FileText, Clock, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form state
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [interviewType, setInterviewType] = useState<string>("takehome");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("48");
  const [questions, setQuestions] = useState<string>("[]");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesData, jobsData] = await Promise.all([
        api.interviews.getTemplates(),
        api.jobs.getAll(),
      ]);
      setTemplates(templatesData);
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(questions);
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Questions must be valid JSON array",
          variant: "destructive",
        });
        return;
      }

      await api.interviews.createTemplate({
        job_id: parseInt(selectedJob),
        interview_type: interviewType,
        title,
        description,
        questions: parsedQuestions,
        evaluation_criteria: {
          code_quality: 25,
          problem_solving: 25,
          technical_correctness: 25,
          best_practices: 15,
          testing: 10,
        },
        time_limit_hours: parseInt(timeLimit),
      });

      toast({
        title: "Template Created!",
        description: "Interview template created successfully",
      });

      setIsCreateOpen(false);
      fetchData();
      
      // Reset form
      setTitle("");
      setDescription("");
      setQuestions("[]");
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Templates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading..." : `${templates.length} templates`}
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </header>

      <div className="p-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No templates yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first interview template to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const job = jobs.find((j) => j.id === template.job_id);
              return (
                <Card key={template.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      className={
                        template.interview_type === "takehome"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }
                    >
                      {template.interview_type === "takehome"
                        ? "Take-Home"
                        : "Phone Screen"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">
                    {template.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {job && (
                    <p className="text-xs text-muted-foreground mb-3">
                      For: {job.title}
                    </p>
                  )}

                  {template.time_limit_hours && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {template.time_limit_hours} hour deadline
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Interview Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for screening interviews
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="job">Job</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="takehome">Take-Home Assignment</SelectItem>
                  <SelectItem value="phone_screen">Phone Screen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                placeholder="e.g., React Component Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the assignment or questions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="questions">Questions (JSON Array)</Label>
              <Textarea
                id="questions"
                placeholder='[{"task": "Build a component", "requirements": ["Feature 1", "Feature 2"]}]'
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                rows={5}
                className="mt-2 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter as JSON array. Example: [&#123;"task": "Build X", "requirements": ["A", "B"]&#125;]
              </p>
            </div>

            <div>
              <Label htmlFor="timeLimit">Time Limit (hours)</Label>
              <Input
                id="timeLimit"
                type="number"
                placeholder="48"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title || !description || !selectedJob}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

