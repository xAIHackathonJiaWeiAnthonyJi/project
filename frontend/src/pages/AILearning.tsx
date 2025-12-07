import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import {
  Brain,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Zap,
  BarChart3,
  Loader2,
  Award,
  Clock,
  ThumbsUp,
} from "lucide-react";

// Mock data for demo purposes
const MOCK_STATS = {
  total_outcomes: 247,
  hired_count: 89,
  rejected_count: 134,
  withdrew_count: 24,
  ai_accuracy: 84.2,
  avg_performance_rating: 4.3,
  avg_retention_months: 14.7,
};

const MOCK_OUTCOMES = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  candidate: { name: `Candidate ${String.fromCharCode(65 + i)}` },
  job: { title: ['Senior ML Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Product Designer', 'Data Scientist'][i % 5] },
  predicted_compatibility_score: Math.floor(60 + Math.random() * 35),
  predicted_stage_recommendation: ['reject', 'takehome', 'interview', 'fasttrack'][Math.floor(Math.random() * 4)],
  outcome: ['hired', 'rejected', 'withdrew'][Math.floor(Math.random() * 3)],
  performance_rating: Math.random() > 0.3 ? (3.5 + Math.random() * 1.5).toFixed(1) : null,
  ai_was_correct: Math.random() > 0.2,
}));

const MOCK_LEARNING_PARAMS = [
  {
    id: 1,
    agent_name: 'sourcing_agent',
    version: 17,
    accuracy: 84.2,
    correct_predictions: 208,
    total_predictions: 247,
    threshold_reject: 40,
    threshold_takehome: 60,
    threshold_interview: 75,
    threshold_fasttrack: 88,
    weights: {
      technical_skills: 0.35,
      experience: 0.25,
      education: 0.15,
      cultural_fit: 0.15,
      communication: 0.10,
    },
  },
];

