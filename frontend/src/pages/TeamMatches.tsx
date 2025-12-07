import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { TeamMatchCard } from "@/components/teams/TeamMatchCard";
import { ArrowLeft, Sparkles, Loader2, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeamMatches() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    if (candidateId) {
      fetchData();
    }
  }, [candidateId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchData, candidateData] = await Promise.all([
        api.teams.getCandidateMatches(parseInt(candidateId!)),
        api.candidates.getById(parseInt(candidateId!)),
      ]);
      setMatches(matchData);
      setCandidate(candidateData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load team matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async () => {
    if (!candidate?.jobId) {
      toast({
        title: "Error",
        description: "No job context available for matching",
        variant: "destructive",
      });
      return;
    }

    try {
      setMatching(true);
      await api.teams.matchCandidate(parseInt(candidateId!), candidate.jobId);
      
      toast({
        title: "Team Matching Complete!",
        description: "AI has analyzed the best team fits for this candidate",
      });
      
      // Refresh matches
      await fetchData();
    } catch (error) {
      console.error("Error running matching:", error);
      toast({
        title: "Error",
        description: "Failed to run team matching",
        variant: "destructive",
      });
    } finally {
      setMatching(false);
    }
  };

  const handleApprove = async (matchId: number) => {
    try {
      await api.teams.approveMatch(matchId, "Current User");
      
      toast({
        title: "Placement Approved!",
        description: "Candidate will be offered this team placement",
      });
      
      await fetchData();
    } catch (error) {
      console.error("Error approving match:", error);
      toast({
        title: "Error",
        description: "Failed to approve placement",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

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
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Matching</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {candidate?.name} • AI-powered team placement
              </p>
            </div>

            {matches.length === 0 && (
              <Button onClick={handleRunMatching} disabled={matching}>
                {matching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Team Matching
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            Our AI analyzes the candidate's skills, experience, and interests against team tech stacks, 
            current needs, and culture to recommend the best placements. Scores combine embedding similarity (70%) 
            and LLM reasoning (30%).
          </AlertDescription>
        </Alert>

        {/* Matches */}
        {matches.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  {matches.length} Team{matches.length !== 1 ? "s" : ""} Ranked
                </h2>
              </div>
              <Button
                onClick={handleRunMatching}
                variant="outline"
                size="sm"
                disabled={matching}
              >
                {matching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  "Re-run Matching"
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {matches.map((match) => (
                <TeamMatchCard
                  key={match.match_id || match.id}
                  match={match}
                  onApprove={handleApprove}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-accent p-6 mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Team Matches Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Run the AI team matching algorithm to find the best team placements 
              for this candidate based on their skills and experience.
            </p>
            <Button onClick={handleRunMatching} disabled={matching || !candidate?.jobId}>
              {matching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Team Matching
                </>
              )}
            </Button>
            {!candidate?.jobId && (
              <p className="text-xs text-muted-foreground mt-2">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                No job context available
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

