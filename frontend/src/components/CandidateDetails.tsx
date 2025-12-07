import React from 'react';
import { Candidate, Job } from '../App';
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar,
  Star,
  FileText,
  ExternalLink
} from 'lucide-react';

interface CandidateDetailsProps {
  candidate: Candidate;
  job?: Job;
  onBack: () => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({ candidate, job, onBack }) => {
  const getStatusColor = (status: Candidate['status']) => {
    const colors = {
      sourced: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      responded: 'bg-indigo-100 text-indigo-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-orange-100 text-orange-800',
      takehome: 'bg-purple-100 text-purple-800',
      team_match: 'bg-pink-100 text-pink-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-green-200 text-green-900',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: Candidate['source']) => {
    switch (source) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'x':
        return <Twitter className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-xl text-gray-600 mt-1">{candidate.currentRole}</p>
                <p className="text-lg text-gray-500">{candidate.company}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)}`}>
                {candidate.status.replace('_', ' ')}
              </span>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${candidate.email}`} className="text-primary-600 hover:text-primary-700">
                  {candidate.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{candidate.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{candidate.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Last activity: {candidate.lastActivity.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {candidate.github && (
                <a
                  href={`https://${candidate.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {candidate.linkedin && (
                <a
                  href={`https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {candidate.xHandle && (
                <a
                  href={`https://x.com/${candidate.xHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>{candidate.xHandle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Grok Summary */}
            {candidate.grokSummary && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Grok AI Summary</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700">{candidate.grokSummary}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info */}
            {job && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Applied Position</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <p className="text-gray-600">{job.department}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <span key={index} className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Source & Bacon Number */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Source Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getSourceIcon(candidate.source)}
                  <span className="text-gray-700 capitalize">{candidate.source}</span>
                </div>
                {candidate.baconNumber && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">Bacon Number: {candidate.baconNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Schedule Interview
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Send Takehome
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Add Notes
              </button>
              <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
