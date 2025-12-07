import React from 'react';
import { GrokActivity } from '../App';
import { 
  Search, 
  MessageCircle, 
  FileText, 
  CheckCircle, 
  Users, 
  Clock, 
  AlertCircle,
  Cpu
} from 'lucide-react';

interface GrokActivityDashboardProps {
  activities: GrokActivity[];
}

export const GrokActivityDashboard: React.FC<GrokActivityDashboardProps> = ({ activities }) => {
  const getActivityIcon = (type: GrokActivity['type']) => {
    switch (type) {
      case 'candidate_search':
        return <Search className="w-5 h-5" />;
      case 'candidate_contact':
        return <MessageCircle className="w-5 h-5" />;
      case 'resume_screen':
        return <FileText className="w-5 h-5" />;
      case 'takehome_eval':
        return <CheckCircle className="w-5 h-5" />;
      case 'team_match':
        return <Users className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: GrokActivity['status']) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-closed';
    }
  };

  const getStatusIcon = (status: GrokActivity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityTypeLabel = (type: GrokActivity['type']) => {
    const labels = {
      candidate_search: 'Candidate Search',
      candidate_contact: 'Candidate Contact',
      resume_screen: 'Resume Screening',
      takehome_eval: 'Takehome Evaluation',
      team_match: 'Team Matching'
    };
    return labels[type] || type;
  };

  const recentActivities = activities.slice(0, 10);
  const inProgressCount = activities.filter(a => a.status === 'in_progress').length;
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const failedCount = activities.filter(a => a.status === 'failed').length;

  return (
    <div className="bg-gray-100 rounded-lg border border-white">
      <div className="p-6 border-b border-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Grok Activity
            </h2>
            <p className="text-white mt-1">AI recruiting processes</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-sm text-white">Active</span>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="p-6 border-b border-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-black p-4 rounded-lg border border-white">
            <div className="text-2xl font-bold text-white">{inProgressCount}</div>
            <div className="text-sm text-white">In Progress</div>
          </div>
          <div className="text-center bg-black p-4 rounded-lg border border-white">
            <div className="text-2xl font-bold text-white">{completedCount}</div>
            <div className="text-sm text-white">Completed</div>
          </div>
          <div className="text-center bg-black p-4 rounded-lg border border-white">
            <div className="text-2xl font-bold text-white">{failedCount}</div>
            <div className="text-sm text-white">Failed</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white mb-4">
              <Cpu className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No activities yet</h3>
            <p className="text-white">Create jobs to start AI recruiting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border border-white rounded-lg bg-black">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white">
                      {getActivityTypeLabel(activity.type)}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                        <span>{activity.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white mb-2">{activity.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-white">
                    <span>{activity.timestamp.toLocaleString()}</span>
                    {activity.status === 'in_progress' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-white">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All Activities ({activities.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
