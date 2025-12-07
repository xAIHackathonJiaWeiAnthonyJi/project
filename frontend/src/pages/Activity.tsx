import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { mockActivity } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";

export default function Activity() {
  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Full event log of AI and human actions
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search activity..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-border bg-card p-6">
          <ActivityFeed events={mockActivity} />
        </div>
      </div>
    </DashboardLayout>
  );
}
