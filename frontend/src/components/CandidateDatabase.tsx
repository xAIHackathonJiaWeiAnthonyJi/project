import React, { useState } from 'react';
import { Candidate, Job } from '../App';
import { Search, Github, Linkedin, Twitter, MapPin, Briefcase, Star } from 'lucide-react';

interface CandidateDatabaseProps {
  candidates: Candidate[];
  jobs: Job[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const CandidateDatabase: React.FC<CandidateDatabaseProps> = ({
  candidates,
  jobs,
  onSelectCandidate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = selectedJob === 'all' || candidate.jobId === selectedJob;
    const matchesSource = selectedSource === 'all' || candidate.source === selectedSource;
    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;

    return matchesSearch && matchesJob && matchesSource && matchesStatus;
  });

  const getStatusColor = (status: Candidate['status']) => {
    const colors = {
      sourced: 'status-closed',
      contacted: 'status-in-progress',
      responded: 'status-in-progress',
      screening: 'status-paused',
      interview: 'status-paused',
      takehome: 'status-paused',
      team_match: 'status-paused',
      offer: 'status-active',
      hired: 'status-completed',
      rejected: 'status-failed'
    };
    return colors[status] || 'status-closed';
  };

  const getSourceIcon = (source: Candidate['source']) => {
    switch (source) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'x':
        return <Twitter className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg border border-white">
      <div className="p-6 border-b border-white">
        <h2 className="text-xl font-semibold text-white mb-4">Candidate Database</h2>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
          
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2"
          >
            <option value="all">All Sources</option>
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X (Twitter)</option>
            <option value="referral">Referral</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="sourced">Sourced</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="takehome">Take Home</option>
            <option value="team_match">Team Match</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white opacity-50 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No candidates found</h3>
            <p className="text-white opacity-70">Try adjusting your search criteria or create a new job to start sourcing candidates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate) => {
              const job = jobs.find(j => j.id === candidate.jobId);
              return (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate)}
                  className="card-bg rounded-lg p-4 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                      <p className="text-white opacity-80">{candidate.currentRole} at {candidate.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-white opacity-60">
                        {getSourceIcon(candidate.source)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm mb-3">
                    <div className="flex items-center meta-bg px-2 py-1 rounded text-white opacity-80">
                      <MapPin className="w-4 h-4 mr-1" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center meta-bg px-2 py-1 rounded text-white opacity-80">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {candidate.experience} years
                    </div>
                    {candidate.baconNumber && (
                      <div className="flex items-center meta-bg px-2 py-1 rounded text-white opacity-80">
                        <Star className="w-4 h-4 mr-1" />
                        Bacon #{candidate.baconNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidate.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="tag-bg px-2 py-1 text-white text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="tag-bg px-2 py-1 text-white text-xs rounded">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {job && (
                    <div className="text-sm text-white opacity-70 mb-2">
                      Applied for: <span className="font-medium text-white">{job.title}</span>
                    </div>
                  )}

                  {candidate.grokSummary && (
                    <p className="text-white opacity-80 text-sm line-clamp-2">{candidate.grokSummary}</p>
                  )}

                  <div className="text-xs text-white opacity-50 mt-2">
                    Last activity: {candidate.lastActivity.toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
