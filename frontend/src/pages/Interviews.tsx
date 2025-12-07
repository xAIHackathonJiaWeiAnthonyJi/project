import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye,
  TrendingUp,
  Award,
  Timer,
  Target,
  Users,
} from "lucide-react";

// Mock data for demo purposes
const MOCK_SUBMISSIONS = Array.from({ length: 24 }, (_, i) => {
  const statuses = ["sent", "submitted", "evaluating", "reviewed", "approved", "rejected"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const hasScore = ["submitted", "evaluating", "reviewed", "approved", "rejected"].includes(status);
  
  return {
    id: i + 1,
    candidate_name: [
      "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim",
      "Jessica Martinez", "Ryan Patel", "Amanda Thompson", "James Wilson",
      "Maria Garcia", "Kevin Lee", "Laura Davis", "Chris Anderson",
      "Nicole Brown", "Alex Turner", "Sophia White", "Daniel Park",
      "Rachel Green", "Tom Harris", "Jennifer Moore", "Brian Scott",
      "Ashley Taylor", "Mark Evans", "Olivia Martin", "Jason Clark"
    ][i],
    candidate_x_handle: `@candidate_${i + 1}`,
    job_title: [
      "Senior ML Engineer", "Full Stack Developer", "DevOps Engineer", 
      "Product Designer", "Data Scientist", "Frontend Developer"
    ][i % 6],
    template_title: [
      "Technical Assessment", "System Design", "Coding Challenge",
      "Product Thinking", "Data Analysis", "UI/UX Challenge"
    ][i % 6],
    template_type: i % 2 === 0 ? "takehome" : "phone_screen",
    status: status,
    ai_score: hasScore ? 45 + Math.floor(Math.random() * 50) : null,
    ai_reasoning: hasScore ? [
      "Strong technical foundation with excellent problem-solving skills. Code quality is high.",
      "Good understanding of core concepts. Some areas need improvement in optimization.",
      "Outstanding performance across all criteria. Clear communication and thorough approach.",
      "Meets basic requirements but lacks depth in advanced topics. Average overall.",
      "Excellent analytical thinking and attention to detail. Well-structured solutions.",
      "Solid technical skills with room for growth. Good potential for the role.",
    ][Math.floor(Math.random() * 6)] : null,
    submitted_at: hasScore ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : null,
    sent_at: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  sent: { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Send },
  submitted: { label: "Submitted", color: "bg-purple-100 text-purple-800", icon: Clock },
  evaluating: { label: "Evaluating", color: "bg-yellow-100 text-yellow-800", icon: TrendingUp },
  reviewed: { label: "Needs Review", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function Interviews() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>(MOCK_SUBMISSIONS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const data = await api.interviews.getSubmissions(params);
      // Use real data if available, otherwise use mock data
      if (data && data.length > 0) {
        setSubmissions(data);
      } else {
        // Filter mock data by status if needed
        if (statusFilter !== "all") {
          setSubmissions(MOCK_SUBMISSIONS.filter(s => s.status === statusFilter));
        } else {
          setSubmissions(MOCK_SUBMISSIONS);
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // Use mock data on error
      if (statusFilter !== "all") {
        setSubmissions(MOCK_SUBMISSIONS.filter(s => s.status === statusFilter));
      } else {
        setSubmissions(MOCK_SUBMISSIONS);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = !searchTerm ||
      sub.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.candidate_x_handle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate comprehensive metrics
  const pendingReview = submissions.filter((s) => s.status === "reviewed").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;
  const sent = submissions.filter((s) => s.status === "sent").length;
  const submitted = submissions.filter((s) => ["submitted", "evaluating", "reviewed", "approved", "rejected"].includes(s.status)).length;
  
  const avgScore = submissions
    .filter((s) => s.ai_score)
    .reduce((acc, s) => acc + s.ai_score, 0) / 
    submissions.filter((s) => s.ai_score).length || 0;
  
  const responseRate = submissions.length > 0 ? (submitted / submissions.length * 100) : 0;
  const approvalRate = (approved + rejected) > 0 ? (approved / (approved + rejected) * 100) : 0;
  
  // Calculate average time to complete (mock calculation based on submission times)
  const completedSubmissions = submissions.filter(s => s.submitted_at && s.sent_at);
  const avgTimeToComplete = completedSubmissions.length > 0
    ? completedSubmissions.reduce((acc, s) => {
        const sent = new Date(s.sent_at).getTime();
        const submitted = new Date(s.submitted_at).getTime();
        return acc + (submitted - sent) / (1000 * 60 * 60 * 24); // days
      }, 0) / completedSubmissions.length
    : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Interview Management</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary rounded-lg">
                <Award className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-xs font-bold text-primary-foreground">AI-Powered</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${submissions.length} total interviews • ${responseRate.toFixed(0)}% response rate`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/templates")} size="lg">
              Manage Templates
            </Button>
            <Button onClick={() => navigate("/interviews/pending")} size="lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              Review ({pendingReview})
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Dispatched</p>
            <p className="text-3xl font-bold">{submissions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {sent} awaiting response
            </p>
          </Card>
          
          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
            <p className="text-3xl font-bold">{pendingReview}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Needs human review
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Approved</p>
            <p className="text-3xl font-bold">{approved}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {approvalRate.toFixed(0)}% approval rate
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Avg AI Score</p>
            <p className="text-3xl font-bold">{avgScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 100
            </p>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{responseRate.toFixed(0)}%</p>
                  <span className="text-xs text-success">+12% vs last month</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Time to Complete</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{avgTimeToComplete.toFixed(1)}</p>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI Accuracy</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">89%</p>
                  <span className="text-xs text-success">High confidence</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by candidate, job, or handle..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "reviewed", "submitted", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {status === "all" ? "All" : statusConfig[status]?.label || status}
              {status === "reviewed" && pendingReview > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({pendingReview})</span>
              )}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading interviews...</div>
          ) : filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status]?.icon || Clock;
              const scoreColor = 
                submission.ai_score >= 75 ? "text-green-600" :
                submission.ai_score >= 50 ? "text-yellow-600" : "text-red-600";

              return (
                <Card
                  key={submission.id}
                  className="p-4 hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/interviews/${submission.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg ${statusConfig[submission.status]?.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">
                              {submission.candidate_name}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {submission.candidate_x_handle}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {submission.job_title} • {submission.template_title}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className={statusConfig[submission.status]?.color}>
                              {statusConfig[submission.status]?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {submission.template_type === "takehome" ? "Take-Home" : "Phone Screen"}
                            </span>
                            {submission.submitted_at && (
                              <span className="text-xs text-muted-foreground">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        {submission.ai_score !== null && submission.ai_score !== undefined && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${scoreColor}`}>
                              {submission.ai_score.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">AI Score</div>
                          </div>
                        )}
                      </div>

                      {/* AI Reasoning Preview */}
                      {submission.ai_reasoning && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                          {submission.ai_reasoning}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      variant={submission.status === "reviewed" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/interviews/${submission.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {submission.status === "reviewed" ? "Review" : "View"}
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Send className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No interviews found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Dispatch some interviews to get started."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

