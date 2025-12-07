import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Play, 
  Square, 
  RefreshCw, 
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface RunningPipeline {
  job_id: number;
  pipeline_id: string;
}

interface PipelineWithJob extends RunningPipeline {
  job_title?: string;
  job_description?: string;
}

export default function AgentControlCenter() {
  const [runningPipelines, setRunningPipelines] = useState<PipelineWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPipelines = async () => {
    try {
      const pipelinesData = await api.sourcing.listRunningPipelines();
      
      // Fetch job details for each pipeline
      const pipelinesWithJobs = await Promise.all(
        pipelinesData.running_pipelines.map(async (pipeline) => {
          try {
            const job = await api.jobs.getById(pipeline.job_id);
            return {
              ...pipeline,
              job_title: job.title,
              job_description: job.description
            };
          } catch (error) {
            return {
              ...pipeline,
              job_title: `Job ${pipeline.job_id}`,
              job_description: "Unable to load job details"
            };
          }
        })
      );
      
      setRunningPipelines(pipelinesWithJobs);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
    }
  };

  const refreshPipelines = async () => {
    setRefreshing(true);
    await fetchPipelines();
    setRefreshing(false);
  };

  const stopPipeline = async (jobId: number) => {
    try {
      await api.sourcing.stopPipeline(jobId);
      await fetchPipelines(); // Refresh the list
    } catch (error) {
      console.error("Error stopping pipeline:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPipelines();
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Control Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor and control AI sourcing pipelines
            </p>
          </div>
          <Button onClick={refreshPipelines} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{runningPipelines.length}</p>
                <p className="text-sm text-muted-foreground">Active Pipelines</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-sm text-muted-foreground">Pipeline Steps</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <CheckCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {runningPipelines.length > 0 ? "Running" : "Idle"}
                </p>
                <p className="text-sm text-muted-foreground">System Status</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Running Pipelines */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Running Pipelines</h2>
            <Badge variant={runningPipelines.length > 0 ? "default" : "secondary"}>
              {runningPipelines.length} Active
            </Badge>
          </div>

          {loading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading pipelines...</span>
              </div>
            </Card>
          ) : runningPipelines.length > 0 ? (
            <div className="space-y-4">
              {runningPipelines.map((pipeline) => (
                <Card key={pipeline.pipeline_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {pipeline.job_title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Job ID: {pipeline.job_id}
                          </p>
                        </div>
                        <Badge variant="default" className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Running
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {pipeline.job_description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Pipeline ID: <code className="font-mono">{pipeline.pipeline_id}</code></span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/jobs/${pipeline.job_id}`, '_blank')}
                      >
                        View Job
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => stopPipeline(pipeline.job_id)}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Pipelines</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a sourcing pipeline from any job to see it here.
                </p>
                <Button onClick={() => window.open('/jobs', '_blank')}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Sourcing
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Pipeline Steps Info */}
        <Card className="mt-8 p-6">
          <h3 className="font-semibold text-foreground mb-4">Pipeline Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, name: "Job Embedding", desc: "Generate vector embedding from job description" },
              { step: 2, name: "Topic Discovery", desc: "AI discovers relevant topics and search queries" },
              { step: 3, name: "X User Search", desc: "Find active users posting about topics" },
              { step: 4, name: "Role Verification", desc: "AI verifies users are developers" },
              { step: 5, name: "LinkedIn Enrichment", desc: "Enrich profiles with LinkedIn data" },
              { step: 6, name: "Compatibility Scoring", desc: "AI scores candidate-job fit" },
              { step: 7, name: "Candidate Routing", desc: "Route candidates based on scores" },
              { step: 8, name: "Outreach (Optional)", desc: "Send personalized outreach messages" }
            ].map((step) => (
              <div key={step.step} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {step.step}
                  </span>
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}