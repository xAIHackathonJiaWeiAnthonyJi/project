import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Clock,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock transcript data for demo
const MOCK_TRANSCRIPT = `Interviewer: Hi Sarah, thanks for joining today. Can you start by telling me about your experience with machine learning?

Candidate: Absolutely! I've been working with ML for about 5 years now. Most recently, I've been focusing on NLP and transformer models. I built a custom sentiment analysis system that improved accuracy by 23% over our previous approach.

Interviewer: That's impressive. Can you walk me through your approach to that project?

Candidate: Sure. We started with a pre-trained BERT model as our base, but found it wasn't capturing domain-specific language well. So I fine-tuned it on 50,000 labeled examples from our industry, implemented custom tokenization for technical jargon, and added a multi-task learning approach to simultaneously predict sentiment and extract key entities.

Interviewer: How did you handle model deployment and monitoring?

Candidate: We deployed it using FastAPI wrapped in Docker containers on Kubernetes. For monitoring, I set up MLflow for experiment tracking and model versioning, plus custom dashboards in Grafana to track inference latency and prediction confidence scores. We also implemented A/B testing to validate improvements before full rollout.

Interviewer: Excellent. Let's talk about a technical challenge. Can you explain the difference between batch normalization and layer normalization, and when you'd use each?

Candidate: Great question. Batch normalization normalizes across the batch dimension, which works well for CNNs with large batches but can be problematic with small batches or in RNNs. Layer normalization, on the other hand, normalizes across the feature dimension for each example independently. I typically use batch norm for vision tasks with sufficient batch sizes, and layer norm for NLP tasks or when working with transformers, since it's more stable with variable sequence lengths.

Interviewer: That's a solid explanation. One more technical question - how would you approach debugging a model that's performing well on training data but poorly on validation data?

Candidate: That's classic overfitting. I'd start by checking for data leakage between train and validation sets. Then I'd look at regularization techniques like dropout, L2 regularization, or early stopping. I'd also examine if the validation set is representative of the problem space. Sometimes it helps to collect more training data or use data augmentation. I'd visualize learning curves to see if the gap between train and validation loss is widening over time.

Interviewer: Perfect. Do you have any questions for me about the role or the team?

Candidate: Yes, I'm curious about the ML infrastructure. What tools and platforms does the team currently use for model development and deployment?

Interviewer: We primarily use Python with PyTorch, deploy on AWS SageMaker, and use Weights & Biases for experiment tracking. We're also exploring MLOps practices to streamline our deployment pipeline.

Candidate: That sounds great. I have experience with all of those tools. One more question - what does success look like for this role in the first 6 months?

Interviewer: Good question. We'd want to see you ramp up on our codebase in the first month, start contributing to model improvements by month 2, and ideally lead a project end-to-end by month 5 or 6.

Candidate: That timeline makes sense. I'm excited about the opportunity.

Interviewer: Wonderful. We'll follow up with next steps within a few days. Thanks for your time today!

Candidate: Thank you! Looking forward to hearing from you.`;

