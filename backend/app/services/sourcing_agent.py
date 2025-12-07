"""
Sourcing Agent (A1) - X-First Candidate Discovery Pipeline

This module implements the 7-step sourcing flow defined in SOURCING_AGENT_SPEC.md
"""
from typing import List, Dict, Optional
from app.services.embedding_service import generate_embedding
from app.services.vector_store import store_job_embedding
from app.services.grok_service import parse_job_description
from app.services.grok_topic_service import discover_topics_from_job
from app.services.x_api_service import discover_users_from_topics
from app.services.grok_role_service import verify_developers_batch
from app.services.grok_scoring_service import compute_compatibility_score
from app.services.x_outreach_service import send_outreach_batch  # DM (won't work)
from app.services.x_mention_service import send_mentions_batch  # Public mentions (works!)
import json
import os

# Load mock LinkedIn profiles
with open("data/mock_linkedin_profiles.json", "r") as f:
    MOCK_LINKEDIN_PROFILES = json.load(f)

class SourcingAgent:
    """
    Agent A1: X-First Candidate Outreach & Sourcing
    
    Pipeline:
    1. Job → Embedding
    2. Embedding → Topic Discovery
    3. Topic → X Users
    4. X Users → Role Verification
    5. Role Match → Experience Validation (mocked)
    6. Experience → AI Compatibility Scoring
    7. Score → Ranked Candidate List
    """
    
    def __init__(self):
        self.mock_profiles = MOCK_LINKEDIN_PROFILES
    
    # ========================================
    # STEP 1: JOB DESCRIPTION → EMBEDDING
    # ========================================
    
    async def step1_generate_job_embedding(
        self, 
        job_id: int, 
        job_title: str, 
        job_description: str
    ) -> tuple[List[float], str]:
        """
        Generate vector embedding from job description
        
        Args:
            job_id: Database job ID
            job_title: Job title
            job_description: Full job description text
            
        Returns:
            (embedding_vector, embedding_id)
        """
        # Combine title and description for richer embedding
        full_text = f"{job_title}\n\n{job_description}"
        
        # Generate embedding using OpenAI
        embedding = generate_embedding(full_text)
        
        # Store in ChromaDB
        metadata = {
            "job_id": job_id,
            "title": job_title,
            "description": job_description[:500]  # Store first 500 chars
        }
        embedding_id = store_job_embedding(job_id, embedding, metadata)
        
        return embedding, embedding_id
    
    # ========================================
    # STEP 2: EMBEDDING → TOPIC DISCOVERY
    # ========================================
    
    async def step2_discover_topics(
        self, 
        job_title: str,
        job_description: str
    ) -> Dict[str, List[str]]:
        """
        Use Grok AI to generate relevant topics and search queries
        
        Returns:
            {
                "topics": ["topic1", "topic2", ...],
                "search_queries": ["query1", "query2", ...]
            }
        """
        return await discover_topics_from_job(job_title, job_description)
    
    # ========================================
    # STEP 3: TOPIC → ACTIVE X USERS
    # ========================================
    
    async def step3_discover_x_users(
        self,
        topics: List[str],
        search_queries: List[str]
    ) -> List[Dict]:
        """
        Search X for users posting about topics
        
        Returns:
            List of X user profiles with signals
        """
        return discover_users_from_topics(topics, search_queries, max_per_query=10)
    
    # ========================================
    # STEP 4: X USERS → ROLE VERIFICATION
    # ========================================
    
    async def step4_verify_developer_role(
        self,
        x_users: List[Dict],
        job_title: str
    ) -> List[Dict]:
        """
        AI classification: Is this user a developer matching the role?
        """
        return await verify_developers_batch(x_users, job_title)
    
    # ========================================
    # STEP 5: EXPERIENCE VALIDATION (MOCKED)
    # ========================================
    
    def step5_get_linkedin_profile(self, x_handle: str, name: str = None) -> Optional[Dict]:
        """
        Mock LinkedIn profile retrieval with name-based fuzzy matching
        
        Args:
            x_handle: X (Twitter) handle (with or without @)
            name: Real name from X profile
            
        Returns:
            LinkedIn profile dict or None
        """
        # Normalize handle
        if not x_handle.startswith("@"):
            x_handle = f"@{x_handle}"
        
        # Strategy 1: Try exact X handle match
        for profile in self.mock_profiles:
            if profile["x_handle"] == x_handle:
                return profile
        
        # Strategy 2: Try name-based fuzzy match
        if name:
            name_lower = name.lower()
            for profile in self.mock_profiles:
                profile_name_lower = profile["name"].lower()
                # Check if names are similar (same first or last name)
                name_parts = set(name_lower.split())
                profile_parts = set(profile_name_lower.split())
                
                # If they share at least one name part, consider it a match
                if name_parts & profile_parts:
                    print(f"      📎 Fuzzy matched '{name}' to LinkedIn: {profile['name']}")
                    return profile
        
        return None
    
    def enrich_with_linkedin(self, verified_developers: List[Dict]) -> List[Dict]:
        """
        Enrich verified developers with LinkedIn data (mocked)
        Uses X handle and real name for matching
        
        Args:
            verified_developers: List of developers from Step 4
            
        Returns:
            List of developers with linkedin_data field added
        """
        enriched = []
        
        for dev in verified_developers:
            username = dev['username']
            x_handle = f"@{username}"
            real_name = dev.get('name', '')  # Get real name from X profile
            
            # Try to find LinkedIn profile (with name-based fuzzy matching)
            linkedin_profile = self.step5_get_linkedin_profile(x_handle, real_name)
            
            if linkedin_profile:
                dev['linkedin_data'] = linkedin_profile
                dev['has_linkedin'] = True
                print(f"  ✅ @{username} ({real_name}): Found LinkedIn ({linkedin_profile['headline']})")
            else:
                # Create synthetic LinkedIn based on classification and X data
                role_type = dev.get('classification', {}).get('role_type', 'unknown')
                dev['linkedin_data'] = self._generate_synthetic_linkedin(dev, role_type)
                dev['has_linkedin'] = False
                print(f"  ⚠️ @{username} ({real_name}): No LinkedIn found, using synthetic profile")
            
            enriched.append(dev)
        
        return enriched
    
    def _generate_synthetic_linkedin(self, dev: Dict, role_type: str) -> Dict:
        """Generate a synthetic LinkedIn profile based on X data"""
        role_titles = {
            "ml_engineer": "ML Engineer",
            "backend": "Backend Engineer", 
            "frontend": "Frontend Engineer",
            "infra": "Infrastructure Engineer",
            "systems": "Systems Engineer",
            "fullstack": "Full Stack Engineer"
        }
        
        return {
            "x_handle": f"@{dev['username']}",
            "name": dev.get('name', dev['username']),
            "headline": f"{role_titles.get(role_type, 'Software Engineer')} (X Profile)",
            "location": "Unknown",
            "experience": [
                {
                    "company": "Tech Company",
                    "title": role_titles.get(role_type, "Software Engineer"),
                    "duration": "2020-Present",
                    "description": f"Inferred from X activity"
                }
            ],
            "education": [],
            "skills": dev.get('classification', {}).get('signals', []),
            "years_of_experience": 3  # Conservative estimate
        }
    
    # ========================================
    # STEP 6: AI COMPATIBILITY SCORING
    # ========================================
    
    async def step6_compute_compatibility(
        self,
        job_title: str,
        job_description: str,
        enriched_candidates: List[Dict]
    ) -> List[Dict]:
        """
        AI-powered candidate-job fit scoring for all candidates
        
        Returns:
            List of candidates with compatibility scores added
        """
        scored_candidates = []
        
        for candidate in enriched_candidates:
            print(f"📊 Scoring @{candidate['username']}...")
            
            score_data = await compute_compatibility_score(
                job_title=job_title,
                job_description=job_description,
                candidate=candidate
            )
            
            candidate['compatibility'] = score_data
            scored_candidates.append(candidate)
            
            print(f"  ✅ Score: {score_data['compatibility_score']}/100")
        
        return scored_candidates
    
    # ========================================
    # STEP 7: RANKING & PIPELINE INSERTION
    # ========================================
    
    async def step7_apply_thresholds(
        self,
        candidates: List[Dict],
        job_id: int,
        threshold_reject: int = 40,
        threshold_takehome: int = 60,
        threshold_interview: int = 75
    ) -> Dict:
        """
        Apply score thresholds to route candidates
        
        Thresholds:
        - < 40: Reject
        - 40-59: Take-home assignment
        - 60-74: Interview
        - 75+: Fast-track interview
        
        Returns:
            {
                "reject": [...],
                "takehome": [...],
                "interview": [...],
                "fasttrack": [...]
            }
        """
        if not candidates:
            print(f"   ⚠️ No candidates to process")
            return {"reject": [], "takehome": [], "interview": [], "fasttrack": []}
        
        routed = {
            "reject": [],
            "takehome": [],
            "interview": [],
            "fasttrack": []
        }
        
        for candidate in candidates:
            score = candidate.get("compatibility", {}).get("compatibility_score", 0)
            
            if score >= threshold_interview:
                if score >= 90:
                    routed["fasttrack"].append(candidate)
                    candidate['recommendation'] = 'fasttrack'
                else:
                    routed["interview"].append(candidate)
                    candidate['recommendation'] = 'interview'
            elif score >= threshold_takehome:
                routed["takehome"].append(candidate)
                candidate['recommendation'] = 'takehome'
            elif score >= threshold_reject:
                routed["takehome"].append(candidate)
                candidate['recommendation'] = 'takehome'
            else:
                routed["reject"].append(candidate)
                candidate['recommendation'] = 'reject'
        
        # Print summary
        print(f"   🎯 Routing Results:")
        print(f"      Fast-track: {len(routed['fasttrack'])} candidates (score ≥ 90)")
        print(f"      Interview: {len(routed['interview'])} candidates (score 75-89)")
        print(f"      Take-home: {len(routed['takehome'])} candidates (score 40-74)")
        print(f"      Reject: {len(routed['reject'])} candidates (score < 40)")
        
        # Candidates to reach out to (everything except reject)
        reach_out = routed["fasttrack"] + routed["interview"] + routed["takehome"]
        print(f"   📧 Total candidates to reach out: {len(reach_out)}")
        
        # TODO: Insert into database with recommendation field
        # TODO: Trigger outreach workflow for non-rejected candidates
        
        return routed
    
    # ========================================
    # FULL PIPELINE
    # ========================================
    
    async def run_full_pipeline(
        self,
        job_id: int,
        job_title: str,
        job_description: str,
        job_link: str = None,
        send_outreach: bool = False,
        dry_run: bool = True
    ) -> Dict:
        """
        Execute all 7 steps of the sourcing pipeline
        
        Returns:
            {
                "job_id": int,
                "candidates_sourced": int,
                "top_candidates": [...]
            }
        """
        print(f"🚀 Starting sourcing pipeline for Job {job_id}: {job_title}")
        
        # Step 1: Generate job embedding
        print("📊 Step 1: Generating job embedding...")
        embedding, embedding_id = await self.step1_generate_job_embedding(
            job_id, job_title, job_description
        )
        print(f"✅ Embedding generated: {embedding_id}")
        
        # Step 2: Discover topics
        print("🔍 Step 2: Discovering topics with Grok AI...")
        topic_data = await self.step2_discover_topics(job_title, job_description)
        print(f"✅ Topics: {topic_data['topics']}")
        print(f"✅ Search Queries: {topic_data['search_queries']}")
        
        # Step 3: Discover X users
        print("🐦 Step 3: Searching X for active users...")
        x_users = await self.step3_discover_x_users(
            topic_data['topics'], 
            topic_data['search_queries']
        )
        print(f"✅ Found {len(x_users)} unique users on X")
        
        # Step 4: Verify developer roles
        print("🤖 Step 4: Verifying developer roles with Grok AI...")
        verified_developers = await self.step4_verify_developer_role(x_users, job_title)
        print(f"✅ Verified {len(verified_developers)} developers")
        
        # Step 5: Enrich with LinkedIn data (mocked)
        print("💼 Step 5: Enriching with LinkedIn data...")
        enriched_candidates = self.enrich_with_linkedin(verified_developers)
        print(f"✅ Enriched {len(enriched_candidates)} candidates")
        
        # Step 6: Compute compatibility scores
        print("🎯 Step 6: Computing compatibility scores with Grok AI...")
        scored_candidates = await self.step6_compute_compatibility(
            job_title, job_description, enriched_candidates
        )
        print(f"✅ Scored {len(scored_candidates)} candidates")
        
        # Step 7: Apply thresholds and route candidates
        print("🎯 Step 7: Applying score thresholds...")
        routed_candidates = await self.step7_apply_thresholds(
            scored_candidates, job_id
        )
        
        reach_out_count = len(routed_candidates['fasttrack']) + len(routed_candidates['interview']) + len(routed_candidates['takehome'])
        print(f"✅ {reach_out_count} candidates ready for outreach")
        
        # Step 8 (Optional): Send outreach via tweet mentions
        outreach_results = None
        if send_outreach and reach_out_count > 0:
            print(f"\n🐦 Step 8: Sending tweet mentions (ask candidates to DM)...")
            
            if not job_link:
                job_link = f"https://jobs.grokreach.com/{job_id}"  # Default link
            
            # Get all candidates to reach out to
            all_outreach = routed_candidates['fasttrack'] + routed_candidates['interview'] + routed_candidates['takehome']
            
            # Use tweet mentions instead of DMs
            outreach_results = send_mentions_batch(
                candidates=all_outreach,
                job_title=job_title,
                job_link=job_link,
                dry_run=dry_run
            )
            
            if dry_run:
                print(f"   [DRY RUN] Would tweet {outreach_results['sent']} mentions")
            else:
                print(f"   ✅ Tweeted {outreach_results['sent']} mentions")
                print(f"   ❌ Failed {outreach_results['failed']} mentions")
                print(f"\n   💡 Candidates can now DM you if interested!")
                print(f"   📡 Make sure your webhook is running to capture responses")
        
        return {
            "job_id": job_id,
            "embedding_id": embedding_id,
            "topics": topic_data,
            "x_users_found": len(x_users),
            "verified_developers": len(verified_developers),
            "scored_candidates": len(scored_candidates),
            "routed_candidates": routed_candidates,
            "reach_out_count": reach_out_count,
            "outreach_results": outreach_results,
            "status": "✅ FULL PIPELINE COMPLETE (Steps 1-7)" + (" + Outreach" if send_outreach else "")
        }