export default function AILearning() {
  const [outcomes, setOutcomes] = useState<any[]>(MOCK_OUTCOMES);
  const [stats, setStats] = useState<any>(MOCK_STATS);
  const [learningParams, setLearningParams] = useState<any[]>(MOCK_LEARNING_PARAMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outcomesData, statsData, paramsData] = await Promise.all([
        fetch(`http://localhost:8000/api/learning/outcomes`).then(r => r.json()).catch(() => MOCK_OUTCOMES),
        fetch(`http://localhost:8000/api/learning/outcomes/stats`).then(r => r.json()).catch(() => MOCK_STATS),
        fetch(`http://localhost:8000/api/learning/params`).then(r => r.json()).catch(() => MOCK_LEARNING_PARAMS),
      ]);
      
      // Use real data if available, otherwise keep mock data
      if (outcomesData && outcomesData.length > 0) setOutcomes(outcomesData);
      if (statsData && statsData.total_outcomes) setStats(statsData);
      if (paramsData && paramsData.length > 0) setLearningParams(paramsData);
    } catch (error) {
      console.error("Error fetching AI learning data:", error);
      // Keep mock data on error
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
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                AI Learning & Performance
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track AI accuracy, outcomes, and adaptive learning
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {stats?.total_outcomes || 0} Outcomes Tracked
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="parameters">Learning Parameters</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-success/10">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">AI Accuracy</p>
                <p className="text-3xl font-bold">{stats?.ai_accuracy?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.total_outcomes || 0} predictions made
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Hired</p>
                <p className="text-3xl font-bold">{stats?.hired_count || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.total_outcomes ? ((stats.hired_count / stats.total_outcomes) * 100).toFixed(0) : 0}% hire rate
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <Award className="h-5 w-5 text-warning" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Performance</p>
                <p className="text-3xl font-bold">
                  {stats?.avg_performance_rating?.toFixed(1) || 0}
                  <span className="text-lg text-muted-foreground">/5</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Manager ratings
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Retention</p>
                <p className="text-3xl font-bold">
                  {Math.round(stats?.avg_retention_months || 0)}
                  <span className="text-lg text-muted-foreground">mo</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Employee tenure
                </p>
              </Card>
            </div>

            {/* Outcome Distribution & Learning Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Outcome Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-success" />
                        Hired
                      </span>
                      <span className="text-sm font-medium">{stats?.hired_count || 0} ({stats?.total_outcomes ? ((stats.hired_count / stats.total_outcomes) * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{
                          width: `${stats?.total_outcomes ? (stats.hired_count / stats.total_outcomes * 100) : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Rejected
                      </span>
                      <span className="text-sm font-medium">{stats?.rejected_count || 0} ({stats?.total_outcomes ? ((stats.rejected_count / stats.total_outcomes) * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-destructive h-2 rounded-full"
                        style={{
                          width: `${stats?.total_outcomes ? (stats.rejected_count / stats.total_outcomes * 100) : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-warning" />
                        Withdrew
                      </span>
                      <span className="text-sm font-medium">{stats?.withdrew_count || 0} ({stats?.total_outcomes ? ((stats.withdrew_count / stats.total_outcomes) * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full"
                        style={{
                          width: `${stats?.total_outcomes ? (stats.withdrew_count / stats.total_outcomes * 100) : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Model Version</span>
                      <Badge variant="secondary">v{learningParams[0]?.version || 17}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Predictions</span>
                      <span className="text-2xl font-bold">{learningParams[0]?.total_predictions || 247}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Correct Predictions</span>
                      <span className="text-2xl font-bold text-success">{learningParams[0]?.correct_predictions || 208}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4 text-primary" />
                      AI model continuously learns from feedback
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Candidate Outcomes</h3>
              <div className="space-y-3">
                {outcomes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No outcomes tracked yet</p>
                  </div>
                ) : (
                  outcomes.slice(0, 10).map((outcome: any) => (
                    <div
                      key={outcome.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{outcome.candidate?.name || 'Unknown'}</p>
                          <Badge variant="outline" className="text-xs">
                            {outcome.job?.title || 'Unknown Job'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Predicted: {outcome.predicted_compatibility_score}%</span>
                          <span>Stage: {outcome.predicted_stage_recommendation}</span>
                          {outcome.performance_rating && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {outcome.performance_rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {outcome.ai_was_correct === true && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            AI Correct
                          </Badge>
                        )}
                        {outcome.ai_was_correct === false && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            AI Incorrect
                          </Badge>
                        )}
                        <Badge
                          className={
                            outcome.outcome === 'hired'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20'
                              : outcome.outcome === 'withdrew'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20'
                          }
                        >
                          {outcome.outcome.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Learning Parameters Tab */}
          <TabsContent value="parameters" className="space-y-4">
            {learningParams.length === 0 ? (
              <Card className="p-12 text-center">
                <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Learning Parameters Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Learning parameters will appear here once agents start making predictions
                </p>
              </Card>
            ) : (
              learningParams.map((params: any) => (
                <Card key={params.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {params.agent_name.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">Version {params.version}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>

                  {/* Accuracy */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Accuracy</span>
                      <span className="text-2xl font-bold">{params.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${params.accuracy}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {params.correct_predictions} / {params.total_predictions} predictions
                    </p>
                  </div>

                  {/* Thresholds */}
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-3">Score Thresholds</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                        <p className="text-xs text-muted-foreground mb-1">Reject</p>
                        <p className="text-lg font-semibold">&lt; {params.threshold_reject}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                        <p className="text-xs text-muted-foreground mb-1">Take-home</p>
                        <p className="text-lg font-semibold">&ge; {params.threshold_takehome}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <p className="text-xs text-muted-foreground mb-1">Interview</p>
                        <p className="text-lg font-semibold">&ge; {params.threshold_interview}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <p className="text-xs text-muted-foreground mb-1">Fast-track</p>
                        <p className="text-lg font-semibold">&ge; {params.threshold_fasttrack}</p>
                      </div>
                    </div>
                  </div>

                  {/* Feature Weights */}
                  <div>
                    <p className="text-sm font-medium mb-3">Feature Weights</p>
                    <div className="space-y-2">
                      {Object.entries(params.weights || {}).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium">{(Number(value) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${Number(value) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

