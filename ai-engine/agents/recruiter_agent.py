import json
from llm_client import analyze_with_claude, extract_json_from_claude

def get_hiring_recommendation(resume_text, job_description, scores_breakdown):
    """
    Uses Claude to act as a Senior Recruiter and give a hiring recommendation.
    """
    system_prompt = "You are an elite Senior Technical Recruiter. You evaluate candidates based on their resume, the job description, and the multi-layer ATS scores provided to you."
    
    prompt = f"""
    Evaluate this candidate for the following Job Description.

    Job Description:
    {job_description}

    Candidate Resume:
    {resume_text}

    ATS System Scores:
    {json.dumps(scores_breakdown, indent=2)}

    Based on the above, provide a hiring recommendation.
    You must output ONLY valid JSON in the following format:
    {{
        "recommendation": "Hire" | "Strong Hire" | "Maybe" | "Reject",
        "reasoning": [
            "Reason 1...",
            "Reason 2..."
        ],
        "missing_highlights": [
            "Missing X...",
            "Lacks Y..."
        ],
        "probability_metrics": {{
            "ats_pass_rate": 0.0 to 100.0,
            "recruiter_callback_rate": 0.0 to 100.0,
            "interview_probability": 0.0 to 100.0,
            "offer_probability": 0.0 to 100.0
        }}
    }}
    """
    
    response_text = analyze_with_claude(prompt, system_prompt)
    return extract_json_from_claude(response_text)
