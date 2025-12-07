import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Users,
  MapPin,
  Briefcase,
  Code,
  TrendingUp,
  CheckCircle,
  Loader2,
  Target,
  FolderKanban,
} from "lucide-react";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await api.teams.getAll();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teams</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {teams.length} active teams across the organization
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {teams.filter(t => t.is_active).length} Active
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
                <p className="text-2xl font-bold">
                  {teams.reduce((sum, t) => sum + t.team_size, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Code className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tech Stacks</p>
                <p className="text-2xl font-bold">
                  {new Set(teams.flatMap(t => t.tech_stack || [])).size}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold">
                  {teams.reduce((sum, t) => sum + (t.current_needs?.length || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{team.name}</h3>
                    {team.is_active && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {team.description}
                  </p>
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-border my-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Team Size</span>
                  </div>
                  <p className="text-lg font-semibold">{team.team_size}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Code className="h-4 w-4" />
                    <span className="text-xs">Tech Stack</span>
                  </div>
                  <p className="text-lg font-semibold">{team.tech_stack?.length || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs">Hiring</span>
                  </div>
                  <p className="text-lg font-semibold">{team.current_needs?.length || 0}</p>
                </div>
              </div>

              {/* Manager & Location */}
              <div className="space-y-2 mb-4">
                {team.manager_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Manager:</span>
                    <span className="font-medium">{team.manager_name}</span>
                  </div>
                )}
                {team.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{team.location}</span>
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              {team.tech_stack && team.tech_stack.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.tech_stack.slice(0, 8).map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {team.tech_stack.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{team.tech_stack.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Current Needs */}
              {team.current_needs && team.current_needs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                    Hiring For
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.current_needs.map((need: string) => (
                      <Badge key={need} className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {team.projects && team.projects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                    <FolderKanban className="h-3 w-3 inline mr-1" />
                    Current Projects
                  </p>
                  <ul className="space-y-1">
                    {team.projects.slice(0, 3).map((project: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Team Culture */}
              {team.team_culture && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Team Culture
                  </p>
                  <p className="text-sm text-foreground/90 line-clamp-3">
                    {team.team_culture}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
            <p className="text-sm text-muted-foreground">
              There are currently no teams in the system.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

