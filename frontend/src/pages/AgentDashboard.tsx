import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgentPipelineCard } from "@/components/activity/AgentPipelineCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Pause, Settings, ChevronRight, Sparkles } from "lucide-react";

export default function AgentDashboard() {
  // Mock active agents
  const activeAgents = [
    {
      id: "a1",
      name: "Agent A1: X-First Sourcing",
      status: "active" as const,
      jobTitle: "Senior ML Engineer",
      jobId: "2",
      steps: [
        { step: 1, name: "Job → Embedding", status: "complete" as const, duration: "0.3s", result: "1536-dim vector generated" },
        { step: 2, name: "Embedding → Topics", status: "complete" as const, duration: "2.1s", result: "5 topics discovered" },
        { step: 3, name: "Topic → X Users", status: "complete" as const, duration: "4.2s", result: "19 users found" },
        { step: 4, name: "Role Verification", status: "complete" as const, duration: "12.5s", result: "7 developers verified" },
        { step: 5, name: "LinkedIn Enrichment", status: "complete" as const, duration: "0.8s", result: "7 profiles enriched" },
        { step: 6, name: "Compatibility Scoring", status: "complete" as const, duration: "8.3s", result: "Avg: 72/100" },
        { step: 7, name: "Threshold Routing", status: "complete" as const, duration: "0.1s", result: "1 interview, 6 take-home" },
      ],
      totalCandidates: 7,
      startedAt: new Date("2024-01-28T15:00:00"),
    },
    {
      id: "a2",
      name: "Agent A2: GitHub Sourcing",
      status: "idle" as const,
      description: "Sources candidates from GitHub repositories and contributions",
      totalRuns: 12,
      avgDuration: "3m 45s",
    },
    {
      id: "a3",
      name: "Agent A3: Resume Screener",
      status: "idle" as const,
      description: "Screens uploaded resumes and extracts structured data",
      totalRuns: 47,
      avgDuration: "12s",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Agent Control Center</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Monitor and control autonomous recruiting agents
                </p>
              </div>
            </div>
          </div>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run New Pipeline
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                <p className="text-3xl font-bold text-foreground">1</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pipelines Today</p>
                <p className="text-3xl font-bold text-foreground">3</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Candidates Sourced</p>
                <p className="text-3xl font-bold text-foreground">47</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <ChevronRight className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Pipeline Time</p>
                <p className="text-3xl font-bold text-foreground">28s</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-info" />
              </div>
            </div>
          </Card>
        </div>

        {/* Active Pipelines */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Active Pipeline
            </h2>
            <Badge variant="secondary" className="text-xs">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Live
            </Badge>
          </div>
          
          <AgentPipelineCard 
            agentName={activeAgents[0].name}
            jobTitle={activeAgents[0].jobTitle}
            steps={activeAgents[0].steps}
            totalCandidates={activeAgents[0].totalCandidates}
          />
        </div>

        {/* Available Agents */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAgents.slice(1).map((agent) => (
              <Card key={agent.id} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">Idle</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Play className="h-3 w-3 mr-1.5" />
                    Run
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {agent.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{agent.totalRuns} runs completed</span>
                  <span>Avg: {agent.avgDuration}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

