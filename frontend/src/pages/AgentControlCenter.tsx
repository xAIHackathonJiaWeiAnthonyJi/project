import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Play, 
  Settings as SettingsIcon, 
  Clock, 
  CheckCircle2,
  Users,
  Search,
  Phone,
  FileText,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "idle" | "running" | "completed";
  category: "sourcing" | "screening" | "interview" | "coordination";
  capabilities: string[];
  avgTime: string;
  successRate?: string;
}

interface RunningPipeline {
  id: string;
  agentName: string;
  jobTitle: string;
  status: "running" | "completed";
  progress: number;
  currentStep: string;
  candidatesFound?: number;
  startedAt: Date;
}

export default function AgentControlCenter() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Available agents
  const agents: Agent[] = [
    {
      id: "sourcing_x",
      name: "X-First Sourcing Agent",
      description: "Discovers candidates on X (Twitter) by analyzing their technical posts and engagement",
      icon: Search,
      status: "idle",
      category: "sourcing",
      capabilities: ["X/Twitter search", "Topic discovery", "Developer verification", "LinkedIn enrichment"],
      avgTime: "~2 minutes",
      successRate: "73%"
    },
    {
      id: "sourcing_github",
      name: "GitHub Sourcing Agent",
      description: "Finds candidates through GitHub activity, contributions, and repository analysis",
      icon: FileText,
      status: "idle",
      category: "sourcing",
      capabilities: ["Repository analysis", "Contribution tracking", "Language proficiency"],
      avgTime: "~4 minutes",
      successRate: "68%"
    },
    {
      id: "team_matcher",
      name: "Team Match Agent",
      description: "Analyzes candidate fit with existing team dynamics, tech stack, and culture",
      icon: Users,
      status: "idle",
      category: "screening",
      capabilities: ["Team culture fit", "Tech stack alignment", "Collaboration style"],
      avgTime: "~30 seconds",
      successRate: "81%"
    },
    {
      id: "phone_screener",
      name: "Phone Interview Agent",
      description: "Conducts automated voice screening calls with intelligent follow-up questions",
      icon: Phone,
      status: "idle",
      category: "interview",
      capabilities: ["Voice interaction", "Technical Q&A", "Soft skills assessment"],
      avgTime: "~15 minutes",
      successRate: "76%"
    },
    {
      id: "resume_screener",
      name: "Resume Screening Agent",
      description: "Parses and evaluates resumes against job requirements with detailed scoring",
      icon: FileText,
      status: "idle",
      category: "screening",
      capabilities: ["Resume parsing", "Skill extraction", "Experience validation"],
      avgTime: "~10 seconds",
      successRate: "89%"
    },
    {
      id: "outreach_coordinator",
      name: "Outreach Coordinator Agent",
      description: "Sends personalized messages to candidates and tracks responses",
      icon: MessageSquare,
      status: "idle",
      category: "coordination",
      capabilities: ["Message personalization", "Multi-channel outreach", "Response tracking"],
      avgTime: "~1 minute",
      successRate: "42% response rate"
    },
  ];

  // Running pipelines (mock data)
  const runningPipelines: RunningPipeline[] = [
    {
      id: "run_001",
      agentName: "X-First Sourcing Agent",
      jobTitle: "Senior ML Engineer",
      status: "running",
      progress: 85,
      currentStep: "Step 6/7: Computing compatibility scores",
      candidatesFound: 19,
      startedAt: new Date(Date.now() - 120000) // 2 minutes ago
    }
  ];

  // Completed today
  const completedToday = [
    {
      id: "comp_001",
      agentName: "X-First Sourcing Agent",
      jobTitle: "Senior ML Engineer",
      candidatesFound: 7,
      routed: { interview: 1, takehome: 6, reject: 0 },
      completedAt: new Date(Date.now() - 1800000) // 30 min ago
    },
    {
      id: "comp_002",
      agentName: "Resume Screening Agent",
      jobTitle: "Frontend Engineer",
      candidatesScreened: 12,
      routed: { interview: 3, takehome: 5, reject: 4 },
      completedAt: new Date(Date.now() - 5400000) // 90 min ago
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sourcing": return "bg-primary/10 text-primary border-primary/20";
      case "screening": return "bg-success/10 text-success border-success/20";
      case "interview": return "bg-warning/10 text-warning border-warning/20";
      case "coordination": return "bg-info/10 text-info border-info/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sourcing": return Search;
      case "screening": return Sparkles;
      case "interview": return Phone;
      case "coordination": return MessageSquare;
      default: return Bot;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-30 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Control Center</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Start, monitor, and manage your AI recruiting agents
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Active Pipelines */}
        {runningPipelines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Running Now
            </h2>
            <div className="space-y-4">
              {runningPipelines.map((pipeline) => (
                <Card key={pipeline.id} className="p-6 bg-gradient-to-r from-warning/10 to-transparent border-warning/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
                          <Bot className="h-6 w-6 text-warning" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{pipeline.agentName}</h3>
                        <p className="text-sm text-muted-foreground">{pipeline.jobTitle}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.floor((Date.now() - pipeline.startedAt.getTime()) / 60000)} min ago
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{pipeline.currentStep}</span>
                      <span className="text-foreground font-medium">{pipeline.progress}%</span>
                    </div>
                    <Progress value={pipeline.progress} className="h-2" />
                    {pipeline.candidatesFound && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {pipeline.candidatesFound} candidates discovered so far
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Agents */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Available Agents</h2>
            <p className="text-sm text-muted-foreground">Click any agent to start a new run</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const CategoryIcon = getCategoryIcon(agent.category);
              
              return (
                <Dialog key={agent.id}>
                  <DialogTrigger asChild>
                    <Card 
                      className="p-5 cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground mb-1">
                              {agent.name}
                            </h3>
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(agent.category)}`}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {agent.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {agent.avgTime}
                        </span>
                        {agent.successRate && (
                          <span className="text-success font-medium">{agent.successRate}</span>
                        )}
                      </div>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {agent.name}
                      </DialogTitle>
                      <DialogDescription>{agent.description}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.capabilities.map((cap, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="job-title">Job Title *</Label>
                          <Input id="job-title" placeholder="e.g., Senior ML Engineer" />
                        </div>
                        
                        <div>
                          <Label htmlFor="job-description">Job Description *</Label>
                          <Textarea 
                            id="job-description" 
                            placeholder="Paste the full job description here..."
                            rows={4}
                          />
                        </div>
                        
                        {agent.category === "sourcing" && (
                          <div>
                            <Label htmlFor="job-link">Job Link (optional)</Label>
                            <Input 
                              id="job-link" 
                              placeholder="https://jobs.company.com/role"
                              type="url"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Estimated time: {agent.avgTime}
                      </p>
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Start Agent
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>

        {/* Completed Today */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Completed Today
          </h2>
          
          <div className="space-y-3">
            {completedToday.map((run) => (
              <Card key={run.id} className="p-5 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{run.agentName}</h3>
                      <p className="text-xs text-muted-foreground">{run.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {run.candidatesFound && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{run.candidatesFound} candidates</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-success">{run.routed.interview} interview</span>
                          <span className="text-warning">{run.routed.takehome} takehome</span>
                          {run.routed.reject > 0 && <span className="text-destructive">{run.routed.reject} reject</span>}
                        </div>
                      </div>
                    )}
                    
                    {run.candidatesScreened && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{run.candidatesScreened} screened</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-success">{run.routed.interview} interview</span>
                          <span className="text-warning">{run.routed.takehome} takehome</span>
                        </div>
                      </div>
                    )}
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

