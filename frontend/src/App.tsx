import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { JobCreationForm } from './components/JobCreationForm';
import './App.css';

export interface Job {
  id: string;
  title: string;
  department: string;
  headcount: number;
  description: string;
  requirements: string[];
  createdAt: Date;
  status: 'active' | 'paused' | 'closed';
  candidatesFound: number;
  candidatesInPipeline: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  linkedin?: string;
  github?: string;
  xHandle?: string;
  resumeUrl?: string;
  skills: string[];
  experience: number;
  currentRole: string;
  company: string;
  location: string;
  status: 'sourced' | 'contacted' | 'responded' | 'screening' | 'interview' | 'takehome' | 'team_match' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  grokSummary?: string;
  baconNumber?: number;
  lastActivity: Date;
  source: 'github' | 'linkedin' | 'x' | 'referral';
}

export interface GrokActivity {
  id: string;
  type: 'candidate_search' | 'candidate_contact' | 'resume_screen' | 'takehome_eval' | 'team_match';
  description: string;
  timestamp: Date;
  status: 'in_progress' | 'completed' | 'failed';
  candidateId?: string;
  jobId?: string;
  details?: any;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-job'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      headcount: 2,
      description: 'We are looking for a senior frontend engineer to join our team...',
      requirements: ['React', 'TypeScript', '5+ years experience'],
      createdAt: new Date('2024-12-01'),
      status: 'active',
      candidatesFound: 15,
      candidatesInPipeline: 8
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      headcount: 1,
      description: 'Seeking an experienced product manager...',
      requirements: ['Product Management', 'Analytics', '3+ years experience'],
      createdAt: new Date('2024-12-05'),
      status: 'active',
      candidatesFound: 12,
      candidatesInPipeline: 5
    }
  ]);

  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      linkedin: 'linkedin.com/in/alicejohnson',
      github: 'github.com/alicejohnson',
      xHandle: '@alicejohnson',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 6,
      currentRole: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      status: 'screening',
      jobId: '1',
      grokSummary: 'Strong React developer with excellent TypeScript skills. Has contributed to several open-source projects.',
      baconNumber: 2,
      lastActivity: new Date('2024-12-07'),
      source: 'github'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      linkedin: 'linkedin.com/in/bobsmith',
      skills: ['Product Strategy', 'Analytics', 'User Research'],
      experience: 4,
      currentRole: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      status: 'interview',
      jobId: '2',
      grokSummary: 'Experienced PM with strong analytical background. Led successful product launches.',
      baconNumber: 1,
      lastActivity: new Date('2024-12-06'),
      source: 'linkedin'
    }
  ]);

  const [grokActivities] = useState<GrokActivity[]>([
    {
      id: '1',
      type: 'candidate_search',
      description: 'Searching GitHub for React developers with 5+ years experience',
      timestamp: new Date('2024-12-07T10:30:00'),
      status: 'in_progress',
      jobId: '1'
    },
    {
      id: '2',
      type: 'candidate_contact',
      description: 'DMing @alicejohnson on X about Senior Frontend Engineer role',
      timestamp: new Date('2024-12-07T09:15:00'),
      status: 'completed',
      candidateId: '1',
      jobId: '1'
    },
    {
      id: '3',
      type: 'resume_screen',
      description: 'Analyzing resume and creating summary for Bob Smith',
      timestamp: new Date('2024-12-07T08:45:00'),
      status: 'completed',
      candidateId: '2',
      jobId: '2'
    }
  ]);

  const handleCreateJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'candidatesFound' | 'candidatesInPipeline'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date(),
      candidatesFound: 0,
      candidatesInPipeline: 0
    };
    setJobs([...jobs, newJob]);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-black">
      {currentView === 'dashboard' ? (
        <Dashboard
          jobs={jobs}
          candidates={candidates}
          grokActivities={grokActivities}
          onCreateJob={() => setCurrentView('create-job')}
        />
      ) : (
        <JobCreationForm
          onSubmit={handleCreateJob}
          onCancel={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}

export default App;