export default function InterviewReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [scoreOverride, setScoreOverride] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      let data: any = await api.interviews.getSubmission(parseInt(id!));
      
      // Add mock transcript for demo purposes if not present
      if (data) {
        // For phone screens, add transcript
        if (!data.call_transcript && (data.template?.interview_type === "phone_screen" || data.template_type === "phone_screen")) {
          data.call_transcript = MOCK_TRANSCRIPT;
          data.call_duration_minutes = 28;
          data.call_recording_url = "#";
        }
        
        // Ensure template exists with proper structure
        if (!data.template && data.template_type) {
          data.template = {
            title: data.template_title || "Technical Phone Screen",
            description: "Phone screen interview",
            interview_type: data.template_type,
          };
        }
      }
      
      setSubmission(data);
    } catch (error) {
      console.error("Error fetching submission:", error);
      
      // Create mock submission data for demo if API fails
      const mockSubmission = {
        id: parseInt(id!),
        candidate: {
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          x_handle: "@sarahj_dev",
          x_bio: "Senior ML Engineer | Building intelligent systems | PyTorch enthusiast",
        },
        job: {
          title: "Senior ML Engineer",
          id: 1,
        },
        template: {
          title: "Technical Phone Screen",
          description: "45-minute technical discussion covering ML fundamentals, system design, and past projects",
          interview_type: "phone_screen",
        },
        template_type: "phone_screen",
        template_title: "Technical Phone Screen",
        status: "reviewed",
        submitted_at: new Date().toISOString(),
        ai_score: 87,
        ai_recommendation: "strong_yes",
        ai_reasoning: "Candidate demonstrated exceptional technical depth in machine learning, particularly in NLP and model deployment. Strong problem-solving skills and clear communication. Experience with production ML systems aligns well with role requirements. Recommended to move forward to next stage.",
        call_transcript: MOCK_TRANSCRIPT,
        call_duration_minutes: 28,
        call_recording_url: "#",
      };
      
      setSubmission(mockSubmission);
      
      toast({
        title: "Using Demo Data",
        description: "Showing sample interview for demonstration",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    if (!submission) return;

    try {
      setSubmitting(true);
      const reviewData = {
        reviewer_name: "Current User", // TODO: Get from auth context
        action,
        reviewer_notes: reviewNotes || undefined,
        score_override: scoreOverride ? parseFloat(scoreOverride) : undefined,
      };

      await api.interviews.reviewSubmission(submission.id, reviewData);

      toast({
        title: action === "approve" ? "Approved!" : "Rejected",
        description: `Submission ${action === "approve" ? "approved" : "rejected"} successfully`,
      });

      navigate("/interviews");
    } catch (error) {
      console.error("Error reviewing submission:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!submission) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Submission not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const scoreColor =
    (submission.ai_score || 0) >= 75 ? "text-green-600" :
    (submission.ai_score || 0) >= 50 ? "text-yellow-600" : "text-red-600";

  const recommendationColor =
    submission.ai_recommendation === "strong_yes" ? "text-green-600" :
    submission.ai_recommendation === "yes" ? "text-blue-600" :
    submission.ai_recommendation === "maybe" ? "text-yellow-600" : "text-red-600";

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interviews
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Review</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {submission.candidate?.name} • {submission.job?.title}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleReview("reject")}
                disabled={submitting || submission.status === "approved" || submission.status === "rejected"}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleReview("approve")}
                disabled={submitting || submission.status === "approved" || submission.status === "rejected"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Advance
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate & Submission */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Info */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">
                  Candidate Information
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold">{submission.candidate?.name}</p>
                  <p className="text-sm text-muted-foreground">{submission.candidate?.email}</p>
                </div>

                {submission.candidate?.x_bio && (
                  <p className="text-sm text-muted-foreground">{submission.candidate.x_bio}</p>
                )}

                <div className="flex gap-2">
                  {submission.candidate?.x_handle && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://twitter.com/${submission.candidate.x_handle}`, '_blank')}
                    >
                      <Twitter className="h-3.5 w-3.5 mr-1.5" />
                      {submission.candidate.x_handle}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Interview Details */}
            <Card className="p-5">
              <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                Interview Details
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Assignment
                  </Label>
                  <p className="text-sm font-medium mt-1">{submission.template?.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {submission.template?.description}
                  </p>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Type
                  </Label>
                  <p className="text-sm mt-1">
                    {submission.template?.interview_type === "takehome" ? "Take-Home Assignment" : "Phone Screen"}
                  </p>
                </div>

                {submission.submitted_at && (
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Submitted
                    </Label>
                    <p className="text-sm mt-1">
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Phone Screen Transcript */}
            {submission.call_transcript && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Interview Transcript
                      </h2>
                      {submission.call_duration_minutes && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {submission.call_duration_minutes} minutes • Phone Screen
                        </p>
                      )}
                    </div>
                  </div>
                  {submission.call_recording_url && submission.call_recording_url !== "#" && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={submission.call_recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Recording
                      </a>
                    </Button>
                  )}
                </div>

                <div className="rounded-lg bg-muted/30 p-5 border border-border max-h-[600px] overflow-y-auto">
                  <div className="space-y-4">
                    {submission.call_transcript.split('\n\n').filter((p: string) => p.trim()).map((paragraph: string, index: number) => {
                      const trimmedParagraph = paragraph.trim();
                      const isInterviewer = trimmedParagraph.startsWith('Interviewer:');
                      const isCandidate = trimmedParagraph.startsWith('Candidate:');
                      
                      if (!isInterviewer && !isCandidate) return null;
                      
                      const speaker = isInterviewer ? 'Interviewer' : 'Candidate';
                      const text = trimmedParagraph.replace(/^(Interviewer|Candidate):\s*/, '');
                      
                      return (
                        <div 
                          key={index}
                          className={`flex gap-3 ${isCandidate ? 'ml-4' : ''}`}
                        >
                          <div className={`flex-shrink-0 w-20 pt-0.5`}>
                            <span className={`text-xs font-semibold ${
                              isInterviewer 
                                ? 'text-primary' 
                                : 'text-success'
                            }`}>
                              {speaker}:
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">
                              {text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Auto-transcribed and analyzed by AI</span>
                </div>
              </Card>
            )}

            {/* Submission Data */}
            {submission.submission_data && Object.keys(submission.submission_data).length > 0 && !submission.call_transcript && (
              <Card className="p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                  Candidate Submission
                </h2>

                <div className="space-y-3">
                  {Object.entries(submission.submission_data).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </Label>
                      {typeof value === "string" && value.startsWith("http") ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                        >
                          {value}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm mt-1">{String(value)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Evaluation */}
            {submission.ai_reasoning && (
              <Card className="p-6 border-purple-200/60 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-purple-50/30 dark:from-purple-950/10 dark:via-blue-950/10 dark:to-purple-950/10 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-purple-200/40 dark:border-purple-800/30">
                  <div className="p-2 rounded-lg bg-purple-100/80 dark:bg-purple-900/30">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      AI Evaluation
                    </h2>
                    <p className="text-xs text-muted-foreground">Powered by Grok AI</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Score Section */}
                  <div className="rounded-xl bg-white/60 dark:bg-slate-900/40 p-4 border border-purple-100/60 dark:border-purple-900/30">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3 block">
                      Overall Score
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`text-4xl font-bold ${scoreColor}`}>
                          {submission.ai_score?.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">out of 100</div>
                      </div>
                      <div className="h-12 w-px bg-border"></div>
                      {submission.ai_recommendation && (
                        <Badge className={`${recommendationColor} px-3 py-1.5 text-sm font-medium`}>
                          {submission.ai_recommendation.replace("_", " ").toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Reasoning Section */}
                  <div className="rounded-xl bg-slate-50/60 dark:bg-slate-900/30 p-4 border border-slate-200/60 dark:border-slate-800/50">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3 block">
                      Detailed Analysis
                    </Label>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {submission.ai_reasoning}
                    </p>
                  </div>

                  {/* Strengths Section */}
                  {submission.ai_strengths && submission.ai_strengths.length > 0 && (
                    <div className="rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 p-4 border border-emerald-200/50 dark:border-emerald-900/30">
                      <Label className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold mb-3 block flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Key Strengths
                      </Label>
                      <ul className="space-y-2.5">
                        {submission.ai_strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2.5 pl-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                            <span className="leading-relaxed">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses Section */}
                  {submission.ai_weaknesses && submission.ai_weaknesses.length > 0 && (
                    <div className="rounded-xl bg-amber-50/40 dark:bg-amber-950/20 p-4 border border-amber-200/50 dark:border-amber-900/30">
                      <Label className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400 font-semibold mb-3 block flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Areas for Improvement
                      </Label>
                      <ul className="space-y-2.5">
                        {submission.ai_weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2.5 pl-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                            <span className="leading-relaxed">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Review Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-5">
              <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                Status
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Current Status</Label>
                  <Badge className="mt-1">
                    {submission.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                {submission.human_reviewed && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Reviewed By</Label>
                      <p className="text-sm mt-1">{submission.reviewed_by}</p>
                    </div>
                    {submission.reviewed_at && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                        <p className="text-sm mt-1">
                          {new Date(submission.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Review Form */}
            {submission.status === "reviewed" && (
              <Card className="p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                  Your Review
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="score-override">Score Override (Optional)</Label>
                    <Input
                      id="score-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Leave empty to use AI score"
                      value={scoreOverride}
                      onChange={(e) => setScoreOverride(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Override AI score if you disagree
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="review-notes">Review Notes</Label>
                    <Textarea
                      id="review-notes"
                      placeholder="Add your thoughts, feedback, or reasoning..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      {submission.status === "reviewed" && 
                        "This submission needs your review. Approve to advance the candidate or reject with feedback."}
                      {submission.status === "approved" && 
                        "This submission has been approved. The candidate will advance to the next stage."}
                      {submission.status === "rejected" && 
                        "This submission has been rejected."}
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            )}

            {/* Previous Reviews */}
            {submission.reviewer_notes && (
              <Card className="p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                  Previous Review
                </h2>
                <p className="text-sm text-muted-foreground">{submission.reviewer_notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

