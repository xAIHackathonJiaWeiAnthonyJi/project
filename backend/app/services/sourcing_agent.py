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
from app.utils.logger import AgentLogger
from app.db.database import engine
from app.models.schemas import Candidate, JobCandidate
from sqlmodel import Session
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
        AgentLogger.log_embedding(
            f"Starting embedding generation for job {job_id}: {job_title}",
            job_id=job_id
        )
        
        try:
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
            
            AgentLogger.log_embedding(
                f"Successfully generated embedding for job {job_id}. Embedding ID: {embedding_id}",
                job_id=job_id,
                embedding_id=embedding_id,
                embedding_dimensions=len(embedding)
            )
            
            return embedding, embedding_id
            
        except Exception as e:
            AgentLogger.log_error(
                f"Failed to generate embedding for job {job_id}: {job_title}",
                error=e,
                job_id=job_id
            )
            raise
    
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
        AgentLogger.log_sourcing(
            f"Starting topic discovery for job: {job_title}"
        )
        
        try:
            result = await discover_topics_from_job(job_title, job_description)
            
            AgentLogger.log_sourcing(
                f"Successfully discovered {len(result.get('topics', []))} topics and {len(result.get('search_queries', []))} search queries",
                topics=result.get('topics', []),
                search_queries=result.get('search_queries', [])
            )
            
            return result
            
        except Exception as e:
            AgentLogger.log_error(
                f"Failed to discover topics for job: {job_title}",
                error=e
            )
            raise
    
    # ========================================
    # STEP 3: TOPIC → ACTIVE X USERS
    # ========================================
    
    async def step3_discover_x_users(
        self,
        topics: List[str],
        search_queries: List[str],
        job_id: Optional[int] = None
    ) -> List[Dict]:
        """
        Search X for users posting about topics
        
        Returns:
            List of X user profiles with signals
        """
        AgentLogger.log_search(
            f"Starting X user discovery for {len(topics)} topics and {len(search_queries)} search queries",
            job_id=job_id,
            topics=topics,
            search_queries=search_queries
        )
        
        try:
            users = discover_users_from_topics(topics, search_queries, max_per_query=10)
            
            AgentLogger.log_search(
                f"Successfully discovered {len(users)} X users posting about relevant topics",
                job_id=job_id,
                users_found=len(users),
                topics_searched=len(topics)
            )
            
            return users
            
        except Exception as e:
            AgentLogger.log_error(
                f"Failed to discover X users for topics: {topics}",
                error=e,
                job_id=job_id
            )
            raise
    
    # ========================================
    # STEP 4: X USERS → ROLE VERIFICATION
    # ========================================
    
    async def step4_verify_developer_role(
        self,
        x_users: List[Dict],
        job_title: str,
        job_id: Optional[int] = None
    ) -> List[Dict]:
        """
        AI classification: Is this user a developer matching the role?
        """
        AgentLogger.log_scoring(
            f"Starting role verification for {len(x_users)} X users against {job_title} role",
            job_id=job_id,
            users_to_verify=len(x_users),
            target_role=job_title
        )
        
        try:
            verified_developers = await verify_developers_batch(x_users, job_title)
            filtered_count = len(x_users) - len(verified_developers)
            
            AgentLogger.log_scoring(
                f"Role verification complete: {len(verified_developers)} developers verified, {filtered_count} filtered out",
                job_id=job_id,
                developers_verified=len(verified_developers),
                users_filtered=filtered_count,
                verification_rate=f"{(len(verified_developers)/len(x_users)*100):.1f}%" if x_users else "0%"
            )
            
            return verified_developers
            
        except Exception as e:
            AgentLogger.log_error(
                f"Failed to verify developer roles for {len(x_users)} users",
                error=e,
                job_id=job_id
            )
            raise
    
    # ========================================
    # STEP 5: EXPERIENCE VALIDATION (MOCKED)
    # ========================================
    
    def step5_get_linkedin_profile(self, x_handle: str, name: str = None, job_id: Optional[int] = None) -> Optional[Dict]:
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
    
    def enrich_with_linkedin(self, verified_developers: List[Dict], job_id: Optional[int] = None) -> List[Dict]:
        """
        Enrich verified developers with LinkedIn data (mocked)
        Uses X handle and real name for matching
        
        Args:
            verified_developers: List of developers from Step 4
            
        Returns:
            List of developers with linkedin_data field added
        """
        AgentLogger.log_sourcing(
            f"Starting LinkedIn enrichment for {len(verified_developers)} verified developers",
            job_id=job_id,
            developers_to_enrich=len(verified_developers)
        )
        
        enriched = []
        linkedin_found = 0
        
        for dev in verified_developers:
            username = dev['username']
            x_handle = f"@{username}"
            real_name = dev.get('name', '')  # Get real name from X profile
            
            # Try to find LinkedIn profile (with name-based fuzzy matching)
            linkedin_profile = self.step5_get_linkedin_profile(x_handle, real_name)
            
            if linkedin_profile:
                dev['linkedin_data'] = linkedin_profile
                dev['has_linkedin'] = True
                linkedin_found += 1
                print(f"  ✅ @{username} ({real_name}): Found LinkedIn ({linkedin_profile['headline']})")
            else:
                # Create synthetic LinkedIn based on classification and X data
                role_type = dev.get('classification', {}).get('role_type', 'unknown')
                dev['linkedin_data'] = self._generate_synthetic_linkedin(dev, role_type)
                dev['has_linkedin'] = False
                print(f"  ⚠️ @{username} ({real_name}): No LinkedIn found, using synthetic profile")
            
            enriched.append(dev)
        
        AgentLogger.log_sourcing(
            f"LinkedIn enrichment complete: {linkedin_found} real profiles found, {len(enriched) - linkedin_found} synthetic profiles created",
            job_id=job_id,
            profiles_enriched=len(enriched),
            real_linkedin_profiles=linkedin_found,
            synthetic_profiles=len(enriched) - linkedin_found
        )
        
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
        enriched_candidates: List[Dict],
        job_id: Optional[int] = None
    ) -> List[Dict]:
        """
        AI-powered candidate-job fit scoring for all candidates
        
        Returns:
            List of candidates with compatibility scores added
        """
        AgentLogger.log_scoring(
            f"Starting compatibility scoring for {len(enriched_candidates)} candidates against {job_title}",
            job_id=job_id,
            candidates_to_score=len(enriched_candidates),
            job_title=job_title
        )
        
        scored_candidates = []
        scores = []
        
        for candidate in enriched_candidates:
            username = candidate.get('username', 'unknown')
            print(f"📊 Scoring @{username}...")
            
            try:
                score_data = await compute_compatibility_score(
                    job_title=job_title,
                    job_description=job_description,
                    candidate=candidate
                )
                
                candidate['compatibility'] = score_data
                scored_candidates.append(candidate)
                scores.append(score_data['compatibility_score'])
                
                AgentLogger.log_scoring(
                    f"Scored candidate @{username}: {score_data['compatibility_score']}/100",
                    job_id=job_id,
                    candidate_username=username,
                    score=score_data['compatibility_score'],
                    reasoning=score_data.get('reasoning', '')[:200]  # First 200 chars
                )
                
                print(f"  ✅ Score: {score_data['compatibility_score']}/100")
                
            except Exception as e:
                AgentLogger.log_error(
                    f"Failed to score candidate @{username}",
                    error=e,
                    job_id=job_id,
                    candidate_username=username
                )
                print(f"  ❌ Error scoring @{username}: {e}")
        
        avg_score = sum(scores) / len(scores) if scores else 0
        AgentLogger.log_scoring(
            f"Compatibility scoring complete: {len(scored_candidates)} candidates scored, average score: {avg_score:.1f}/100",
            job_id=job_id,
            candidates_scored=len(scored_candidates),
            average_score=avg_score,
            score_range=f"{min(scores):.1f}-{max(scores):.1f}" if scores else "N/A"
        )
        
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
        AgentLogger.log_sourcing(
            f"Starting candidate routing with thresholds: reject<{threshold_reject}, takehome<{threshold_takehome}, interview<{threshold_interview}",
            job_id=job_id,
            candidates_to_route=len(candidates),
            thresholds={
                "reject": threshold_reject,
                "takehome": threshold_takehome,
                "interview": threshold_interview
            }
        )
        
        if not candidates:
            print(f"   ⚠️ No candidates to process")
            AgentLogger.log_sourcing("No candidates to route", job_id=job_id)
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
        
        AgentLogger.log_sourcing(
            f"Candidate routing complete: {len(routed['fasttrack'])} fasttrack, {len(routed['interview'])} interview, {len(routed['takehome'])} takehome, {len(routed['reject'])} reject",
            job_id=job_id,
            routing_results={
                "fasttrack": len(routed['fasttrack']),
                "interview": len(routed['interview']),
                "takehome": len(routed['takehome']),
                "reject": len(routed['reject']),
                "total_outreach": len(reach_out)
            }
        )
        
        # TODO: Insert into database with recommendation field
        # TODO: Trigger outreach workflow for non-rejected candidates
        
        return routed
    
    # ========================================
    # DATABASE OPERATIONS
    # ========================================
    
    def save_candidates_to_database(self, scored_candidates: List[Dict], job_id: int) -> Dict:
        """
        Save discovered candidates to the database
        
        Args:
            scored_candidates: List of candidates with scores
            job_id: Job ID to associate candidates with
            
        Returns:
            Dictionary with save results
        """
        AgentLogger.log_sourcing(
            f"Saving {len(scored_candidates)} candidates to database for job {job_id}",
            job_id=job_id,
            candidates_to_save=len(scored_candidates)
        )
        
        saved_count = 0
        updated_count = 0
        
        try:
            with Session(engine) as session:
                for candidate_data in scored_candidates:
                    # Extract candidate info
                    name = candidate_data.get('name', candidate_data.get('username', 'Unknown'))
                    x_handle = candidate_data.get('username')
                    x_bio = candidate_data.get('bio', '')
                    linkedin_data = candidate_data.get('linkedin_data', {})
                    
                    # Check if candidate already exists
                    existing_candidate = session.query(Candidate).filter(
                        Candidate.x_handle == f"@{x_handle}"
                    ).first()
                    
                    if existing_candidate:
                        # Update existing candidate
                        existing_candidate.x_bio = x_bio
                        existing_candidate.linkedin_data = linkedin_data
                        candidate_id = existing_candidate.id
                        updated_count += 1
                        
                        AgentLogger.log_sourcing(
                            f"Updated existing candidate: {name} (@{x_handle})",
                            job_id=job_id,
                            candidate_id=candidate_id
                        )
                    else:
                        # Create new candidate
                        new_candidate = Candidate(
                            name=name,
                            x_handle=f"@{x_handle}",
                            x_bio=x_bio,
                            linkedin_data=linkedin_data
                        )
                        session.add(new_candidate)
                        session.flush()  # Get the ID
                        candidate_id = new_candidate.id
                        saved_count += 1
                        
                        AgentLogger.log_sourcing(
                            f"Saved new candidate: {name} (@{x_handle})",
                            job_id=job_id,
                            candidate_id=candidate_id
                        )
                    
                    # Create or update job-candidate relationship
                    compatibility = candidate_data.get('compatibility', {})
                    score = compatibility.get('compatibility_score', 0)
                    reasoning = compatibility.get('reasoning', '')
                    recommendation = candidate_data.get('recommendation', 'sourced')
                    
                    # Map recommendation to stage
                    stage_mapping = {
                        'fasttrack': 'interview',
                        'interview': 'interview', 
                        'takehome': 'takehome_assigned',
                        'reject': 'rejected',
                        'sourced': 'sourced'
                    }
                    stage = stage_mapping.get(recommendation, 'sourced')
                    
                    # Check if job-candidate relationship exists
                    existing_job_candidate = session.query(JobCandidate).filter(
                        JobCandidate.job_id == job_id,
                        JobCandidate.candidate_id == candidate_id
                    ).first()
                    
                    if existing_job_candidate:
                        # Update existing relationship
                        existing_job_candidate.compatibility_score = score
                        existing_job_candidate.ai_reasoning = reasoning
                        existing_job_candidate.stage = stage
                    else:
                        # Create new relationship
                        job_candidate = JobCandidate(
                            job_id=job_id,
                            candidate_id=candidate_id,
                            compatibility_score=score,
                            ai_reasoning=reasoning,
                            stage=stage
                        )
                        session.add(job_candidate)
                
                session.commit()
                
        except Exception as e:
            AgentLogger.log_error(
                f"Failed to save candidates to database for job {job_id}",
                error=e,
                job_id=job_id
            )
            raise
        
        AgentLogger.log_sourcing(
            f"Successfully saved candidates: {saved_count} new, {updated_count} updated",
            job_id=job_id,
            new_candidates=saved_count,
            updated_candidates=updated_count,
            total_processed=len(scored_candidates)
        )
        
        return {
            "saved_count": saved_count,
            "updated_count": updated_count,
            "total_processed": len(scored_candidates)
        }
    
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
            topic_data['search_queries'],
            job_id
        )
        print(f"✅ Found {len(x_users)} unique users on X")
        
        # Step 4: Verify developer roles
        print("🤖 Step 4: Verifying developer roles with Grok AI...")
        verified_developers = await self.step4_verify_developer_role(x_users, job_title, job_id)
        print(f"✅ Verified {len(verified_developers)} developers")
        
        # Step 5: Enrich with LinkedIn data (mocked)
        print("💼 Step 5: Enriching with LinkedIn data...")
        enriched_candidates = self.enrich_with_linkedin(verified_developers, job_id)
        print(f"✅ Enriched {len(enriched_candidates)} candidates")
        
        # Step 6: Compute compatibility scores
        print("🎯 Step 6: Computing compatibility scores with Grok AI...")
        scored_candidates = await self.step6_compute_compatibility(
            job_title, job_description, enriched_candidates, job_id
        )
        print(f"✅ Scored {len(scored_candidates)} candidates")
        
        # Step 7: Apply thresholds and route candidates
        print("🎯 Step 7: Applying score thresholds...")
        routed_candidates = await self.step7_apply_thresholds(
            scored_candidates, job_id
        )
        
        reach_out_count = len(routed_candidates['fasttrack']) + len(routed_candidates['interview']) + len(routed_candidates['takehome'])
        print(f"✅ {reach_out_count} candidates ready for outreach")
        
        # Save candidates to database
        print("💾 Saving candidates to database...")
        all_candidates = routed_candidates['fasttrack'] + routed_candidates['interview'] + routed_candidates['takehome'] + routed_candidates['reject']
        save_results = self.save_candidates_to_database(all_candidates, job_id)
        print(f"✅ Saved {save_results['saved_count']} new candidates, updated {save_results['updated_count']} existing")
        
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

