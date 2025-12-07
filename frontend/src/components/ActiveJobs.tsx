import React from 'react';
import { Job } from '../App';
import { Plus, Users, Calendar } from 'lucide-react';

interface ActiveJobsProps {
  jobs: Job[];
  onCreateJob: () => void;
}

export const ActiveJobs: React.FC<ActiveJobsProps> = ({ jobs, onCreateJob }) => {
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'paused':
        return 'status-paused';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-closed';
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg border border-white">
      <div className="p-6 border-b border-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Active Jobs</h2>
          <button
            onClick={onCreateJob}
            className="flex items-center px-4 py-2 text-white transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </button>
        </div>
      </div>

      <div className="p-6">
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white mb-4">
              <Users className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No jobs created yet</h3>
            <p className="text-white mb-4">Create your first job to start finding candidates</p>
            <button
              onClick={onCreateJob}
              className="px-4 py-2 text-white transition-colors"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="card-bg rounded-lg p-4 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                    <p className="text-white opacity-80">{job.department}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm mb-3">
                  <div className="flex items-center meta-bg px-2 py-1 rounded text-white opacity-80">
                    <Users className="w-4 h-4 mr-1" />
                    {job.headcount} position{job.headcount > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center meta-bg px-2 py-1 rounded text-white opacity-80">
                    <Calendar className="w-4 h-4 mr-1" />
                    {job.createdAt.toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="meta-bg p-3 rounded">
                    <div className="text-2xl font-bold text-white">{job.candidatesFound}</div>
                    <div className="text-sm text-white opacity-70">Candidates Found</div>
                  </div>
                  <div className="meta-bg p-3 rounded">
                    <div className="text-2xl font-bold text-white">{job.candidatesInPipeline}</div>
                    <div className="text-sm text-white opacity-70">In Pipeline</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <span key={index} className="tag-bg px-2 py-1 text-white text-xs rounded">
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="tag-bg px-2 py-1 text-white text-xs rounded">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>

                <p className="text-white opacity-80 text-sm line-clamp-2">{job.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
