import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobCard } from "@/components/dashboard/JobCard";
import { mockJobs } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

export default function Jobs() {
  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your open positions and candidate pipelines.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
