import React from 'react';
import { Candidate, Job } from '../App';
import { Users, ArrowRight } from 'lucide-react';

interface CandidatePipelineProps {
  candidates: Candidate[];
  jobs: Job[];
  onSelectCandidate: (candidate: Candidate) => void;
}

const pipelineStages = [
  { id: 'sourced', label: 'Sourced', color: 'bg-gray-100 border-gray-300' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100 border-blue-300' },
  { id: 'responded', label: 'Responded', color: 'bg-indigo-100 border-indigo-300' },
  { id: 'screening', label: 'Screening', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'interview', label: 'Interview', color: 'bg-orange-100 border-orange-300' },
  { id: 'takehome', label: 'Take Home', color: 'bg-purple-100 border-purple-300' },
  { id: 'team_match', label: 'Team Match', color: 'bg-pink-100 border-pink-300' },
  { id: 'offer', label: 'Offer', color: 'bg-green-100 border-green-300' },
];

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  candidates,
  jobs,
  onSelectCandidate
}) => {
  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => candidate.status === stage);
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Candidate Pipeline</h2>
        <p className="text-gray-600 mt-1">Track candidates through the hiring process</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {pipelineStages.map((stage, index) => {
              const stageCandidates = getCandidatesByStage(stage.id);
              
              return (
                <div key={stage.id} className="flex items-start">
                  <div className="flex-shrink-0 w-80">
                    <div className={`rounded-lg border-2 ${stage.color} p-4 h-full min-h-[400px]`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                          {stageCandidates.length}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {stageCandidates.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No candidates</p>
                          </div>
                        ) : (
                          stageCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              onClick={() => onSelectCandidate(candidate)}
                              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">{candidate.name}</h4>
                                {candidate.baconNumber && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                    #{candidate.baconNumber}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-2">
                                {candidate.currentRole} at {candidate.company}
                              </p>
                              
                              <p className="text-xs text-blue-600 mb-2">
                                {getJobTitle(candidate.jobId)}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                {candidate.skills.slice(0, 2).map((skill, skillIndex) => (
                                  <span key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                                    {skill}
                                  </span>
                                ))}
                                {candidate.skills.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{candidate.skills.length - 2}
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                {candidate.lastActivity.toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < pipelineStages.length - 1 && (
                    <div className="flex items-center justify-center h-20 px-2">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Pipeline Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {candidates.filter(c => !['hired', 'rejected'].includes(c.status)).length}
            </div>
            <div className="text-sm text-blue-600">Active Candidates</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter(c => c.status === 'hired').length}
            </div>
            <div className="text-sm text-green-600">Hired</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {candidates.filter(c => ['interview', 'takehome', 'team_match', 'offer'].includes(c.status)).length}
            </div>
            <div className="text-sm text-yellow-600">In Final Stages</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((candidates.filter(c => c.status === 'hired').length / Math.max(candidates.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-purple-600">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
