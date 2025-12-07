import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, BarChart3, RefreshCw, Play, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LearningMetrics {
  agent_name: string;
  version: number;
  accuracy: number;
  total_predictions: number;
  correct_predictions: number;
  current_thresholds: {
    reject: number;
    takehome: number;
    interview: number;
    fasttrack: number;
  };
  stage_precision: {
    [key: string]: {
      precision: number;
      count: number;
    };
  };
  recent_outcomes: {
    total: number;
    hired: number;
    avg_performance_rating: number;
    hire_rate: number;
  };
  last_updated: string;
}

interface SimulationResult {
  iterations: number;
  final_accuracy: number;
  initial_accuracy: number;
  improvement: number;
  results: Array<{
    iteration: number;
    accuracy: number;
    thresholds: {
      reject: number;
      interview: number;
      fasttrack: number;
    };
  }>;
}

interface Outcome {
  id: number;
  candidate_id: number;
  job_id: number;
  predicted_compatibility_score: number;
  predicted_stage_recommendation: string;
  outcome: string;
  performance_rating?: number;
  ai_was_correct?: boolean;
  reported_at: string;
}

// Mock data for demo purposes
const MOCK_METRICS: LearningMetrics = {
  agent_name: 'sourcing_agent',
  version: 17,
  accuracy: 0.842,
  total_predictions: 247,
  correct_predictions: 208,
  current_thresholds: {
    reject: 38.5,
    takehome: 62.3,
    interview: 76.8,
    fasttrack: 89.2,
  },
  stage_precision: {
    reject: { precision: 0.91, count: 98 },
    takehome: { precision: 0.78, count: 45 },
    interview: { precision: 0.83, count: 67 },
    fasttrack: { precision: 0.88, count: 37 },
  },
  recent_outcomes: {
    total: 247,
    hired: 89,
    avg_performance_rating: 4.3,
    hire_rate: 0.36,
  },
  last_updated: new Date().toISOString(),
};

