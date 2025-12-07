import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Zap, Users } from "lucide-react";
import { CandidateStatus, Candidate } from "@/types";

const statusFilters: { label: string; value: CandidateStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Sourced", value: "sourced" },
  { label: "Reached Out", value: "reached_out" },
  { label: "Phone Screened", value: "phone_screened" },
  { label: "Team Matched", value: "team_matched" },
  { label: "Rejected", value: "rejected" },
];

export default function Candidates() {
  const [activeFilter, setActiveFilter] = useState<CandidateStatus | "all">("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const candidatesData = await api.candidates.getAll();
        // Add default status for display purposes
        const candidatesWithStatus = candidatesData.map(candidate => ({
          ...candidate,
          status: candidate.status || "sourced" as CandidateStatus
        }));
        setCandidates(candidatesWithStatus);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const candidateStatus = candidate.status || "sourced";
    const matchesFilter = activeFilter === "all" || candidateStatus === activeFilter;
    const matchesSearch = !searchTerm || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading..." : `${candidates.length} candidates across all jobs`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Run AI Screening
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Source Candidates
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((filter) => {
            const count = filter.value === "all" 
              ? candidates.length 
              : candidates.filter(c => (c.status || "sourced") === filter.value).length;
            
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {filter.label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Candidates Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading candidates...</div>
          ) : filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No candidates found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || activeFilter !== "all" 
                  ? "Try adjusting your filters or search terms." 
                  : "Try sourcing new candidates."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
