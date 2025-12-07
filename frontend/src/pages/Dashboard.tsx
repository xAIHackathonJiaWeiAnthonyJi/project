import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { JobCard } from "@/components/dashboard/JobCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { mockJobs, mockCandidates, mockActivity } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  TrendingUp,
  Plus,
  Bot,
  Twitter,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const stats = {
    activeJobs: mockJobs.filter(j => j.status === "active").length,
    totalCandidates: mockCandidates.length,
    screenedToday: 23,
    conversionRate: "34%",
  };
  
  // Agent stats
  const agentStats = {
    activeAgents: 1,
    pipelinesRunToday: 3,
    tweetsSentToday: 7,
    dmResponsesReceived: 2,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered recruiting platform overview
            </p>
          </div>
          <Button onClick={() => navigate('/agents')}>
            <Plus className="h-4 w-4 mr-2" />
            Run Agent Pipeline
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* AI Agent Banner */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">AI Agent Active</h3>
                  <Badge variant="secondary" className="text-xs">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Agent A1 processing ML Engineer role • Step 7/7 • 7 candidates sourced
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/agents')}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Active Jobs" 
            value={stats.activeJobs}
            change="+2 this week"
            changeType="positive"
            icon={Briefcase}
          />
          <StatsCard 
            title="Total Candidates" 
            value={stats.totalCandidates}
            change="+47 this week"
            changeType="positive"
            icon={Users}
          />
          <StatsCard 
            title="Screened Today" 
            value={stats.screenedToday}
            change="AI automated"
            changeType="neutral"
            icon={Sparkles}
          />
          <StatsCard 
            title="Conversion Rate" 
            value={stats.conversionRate}
            change="+5% vs last month"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>
        
        {/* Outreach Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Twitter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{agentStats.tweetsSentToday}</p>
                <p className="text-xs text-muted-foreground">Tweets Sent Today</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Public mentions to candidates</p>
          </Card>
          
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <MessageSquare className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{agentStats.dmResponsesReceived}</p>
                <p className="text-xs text-muted-foreground">DM Responses</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Candidates interested in roles</p>
          </Card>
          
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Bot className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{agentStats.pipelinesRunToday}</p>
                <p className="text-xs text-muted-foreground">Pipelines Today</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Automated sourcing runs</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Active Jobs</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/jobs')}
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {mockJobs.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/activity')}
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <ActivityFeed events={mockActivity.slice(0, 6)} compact />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
