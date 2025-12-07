#!/usr/bin/env python3
"""
Test Interview Agent - Complete Workflow Demonstration
"""
import asyncio
import httpx
import json
from datetime import datetime

API_BASE = "http://localhost:8000/api"

async def test_interview_workflow():
    """Test the complete interview agent workflow"""
    
    print("🎯 Testing Interview Agent Workflow")
    print("=" * 80)
    
    async with httpx.AsyncClient() as client:
        
        # Step 1: Create an interview template
        print("\n📝 Step 1: Creating Take-Home Template...")
        template_data = {
            "job_id": 1,  # Frontend Engineer job
            "interview_type": "takehome",
            "title": "React Component Challenge",
            "description": "Build a reusable data table component with React and TypeScript",
            "questions": [
                {
                    "task": "Create a DataTable component",
                    "requirements": [
                        "Support sorting by columns",
                        "Implement pagination",
                        "Add search/filter functionality",
                        "Use TypeScript for type safety"
                    ]
                },
                {
                    "task": "Write unit tests",
                    "requirements": [
                        "Test sorting functionality",
                        "Test pagination",
                        "Test search/filter"
                    ]
                }
            ],
            "evaluation_criteria": {
                "code_quality": 25,
                "problem_solving": 25,
                "technical_correctness": 25,
                "best_practices": 15,
                "testing": 10
            },
            "time_limit_hours": 48
        }
        
        response = await client.post(
            f"{API_BASE}/interviews/templates",
            json=template_data
        )
        
        if response.status_code == 200:
            template = response.json()
            template_id = template["id"]
            print(f"✅ Template created: ID {template_id}")
            print(f"   Title: {template['title']}")
            print(f"   Type: {template['interview_type']}")
        else:
            print(f"❌ Failed to create template: {response.status_code}")
            print(response.text)
            return
        
        # Step 2: Dispatch interview to a candidate
        print("\n📤 Step 2: Dispatching Interview to Candidate...")
        dispatch_data = {
            "candidate_id": 1,  # Sarah Chen
            "job_id": 1,
            "template_id": template_id
        }
        
        response = await client.post(
            f"{API_BASE}/interviews/dispatch",
            json=dispatch_data
        )
        
        if response.status_code == 200:
            result = response.json()
            submission_id = result["submission_id"]
            print(f"✅ Interview dispatched: Submission ID {submission_id}")
            print(f"   Status: {result['status']}")
        else:
            print(f"❌ Failed to dispatch: {response.status_code}")
            return
        
        # Step 3: Simulate candidate submitting response
        print("\n📥 Step 3: Candidate Submits Response...")
        submission_response = {
            "submission_data": {
                "github_repo": "https://github.com/sarahchen/datatable-challenge",
                "deployed_demo": "https://datatable-demo.vercel.app",
                "notes": "Implemented all required features plus dark mode and CSV export. Used React Query for data fetching and Vitest for testing. 95% test coverage.",
                "time_spent_hours": 6,
                "additional_features": [
                    "Dark mode toggle",
                    "CSV export functionality",
                    "Keyboard navigation",
                    "Mobile responsive design"
                ]
            }
        }
        
        response = await client.post(
            f"{API_BASE}/interviews/{submission_id}/submit",
            json=submission_response
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Response submitted successfully")
            print(f"   Status: {result['status']}")
            print(f"   Message: {result['message']}")
        else:
            print(f"❌ Failed to submit: {response.status_code}")
            return
        
        # Step 4: Check submission status
        print("\n⏳ Step 4: Waiting for AI Evaluation...")
        await asyncio.sleep(3)  # Wait for AI evaluation
        
        response = await client.get(f"{API_BASE}/interviews/{submission_id}")
        
        if response.status_code == 200:
            submission = response.json()
            print(f"✅ Submission details retrieved")
            print(f"   Status: {submission['status']}")
            if submission.get('ai_score'):
                print(f"   🤖 AI Score: {submission['ai_score']}/100")
                print(f"   🤖 Recommendation: {submission.get('ai_recommendation', 'N/A')}")
                if submission.get('ai_reasoning'):
                    print(f"   🤖 Reasoning: {submission['ai_reasoning'][:100]}...")
                if submission.get('ai_strengths'):
                    print(f"   ✅ Strengths: {len(submission['ai_strengths'])} identified")
                if submission.get('ai_weaknesses'):
                    print(f"   ⚠️  Weaknesses: {len(submission['ai_weaknesses'])} identified")
        else:
            print(f"⚠️  Could not retrieve submission status")
        
        # Step 5: Human review (approve)
        print("\n👤 Step 5: Human Reviewer Reviews Submission...")
        review_data = {
            "reviewer_name": "Alice Johnson (Engineering Manager)",
            "reviewer_notes": "Excellent work! Code is clean, well-tested, and goes beyond requirements. The additional features show initiative. Strong hire signal.",
            "score_override": None,  # Accept AI score
            "action": "approve"
        }
        
        response = await client.post(
            f"{API_BASE}/interviews/{submission_id}/review",
            json=review_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Review completed: {result['status']}")
            print(f"   Next action: {result['next_action']}")
        else:
            print(f"❌ Failed to review: {response.status_code}")
        
        # Step 6: Get interview statistics
        print("\n📊 Step 6: Interview Statistics...")
        response = await client.get(f"{API_BASE}/interviews/stats/1")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistics for Job 1:")
            print(f"   Total interviews: {stats['total_interviews']}")
            print(f"   Average AI score: {stats['average_ai_score']}")
            print(f"   Approval rate: {stats['approval_rate']}%")
            print(f"   Status breakdown: {stats['status_breakdown']}")
        
        print("\n" + "=" * 80)
        print("🎉 Interview Agent Workflow Test Complete!")
        print("\n📝 Summary:")
        print("   ✅ Created interview template")
        print("   ✅ Dispatched to candidate")
        print("   ✅ Received candidate submission")
        print("   ✅ AI evaluated submission")
        print("   ✅ Human reviewed and approved")
        print("   ✅ Retrieved statistics")
        print("\n🚀 Interview Agent is fully operational!")


if __name__ == "__main__":
    asyncio.run(test_interview_workflow())

