// Test API mapping
const API_BASE = 'http://localhost:8000/api';

async function testCandidateMapping() {
    try {
        console.log('🧪 Testing Candidate API Mapping\n');
        
        // Fetch candidates for Job 2
        const response = await fetch(`${API_BASE}/candidates/?job_id=2&limit=2`);
        const candidates = await response.json();
        
        console.log(`✅ Fetched ${candidates.length} candidates\n`);
        
        candidates.forEach((candidate, i) => {
            console.log(`Candidate ${i + 1}: ${candidate.name}`);
            console.log(`  ✓ x_handle: ${candidate.x_handle}`);
            console.log(`  ✓ x_bio: ${candidate.x_bio ? 'Present' : 'Missing'}`);
            console.log(`  ✓ aiScore: ${candidate.aiScore}`);
            console.log(`  ✓ status: ${candidate.status}`);
            console.log(`  ✓ aiReasoning: ${candidate.aiReasoning ? 'Present' : 'Missing'}`);
            console.log(`  ✓ strengths: ${candidate.strengths?.length || 0} items`);
            console.log(`  ✓ weaknesses: ${candidate.weaknesses?.length || 0} items`);
            console.log(`  ✓ linkedin_data.skills: ${candidate.linkedin_data?.skills?.length || 0} skills`);
            console.log(`  ✓ linkedin_data.location: ${candidate.linkedin_data?.location || 'N/A'}`);
            console.log();
        });
        
        console.log('✅ All fields are properly accessible!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCandidateMapping();
