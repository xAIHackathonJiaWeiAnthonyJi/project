import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { AgentPipelineCard } from "@/components/activity/AgentPipelineCard";
import { OutreachCard } from "@/components/activity/OutreachCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Twitter, MessageSquare, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { ActivityEvent } from "@/types";

export default function Activity() {
  const [activeTab, setActiveTab] = useState("all");
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [outreachActivities, setOutreachActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Fetch all activities
        const allActivities = await api.activity.getFeed({ limit: 100 });
        setActivities(allActivities);
        
        // Fetch outreach-specific activities
        const outreachData = await api.activity.getRecentOutreach(50);
        setOutreachActivities(outreachData);
        
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);
  
  // Filter events by type
  const agentEvents = activities.filter(e => 
    e.type?.includes("agent") || e.type === "sourced" || e.type === "screened"
  );
  
  const outreachEvents = activities.filter(e => 
    e.type === "tweet_sent" || e.type === "dm_received"
  );
  
  // Mock pipeline data
  const mockPipeline = {
    agentName: "Agent A1: X-First Sourcing",
    jobTitle: "Senior ML Engineer",
    steps: [
      { step: 1, name: "Job → Embedding", status: "complete" as const, duration: "0.3s", result: "1536-dim vector generated" },
      { step: 2, name: "Embedding → Topics", status: "complete" as const, duration: "2.1s", result: "5 topics discovered with Grok" },
      { step: 3, name: "Topic → X Users", status: "complete" as const, duration: "4.2s", result: "19 users found" },
      { step: 4, name: "Role Verification", status: "complete" as const, duration: "12.5s", result: "7 developers verified" },
      { step: 5, name: "LinkedIn Enrichment", status: "complete" as const, duration: "0.8s", result: "7 profiles enriched" },
      { step: 6, name: "Compatibility Scoring", status: "complete" as const, duration: "8.3s", result: "Avg score: 72/100" },
      { step: 7, name: "Threshold Routing", status: "complete" as const, duration: "0.1s", result: "1 interview, 6 take-home" },
    ],
    totalCandidates: 7
  };
  
  // Mock outreach conversations
  const outreachConversations = [
    {
      id: "o1",
      type: "tweet_sent" as const,
      username: "Antonio_M_85",
      name: "Antonio Martínez",
      message: "@Antonio_M_85 Hi Antonio! We have a Senior ML Engineer role that aligns perfectly with your skills. Would love to chat - DM us if interested! https://jobs.grokreach.com/ml-2001",
      timestamp: new Date("2024-01-28T15:07:12"),
      tweetId: "1997634366974083126",
      recommendation: "interview"
    },
    {
      id: "d1",
      type: "dm_received" as const,
      username: "Antonio_M_85",
      name: "Antonio Martínez",
      message: "Sounds interesting, tell me more about the team size and tech stack",
      timestamp: new Date("2024-01-28T17:15:22"),
      sentiment: "positive"
    },
    {
      id: "o2",
      type: "tweet_sent" as const,
      username: "grok",
      name: "Grok",
      message: "@grok Hi Grok! We're hiring a Senior ML Engineer. Your profile caught our attention - would you be open to a take-home assignment? DM us! https://jobs.grokreach.com/ml-2001",
      timestamp: new Date("2024-01-28T15:07:15"),
      tweetId: "1997634368064626943",
      recommendation: "takehome"
    },
    {
      id: "o3",
      type: "tweet_sent" as const,
      username: "amitcoder1",
      name: "Amit Hasan",
      message: "@amitcoder1 Hi Amit! We're hiring a Senior ML Engineer. Your profile caught our attention - would you be open to a take-home assignment? DM us! https://jobs.grokreach.com/ml-2001",
      timestamp: new Date("2024-01-28T15:07:18"),
      tweetId: "1997634369054462355",
      recommendation: "takehome"
    },
    {
      id: "d2",
      type: "dm_received" as const,
      username: "amitcoder1",
      name: "Amit Hasan",
      message: "Yes, I'm interested! Would love to learn more about the role and compensation.",
      timestamp: new Date("2024-01-28T16:23:45"),
      sentiment: "positive"
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity & Agents</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time AI agent execution and candidate outreach
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>
      </header>

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              All Activity
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              Agent Pipelines
            </TabsTrigger>
            <TabsTrigger value="outreach" className="gap-2">
              <Twitter className="h-4 w-4" />
              Outreach & DMs
            </TabsTrigger>
          </TabsList>
          
          {/* All Activity Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading activities...</div>
              ) : (
                <ActivityFeed events={activities} />
              )}
            </div>
          </TabsContent>
          
          {/* Agent Pipelines Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid gap-6">
              <AgentPipelineCard 
                agentName={mockPipeline.agentName}
                jobTitle={mockPipeline.jobTitle}
                steps={mockPipeline.steps}
                totalCandidates={mockPipeline.totalCandidates}
              />
              
              {/* Agent Activity Log */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Agent Execution Log
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading agent activities...</div>
                ) : (
                  <ActivityFeed events={agentEvents} />
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Outreach & DMs Tab */}
          <TabsContent value="outreach" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Twitter className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {outreachConversations.filter(e => e.type === "tweet_sent").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Tweets Sent</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <MessageSquare className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {outreachConversations.filter(e => e.type === "dm_received").length}
                    </p>
                    <p className="text-xs text-muted-foreground">DM Responses</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <MessageSquare className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((outreachConversations.filter(e => e.type === "dm_received").length / outreachConversations.filter(e => e.type === "tweet_sent").length) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Response Rate</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Conversation Thread */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Twitter className="h-4 w-4 text-primary" />
                Outreach Conversations
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading outreach activities...</div>
                ) : outreachActivities.length > 0 ? (
                  outreachActivities.map((activity) => (
                    <OutreachCard key={activity.id} event={{
                      id: activity.id,
                      type: activity.type as any,
                      username: activity.metadata?.username || "Unknown",
                      name: activity.metadata?.username || "Unknown User",
                      message: activity.description,
                      timestamp: new Date(activity.timestamp),
                      tweetId: activity.metadata?.tweet_id,
                      recommendation: activity.metadata?.recommendation
                    }} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No outreach activities found</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