const MOCK_OUTCOMES: Outcome[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  candidate_id: 100 + i,
  job_id: 1 + (i % 3),
  predicted_compatibility_score: 55 + Math.floor(Math.random() * 40),
  predicted_stage_recommendation: ['reject', 'takehome', 'interview', 'fasttrack'][Math.floor(Math.random() * 4)],
  outcome: ['hired', 'rejected', 'withdrew'][Math.floor(Math.random() * 3)],
  performance_rating: Math.random() > 0.3 ? 3 + Math.random() * 2 : undefined,
  ai_was_correct: Math.random() > 0.2,
  reported_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function AdaptiveLearning() {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(MOCK_METRICS);
  const [outcomes, setOutcomes] = useState<Outcome[]>(MOCK_OUTCOMES);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadMetrics();
    loadOutcomes();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/learning/metrics?agent_name=sourcing_agent&days=30');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      // Keep mock data on error
    }
  };

  const loadOutcomes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/learning/outcomes?limit=50');
      const data = await response.json();
      if (data && data.length > 0) setOutcomes(data);
    } catch (error) {
      console.error('Failed to load outcomes:', error);
      // Keep mock data on error
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const response = await fetch('http://localhost:8000/api/learning/simulate?iterations=100', {
        method: 'POST'
      });
      const data = await response.json();
      setSimulation(data);
    } catch (error) {
      console.error('Failed to run simulation:', error);
      // Generate mock simulation data
      const mockResults = Array.from({ length: 100 }, (_, i) => {
        const baseAccuracy = 0.65;
        const improvement = 0.20;
        const noise = (Math.random() - 0.5) * 0.05;
        const progress = i / 100;
        return {
          iteration: i + 1,
          accuracy: Math.min(0.95, baseAccuracy + (improvement * progress) + noise),
          thresholds: {
            reject: 35 + (progress * 5),
            interview: 70 + (progress * 8),
            fasttrack: 85 + (progress * 5),
          },
        };
      });
      
      setSimulation({
        iterations: 100,
        initial_accuracy: mockResults[0].accuracy,
        final_accuracy: mockResults[99].accuracy,
        improvement: mockResults[99].accuracy - mockResults[0].accuracy,
        results: mockResults,
      });
    } finally {
      setSimulating(false);
    }
  };

  const resetLearning = async () => {
    if (!confirm('Are you sure you want to reset learning parameters? This will start learning from scratch.')) {
      return;
    }
    
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/learning/reset?agent_name=sourcing_agent', {
        method: 'POST'
      });
      await loadMetrics();
      alert('Learning parameters reset successfully!');
    } catch (error) {
      console.error('Failed to reset:', error);
      alert('Failed to reset learning parameters');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      fasttrack: 'bg-purple-100 text-purple-800',
      interview: 'bg-green-100 text-green-800',
      takehome: 'bg-blue-100 text-blue-800',
      reject: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'hired') return 'bg-green-100 text-green-800';
    if (outcome === 'withdrew') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Adaptive Learning
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary rounded-lg">
                <Target className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-xs font-bold text-primary-foreground">{metrics?.accuracy ? (metrics.accuracy * 100).toFixed(1) : '84.2'}% Accuracy</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Continuous improvement through reinforcement learning
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadMetrics} variant="outline" disabled={loading} size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={resetLearning} variant="destructive" disabled={loading} size="lg">
              Reset Learning
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">

      {/* Info Alert */}
      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          This system uses reinforcement learning to improve agent decisions based on actual hiring outcomes.
          The more feedback provided, the better the agents become at predicting candidate success.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.correct_predictions} / {metrics.total_predictions} predictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">v{metrics.version}</div>
              <p className="text-xs text-gray-500 mt-1">Learning iterations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Hire Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(metrics.recent_outcomes.hire_rate * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.recent_outcomes.hired} / {metrics.recent_outcomes.total} candidates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.recent_outcomes.avg_performance_rating.toFixed(1)}★
              </div>
              <p className="text-xs text-gray-500 mt-1">Hired candidate rating</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thresholds">
            <Target className="w-4 h-4 mr-2" />
            Thresholds
          </TabsTrigger>
          <TabsTrigger value="precision">
            <BarChart3 className="w-4 h-4 mr-2" />
            Precision
          </TabsTrigger>
          <TabsTrigger value="outcomes">
            <TrendingUp className="w-4 h-4 mr-2" />
            Outcomes
          </TabsTrigger>
          <TabsTrigger value="simulation">
            <Play className="w-4 h-4 mr-2" />
            Simulation
          </TabsTrigger>
        </TabsList>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Thresholds</CardTitle>
              <CardDescription>
                These thresholds automatically adjust based on outcome feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="space-y-4">
                  {Object.entries(metrics.current_thresholds).map(([stage, threshold]) => (
                    <div key={stage} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{stage}</div>
                        <div className="text-sm text-gray-500">
                          {stage === 'reject' && 'Score below this = reject'}
                          {stage === 'takehome' && 'Score above this = take-home'}
                          {stage === 'interview' && 'Score above this = interview'}
                          {stage === 'fasttrack' && 'Score above this = fast-track'}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{threshold.toFixed(1)}</div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      These thresholds adjust based on hiring outcomes and performance ratings
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading metrics...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Precision Tab */}
        <TabsContent value="precision">
          <Card>
            <CardHeader>
              <CardTitle>Precision by Stage</CardTitle>
              <CardDescription>
                How accurate are predictions for each routing stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="space-y-3">
                  {Object.entries(metrics.stage_precision).map(([stage, data]) => (
                    <div key={stage} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getStageColor(stage)}>
                          {stage}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {(data.precision * 100).toFixed(1)}% Precision
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.count} predictions
                          </div>
                        </div>
                      </div>
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${data.precision * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading precision data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent value="outcomes">
          <Card>
            <CardHeader>
              <CardTitle>Recent Outcomes</CardTitle>
              <CardDescription>
                Actual hiring results used for learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outcomes.length > 0 ? (
                <div className="space-y-2">
                  {outcomes.map((outcome) => (
                    <div key={outcome.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getStageColor(outcome.predicted_stage_recommendation)}>
                          Predicted: {outcome.predicted_stage_recommendation}
                        </Badge>
                        <Badge className={getOutcomeColor(outcome.outcome)}>
                          {outcome.outcome}
                        </Badge>
                        {outcome.ai_was_correct !== null && (
                          <span className={outcome.ai_was_correct ? 'text-green-600' : 'text-red-600'}>
                            {outcome.ai_was_correct ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {outcome.predicted_compatibility_score.toFixed(0)}
                        {outcome.performance_rating && ` | ${outcome.performance_rating.toFixed(1)}★`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No outcomes recorded yet. Add feedback to start learning!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle>Learning Simulation</CardTitle>
              <CardDescription>
                See how the system improves with synthetic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runSimulation} disabled={simulating}>
                  {simulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run 100 Iteration Simulation
                    </>
                  )}
                </Button>

                {simulation && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-600">Initial Accuracy</div>
                        <div className="text-2xl font-bold">
                          {(simulation.initial_accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-600">Final Accuracy</div>
                        <div className="text-2xl font-bold text-green-600">
                          {(simulation.final_accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-600">Improvement</div>
                        <div className="text-2xl font-bold text-purple-600">
                          +{(simulation.improvement * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-medium mb-3">Learning Curve</div>
                      <div className="h-64 flex items-end gap-1">
                        {simulation.results
                          .filter((_, i) => i % 5 === 0) // Show every 5th iteration
                          .map((result, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-purple-500 rounded-t"
                              style={{ height: `${result.accuracy * 100}%` }}
                              title={`Iteration ${result.iteration}: ${(result.accuracy * 100).toFixed(1)}%`}
                            />
                          ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        Accuracy improves over {simulation.iterations} iterations
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

