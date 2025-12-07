import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { JobCard } from "@/components/dashboard/JobCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { api } from "@/lib/api";
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
import { useEffect, useState } from "react";
import { Job, ActivityEvent } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    screenedToday: 0,
    conversionRate: "0%",
  });
  const [agentStats, setAgentStats] = useState({
    activeAgents: 3,
    pipelinesRunToday: 12,
    tweetsSentToday: 247,
    dmResponsesReceived: 89,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs
        const jobsData = await api.jobs.getAll();
        setJobs(jobsData);
        
        // Fetch recent activities
        const activitiesData = await api.activity.getFeed({ limit: 10 });
        setActivities(activitiesData);
        
        // Fetch activity stats
        const activityStatsData = await api.activity.getStats(1); // Last 24 hours
        
        // Calculate stats with enhanced demo numbers
        const activeJobsCount = jobsData.filter(j => j.status === "active").length || 8;
        const totalCandidatesCount = jobsData.reduce((sum, job) => sum + job.candidateCount, 0) || 1247;
        const screenedTodayCount = jobsData.reduce((sum, job) => sum + job.screenedCount, 0) || 182;
        
        setStats({
          activeJobs: activeJobsCount,
          totalCandidates: totalCandidatesCount,
          screenedToday: screenedTodayCount,
          conversionRate: totalCandidatesCount > 0 ? `${Math.round((screenedTodayCount / totalCandidatesCount) * 100)}%` : "15%",
        });
        
        // Calculate agent stats from activity data with enhanced numbers
        const pipelinesCount = activityStatsData.activity_by_type?.sourcing || 12;
        const tweetsCount = activityStatsData.activity_by_type?.outreach || 247;
        const dmCount = activitiesData.filter(a => a.type === "dm_received").length || 89;
        
        setAgentStats({
          activeAgents: 3,
          pipelinesRunToday: pipelinesCount,
          tweetsSentToday: tweetsCount,
          dmResponsesReceived: dmCount,
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary rounded-lg">
                <img 
                  src="/grok-logo.svg" 
                  alt="Grok" 
                  className="h-3.5 w-3.5 brightness-0 invert"
                />
                <span className="text-xs font-bold text-primary-foreground">Powered by Grok</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered recruiting platform with autonomous agents
            </p>
          </div>
          <Button onClick={() => navigate('/jobs')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Start Sourcing
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* AI Agent Banner */}
        <Card className="p-6 mb-8 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">3 AI Agents Active</h3>
                  <Badge variant="secondary" className="text-xs">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Processing
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Agent-A1</span> sourcing Sr. ML Engineer • 
                  <span className="font-semibold text-foreground"> Agent-A2</span> screening React developers • 
                  <span className="font-semibold text-foreground"> Agent-A3</span> matching DevOps candidates
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">487</span> candidates sourced today
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">182</span> processed in last hour
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/agent-control')} size="lg">
              View Control Center
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Active Jobs" 
            value={stats.activeJobs}
            change="+5 this week"
            changeType="positive"
            icon={Briefcase}
          />
          <StatsCard 
            title="Total Candidates" 
            value={stats.totalCandidates}
            change="+324 this week"
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
            change="+12% vs last month"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>
        
        {/* Outreach Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Twitter className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{agentStats.tweetsSentToday}</p>
                <p className="text-xs text-muted-foreground font-medium">Tweets Sent Today</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Public mentions to qualified candidates</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[78%]"></div>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">36% reply rate</span>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <MessageSquare className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{agentStats.dmResponsesReceived}</p>
                <p className="text-xs text-muted-foreground font-medium">DM Responses</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Candidates expressing interest</p>
            <div className="mt-3 text-xs text-muted-foreground font-semibold">
              +23 in the last 2 hours
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{agentStats.pipelinesRunToday}</p>
                <p className="text-xs text-muted-foreground font-medium">Pipelines Today</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Automated sourcing runs</p>
            <div className="mt-3 text-xs text-muted-foreground font-semibold">
              {agentStats.activeAgents} agents currently active
            </div>
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
              ) : jobs.length > 0 ? (
                jobs.slice(0, 3).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No jobs found</div>
              )}
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
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
              ) : (
                <ActivityFeed events={activities.slice(0, 6)} compact />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
