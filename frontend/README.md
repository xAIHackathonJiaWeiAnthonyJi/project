# Grok Recruit - AI-Powered Recruiting Dashboard

A modern React-based dashboard for managing AI-powered recruiting workflows with Grok integration.

## Features

### 🎯 Job Management

- **Job Creation**: Create detailed job descriptions with requirements and headcount
- **Active Jobs Overview**: Monitor all active positions with candidate metrics
- **Job Status Tracking**: Track job status (active, paused, closed)

### 👥 Candidate Management

- **Candidate Database**: Comprehensive database with search and filtering
- **Multi-source Integration**: GitHub, LinkedIn, X (Twitter), and referral sources
- **Bacon Number Tracking**: Network connection analysis for candidates
- **Skills & Experience Tracking**: Detailed candidate profiles with skills and experience

### 📊 Pipeline Management

- **Visual Pipeline**: Kanban-style candidate pipeline tracking
- **Status Progression**: Track candidates through all hiring stages:
  - Sourced → Contacted → Responded → Screening → Interview → Take Home → Team Match → Offer → Hired
- **Pipeline Analytics**: Conversion rates and stage metrics

### 🤖 Grok AI Integration

- **Automated Candidate Search**: Grok searches GitHub, LinkedIn, and X for candidates
- **Smart Candidate Contact**: Automated DMs on X platform
- **Resume Screening**: AI-powered resume analysis and summaries
- **Take-home Evaluation**: Automated assessment of coding challenges
- **Team Matching**: AI-powered team fit analysis
- **Real-time Activity Monitoring**: Live dashboard of Grok activities

### 📈 Analytics & Observability

- **Real-time Metrics**: Live tracking of recruiting activities
- **Activity Dashboard**: Monitor what Grok is doing in real-time
- **Performance Analytics**: Conversion rates, pipeline metrics, and success tracking
- **Candidate Summaries**: AI-generated candidate insights and recommendations

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Headless UI
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:

   ```bash
   cd project/frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard container
│   ├── Navigation.tsx          # Sidebar navigation
│   ├── JobCreationForm.tsx     # Job creation form
│   ├── ActiveJobs.tsx          # Active jobs overview
│   ├── CandidateDatabase.tsx   # Candidate search & filtering
│   ├── CandidatePipeline.tsx   # Pipeline kanban view
│   ├── CandidateDetails.tsx    # Detailed candidate view
│   └── GrokActivityDashboard.tsx # AI activity monitoring
├── App.tsx                     # Main app component with state
├── index.tsx                   # App entry point
└── index.css                   # Global styles with Tailwind
```

## Key Features Explained

### Grok AI Workflow

1. **Job Creation**: HR creates job with description and requirements
2. **Automatic Sourcing**: Grok searches multiple platforms for candidates
3. **Smart Outreach**: Grok contacts candidates via X DMs when needed
4. **Resume Analysis**: AI screens resumes and creates summaries
5. **Pipeline Routing**: Candidates are automatically routed through stages
6. **Assessment**: Grok evaluates take-home assignments
7. **Team Matching**: AI suggests best team fits

### Dashboard Views

- **Overview**: High-level metrics and recent activity
- **Active Jobs**: Job management and creation
- **Candidates**: Searchable candidate database
- **Pipeline**: Visual candidate progression tracking
- **Grok Activity**: Real-time AI activity monitoring

### Candidate Tracking

- Multi-platform profile aggregation (GitHub, LinkedIn, X)
- Bacon number calculation for network analysis
- Comprehensive skill and experience tracking
- AI-generated candidate summaries and insights
- Real-time status updates and activity tracking

## Future Enhancements

- Backend API integration
- Real-time WebSocket updates
- Advanced analytics and reporting
- Integration with ATS systems
- Mobile responsive design improvements
- Bulk candidate operations
- Advanced filtering and search
- Email integration
- Calendar scheduling integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of a hackathon submission for xAI Grok integration.
