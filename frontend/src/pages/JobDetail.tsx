import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { SourcingControl } from "@/components/sourcing/SourcingControl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Zap, 
  Sparkles,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";
import { CandidateStatus, Job, Candidate } from "@/types";

const pipelineStages: { label: string; status: CandidateStatus }[] = [
  { label: "Sourced", status: "sourced" },
  { label: "Screened", status: "screened" },
  { label: "Take-home", status: "takehome_assigned" },
  { label: "Interview", status: "interview" },
  { label: "Offer", status: "offer" },
];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState<CandidateStatus>("screened");
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const jobId = parseInt(id);
        
        // Fetch job details and candidates in parallel
        const [jobData, candidatesData] = await Promise.all([
          api.jobs.getById(jobId),
          api.candidates.getAll({ job_id: jobId })
        ]);
        
        setJob(jobData);
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Job not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const stageCandidates = candidates.filter((c) => c.status === activeStage);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-8 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {job.candidateCount} candidates
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {job.headcount} to hire
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  {job.screenedCount} screened
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Auto Source
              </Button>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Run Screening
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="px-8 pb-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {pipelineStages.map((stage, index) => {
              const count = candidates.filter((c) => c.status === stage.status).length;
              const isActive = activeStage === stage.status;
              
              return (
                <button
                  key={stage.status}
                  onClick={() => setActiveStage(stage.status)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                  {stage.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Sourcing Control */}
        <div className="mb-8">
          <SourcingControl 
            job={job}
            onPipelineStart={() => {
              // Refresh candidates when pipeline starts
              const refreshData = async () => {
                try {
                  const candidatesData = await api.candidates.getAll({ job_id: job.id });
                  setCandidates(candidatesData);
                } catch (error) {
                  console.error("Error refreshing candidates:", error);
                }
              };
              refreshData();
            }}
            onPipelineComplete={() => {
              // Refresh candidates when pipeline completes
              const refreshData = async () => {
                try {
                  const candidatesData = await api.candidates.getAll({ job_id: job.id });
                  setCandidates(candidatesData);
                } catch (error) {
                  console.error("Error refreshing candidates:", error);
                }
              };
              refreshData();
            }}
          />
        </div>

        {/* Candidates in Stage */}
        <div className="space-y-4">
          {stageCandidates.length > 0 ? (
            stageCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-card">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No candidates in this stage</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Candidates will appear here once they reach the {activeStage} stage.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
