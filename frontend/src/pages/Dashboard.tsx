import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { JobCard } from "@/components/dashboard/JobCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { mockJobs, mockCandidates, mockActivity } from "@/data/mockData";
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  TrendingUp,
  Plus
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

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your hiring pipeline
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Job
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">Active Jobs</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => navigate('/jobs')}
              >
                View all
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">Recent Activity</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => navigate('/activity')}
              >
                View all
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <ActivityFeed events={mockActivity.slice(0, 5)} compact />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
