import json
from llm_client import analyze_with_claude, extract_json_from_claude

def simulate_top_companies(resume_text, job_description):
    """
    Simulates ATS screening and technical bar for top tier tech companies.
    """
    system_prompt = "You are a specialized AI that simulates the hiring committees of top tech companies."
    
    prompt = f"""
    Evaluate this candidate's resume against the typical hiring bar for Google, Amazon, and Microsoft for the following role:
    Role Context: {job_description}

    Candidate Resume:
    {resume_text}

    Analyze the candidate's impact, scale, engineering excellence, and leadership.
    You must output ONLY valid JSON in the following format:
    {{
        "company_readiness": [
            {{
                "company": "Google",
                "readiness_score": 0 to 100,
                "missing_requirements": ["Requires more planetary scale experience", "..."]
            }},
            {{
                "company": "Amazon",
                "readiness_score": 0 to 100,
                "missing_requirements": ["Lacks data-driven customer obsession metrics", "..."]
            }},
            {{
                "company": "Microsoft",
                "readiness_score": 0 to 100,
                "missing_requirements": ["Needs more enterprise/B2B context", "..."]
            }}
        ]
    }}
    """
    
    response_text = analyze_with_claude(prompt, system_prompt)
    return extract_json_from_claude(response_text)
