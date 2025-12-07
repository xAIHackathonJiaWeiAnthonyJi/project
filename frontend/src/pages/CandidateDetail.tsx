import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StageManager } from "@/components/candidates/StageManager";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Github, 
  Twitter, 
  Linkedin,
  MapPin,
  Mail,
  Star,
  GitFork,
  Calendar,
  Sparkles,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { Candidate, CandidateStatus } from "@/types";
import { QuickActionModal } from "../components/candidates/QuickActionModal";

const statusLabels: Record<string, string> = {
  sourced: "SOURCED",
  reached_out: "REACHED OUT",
  phone_screened: "PHONE SCREENED",
  team_matched: "TEAM MATCHED",
  rejected: "REJECTED",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  sourced: "outline",
  reached_out: "secondary",
  phone_screened: "default",
  team_matched: "default",
  rejected: "destructive",
};

function getScoreColor(score: number): string {
  if (score >= 7) return "text-score-high";
  if (score >= 4) return "text-score-medium";
  return "text-score-low";
}

export default function CandidateDetail() {
  const { id, jobId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<CandidateStatus>("sourced");
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Debug logging
  console.log("CandidateDetail - id:", id, "jobId:", jobId, "isQuickActionOpen:", isQuickActionOpen);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const candidateId = parseInt(id);
        
        if (jobId) {
          // If we have job context, get candidates for that job to get stage info
          const jobCandidates = await api.candidates.getAll({ job_id: parseInt(jobId) });
          const candidateData = jobCandidates.find(c => c.id === candidateId);
          if (candidateData) {
            setCandidate(candidateData);
            setCurrentStage(candidateData.status || "sourced");
          } else {
            // Fallback to general candidate data
            const candidateData = await api.candidates.getById(candidateId);
            setCandidate(candidateData);
          }
        } else {
          // No job context, get general candidate data
          const candidateData = await api.candidates.getById(candidateId);
          setCandidate(candidateData);
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id, jobId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading candidate details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-30">
        <div className="px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-lg bg-accent flex items-center justify-center ring-1 ring-border">
              <span className="text-2xl font-semibold text-muted-foreground">
                {candidate.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{candidate.name}</h1>
                {(candidate.status || currentStage) && (
                  <Badge variant={statusVariants[candidate.status || currentStage]}>
                    {statusLabels[candidate.status || currentStage]}
                  </Badge>
                )}
                {candidate.aiScore !== undefined && (
                  <span className={`text-lg font-mono font-semibold ${getScoreColor(candidate.aiScore)}`}>
                    {candidate.aiScore.toFixed(1)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {candidate.linkedin_data?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.linkedin_data.location}
                  </span>
                )}
                {candidate.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {candidate.email}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                {candidate.linkedin_data?.github_stats && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`https://github.com/${candidate.name.toLowerCase().replace(' ', '')}`, '_blank')}
                  >
                    <Github className="h-3.5 w-3.5 mr-1.5" />
                    GitHub
                  </Button>
                )}
                {candidate.x_handle && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`https://twitter.com/${candidate.x_handle}`, '_blank')}
                  >
                    <Twitter className="h-3.5 w-3.5 mr-1.5" />
                    Twitter
                  </Button>
                )}
                {candidate.linkedin_data?.profile_url && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(candidate.linkedin_data.profile_url, '_blank')}
                  >
                    <Linkedin className="h-3.5 w-3.5 mr-1.5" />
                    LinkedIn
                  </Button>
                )}
              </div>
            </div>

            {jobId && (
              <div className="text-sm text-muted-foreground">
                Job Context Available - Stage management below
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            {(candidate.linkedin_data?.headline || candidate.aiSummary) && (
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">AI Summary</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {candidate.aiSummary || candidate.linkedin_data?.headline}
                </p>
              </section>
            )}

            {/* AI Reasoning */}
            {candidate.aiReasoning && (
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">AI Reasoning</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {candidate.aiReasoning}
                </p>
              </section>
            )}

            {/* Experience */}
            {candidate.linkedin_data?.experience && candidate.linkedin_data.experience.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">Experience</h2>
                <div className="space-y-4">
                  {candidate.linkedin_data.experience.map((exp, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent text-xs font-medium text-muted-foreground">
                        {exp.company.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">{exp.company} · {exp.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {candidate.linkedin_data?.skills && candidate.linkedin_data.skills.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.linkedin_data.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Stage Management & GitHub Stats */}
          <div className="space-y-6">
            {/* Stage Manager - only show if we have job context */}
            {jobId && (
              <StageManager
                candidateId={candidate.id}
                jobId={parseInt(jobId)}
                currentStage={currentStage}
                candidateName={candidate.name}
                onStageUpdate={(newStage) => {
                  setCurrentStage(newStage);
                  // Update the candidate object if it has status
                  if (candidate.status !== undefined) {
                    setCandidate(prev => prev ? { ...prev, status: newStage } : null);
                  }
                }}
              />
            )}

            {/* GitHub Stats */}
            {candidate.linkedin_data?.github_stats && (
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">GitHub</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{candidate.linkedin_data.github_stats.repos}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Repos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{candidate.linkedin_data.github_stats.stars.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Stars</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{candidate.linkedin_data.github_stats.contributions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Contributions</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.linkedin_data.github_stats.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Timeline */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sourced</span>
                  <span className="text-foreground">{new Date(candidate.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground">{new Date(candidate.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Quick Action Modal */}
      {candidate && (
        <QuickActionModal
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          candidateId={candidate.id}
          candidateName={candidate.name}
          currentStage={candidate.status || currentStage}
          jobId={jobId ? parseInt(jobId) : undefined}
          onStageUpdate={(newStage) => {
            setCurrentStage(newStage);
            if (candidate.status !== undefined) {
              setCandidate(prev => prev ? { ...prev, status: newStage } : null);
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}
