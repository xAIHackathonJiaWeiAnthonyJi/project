import React, { useState } from 'react';
import { Job, Candidate, GrokActivity } from '../App';
import { Navigation } from './Navigation';
import { ActiveJobs } from './ActiveJobs';
import { CandidateDatabase } from './CandidateDatabase';
import { CandidatePipeline } from './CandidatePipeline';
import { GrokActivityDashboard } from './GrokActivityDashboard';
import { CandidateDetails } from './CandidateDetails';

interface DashboardProps {
  jobs: Job[];
  candidates: Candidate[];
  grokActivities: GrokActivity[];
  onCreateJob: () => void;
}

export type DashboardView = 'overview' | 'jobs' | 'candidates' | 'pipeline' | 'grok-activity';

export const Dashboard: React.FC<DashboardProps> = ({
  jobs,
  candidates,
  grokActivities,
  onCreateJob
}) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const renderContent = () => {
    if (selectedCandidate) {
      return (
        <CandidateDetails
          candidate={selectedCandidate}
          job={jobs.find(j => j.id === selectedCandidate.jobId)}
          onBack={() => setSelectedCandidate(null)}
        />
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-100 p-6 rounded-lg border border-white">
                <h3 className="text-lg font-semibold text-white">Active Jobs</h3>
                <p className="text-3xl font-bold text-white mt-2">{jobs.filter(j => j.status === 'active').length}</p>
                <p className="text-xs text-white mt-1">Currently open</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg border border-white">
                <h3 className="text-lg font-semibold text-white">Total Candidates</h3>
                <p className="text-3xl font-bold text-white mt-2">{candidates.length}</p>
                <p className="text-xs text-white mt-1">In database</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg border border-white">
                <h3 className="text-lg font-semibold text-white">In Pipeline</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {candidates.filter(c => !['sourced', 'rejected', 'hired'].includes(c.status)).length}
                </p>
                <p className="text-xs text-white mt-1">Being processed</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg border border-white">
                <h3 className="text-lg font-semibold text-white">Grok Activities</h3>
                <p className="text-3xl font-bold text-white mt-2">{grokActivities.length}</p>
                <p className="text-xs text-white mt-1">AI processes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveJobs jobs={jobs} onCreateJob={onCreateJob} />
              <GrokActivityDashboard activities={grokActivities.slice(0, 5)} />
            </div>
          </div>
        );
      case 'jobs':
        return <ActiveJobs jobs={jobs} onCreateJob={onCreateJob} />;
      case 'candidates':
        return (
          <CandidateDatabase
            candidates={candidates}
            jobs={jobs}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'pipeline':
        return (
          <CandidatePipeline
            candidates={candidates}
            jobs={jobs}
            onSelectCandidate={setSelectedCandidate}
          />
        );
      case 'grok-activity':
        return <GrokActivityDashboard activities={grokActivities} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
