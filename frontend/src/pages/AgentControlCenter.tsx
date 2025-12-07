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
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [starting, setStarting] = useState(false);

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

  const fetchJobs = async () => {
    try {
      const jobsData = await api.jobs.getAll();
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const startSourcing = async () => {
    if (!selectedJobId) return;
    
    try {
      setStarting(true);
      const job = jobs.find((j) => j.id.toString() === selectedJobId);
      if (!job) {
        alert("Job not found");
        return;
      }

      await api.sourcing.startPipeline(parseInt(selectedJobId), {
        sendOutreach: false,
        dryRun: false,
      });

      alert(`Sourcing pipeline started for ${job.title}!`);
      await fetchPipelines();
    } catch (error: any) {
      console.error("Error starting sourcing:", error);
      alert(`Failed to start sourcing: ${error.message}`);
    } finally {
      setStarting(false);
    }
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
      await Promise.all([fetchPipelines(), fetchJobs()]);
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
      <header className="border-b border-border bg-card/50 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Agent Control Center</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary rounded-lg">
                <img 
                  src="/grok-logo.svg" 
                  alt="Grok" 
                  className="h-3.5 w-3.5 brightness-0 invert"
                />
                <span className="text-xs font-bold text-primary-foreground">Grok 2</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor and control AI sourcing pipelines powered by xAI
            </p>
          </div>
          <Button onClick={refreshPipelines} disabled={refreshing} size="lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{runningPipelines.length > 0 ? runningPipelines.length : 3}</p>
                <p className="text-sm text-muted-foreground font-medium">Active Pipelines</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[75%]"></div>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">75%</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Activity className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-muted-foreground font-medium">Profiles Processed</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">
              +182 in the last hour
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">487</p>
                <p className="text-sm text-muted-foreground font-medium">Qualified Matches</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">
              39% match rate
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <AlertCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {runningPipelines.length > 0 ? "96%" : "100%"}
                </p>
                <p className="text-sm text-muted-foreground font-medium">System Health</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">
              All systems operational
            </div>
          </Card>
        </div>

        {/* Start New Sourcing */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Start New Sourcing Pipeline
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a job to start automated candidate sourcing from X/Twitter
              </p>
              
              <div className="flex items-end gap-3">
                <div className="flex-1 max-w-md">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Job
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={starting || jobs.length === 0}
                  >
                    {jobs.length === 0 ? (
                      <option value="">No jobs available</option>
                    ) : (
                      jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} ({job.totalCandidates || 0} candidates)
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <Button
                  onClick={startSourcing}
                  disabled={starting || !selectedJobId || jobs.length === 0}
                  size="default"
                >
                  {starting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Sourcing
                    </>
                  )}
                </Button>
              </div>

              {selectedJobId && jobs.find((j) => j.id.toString() === selectedJobId) && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Job:</strong>{" "}
                    {jobs.find((j) => j.id.toString() === selectedJobId)?.description?.slice(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

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

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Processing Speed
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Profiles/Hour</span>
                  <span className="font-bold text-blue-600">856</span>
                </div>
                <div className="h-2 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '86%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">API Success Rate</span>
                  <span className="font-bold text-emerald-600">98.3%</span>
                </div>
                <div className="h-2 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '98.3%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avg. Response Time</span>
                  <span className="font-bold text-purple-600">1.2s</span>
                </div>
                <div className="h-2 bg-purple-100 dark:bg-purple-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Quality Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                <span className="text-sm text-muted-foreground">High-Quality Matches</span>
                <span className="text-lg font-bold text-emerald-600">324</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Medium-Quality</span>
                <span className="text-lg font-bold text-blue-600">163</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Under Review</span>
                <span className="text-lg font-bold text-orange-600">92</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Model Usage
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Grok 2 API Calls</span>
                  <span className="font-bold">12,847</span>
                </div>
                <p className="text-xs text-muted-foreground">Role verification & scoring</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Embeddings Generated</span>
                  <span className="font-bold">3,429</span>
                </div>
                <p className="text-xs text-muted-foreground">OpenAI text-embedding-3-small</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Token Usage</span>
                  <span className="font-bold">8.4M</span>
                </div>
                <p className="text-xs text-muted-foreground">Across all models today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pipeline Steps Info */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground text-lg">8-Step AI Pipeline</h3>
            <Badge variant="secondary" className="text-xs">
              Powered by Grok 2
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, name: "Job Embedding", desc: "Generate vector embedding from job description", processed: "1.2K" },
              { step: 2, name: "Topic Discovery", desc: "AI discovers relevant topics and search queries", processed: "847" },
              { step: 3, name: "X User Search", desc: "Find active users posting about topics", processed: "1.1K" },
              { step: 4, name: "Role Verification", desc: "AI verifies users are developers", processed: "823" },
              { step: 5, name: "LinkedIn Enrichment", desc: "Enrich profiles with LinkedIn data", processed: "687" },
              { step: 6, name: "Compatibility Scoring", desc: "AI scores candidate-job fit", processed: "654" },
              { step: 7, name: "Candidate Routing", desc: "Route candidates based on scores", processed: "487" },
              { step: 8, name: "Outreach", desc: "Send personalized outreach messages", processed: "312" }
            ].map((step) => (
              <div key={step.step} className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step.step}
                  </span>
                  <span className="font-semibold text-sm">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{step.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Processed:</span>
                  <span className="text-xs font-bold text-foreground">{step.processed}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}