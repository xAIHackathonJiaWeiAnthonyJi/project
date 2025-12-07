import React from 'react';
import { DashboardView } from './Dashboard';
import { 
  Home, 
  Briefcase, 
  Users, 
  ClipboardList,
  Cpu
} from 'lucide-react';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const navigationItems = [
  { id: 'overview' as DashboardView, label: 'Overview', icon: Home },
  { id: 'jobs' as DashboardView, label: 'Active Jobs', icon: Briefcase },
  { id: 'candidates' as DashboardView, label: 'Candidates', icon: Users },
  { id: 'pipeline' as DashboardView, label: 'Pipeline', icon: ClipboardList },
  { id: 'grok-activity' as DashboardView, label: 'Grok Activity', icon: Cpu },
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="w-64 bg-black shadow-lg border-r border-white">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-2xl font-bold text-white">Cursor for Recruiting</h1>
        </div>
      </div>
      <div className="mt-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
                currentView === item.id
                  ? 'bg-gray-100 text-white'
                  : 'text-white hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
