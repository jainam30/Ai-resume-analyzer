import spacy
import json
from llm_client import analyze_with_claude, extract_json_from_claude
from vector_store import search_similar_chunks
from scorer import calculate_enterprise_score
import re

# Lazy load spacy to avoid blocking startup
nlp = None

def get_nlp():
    global nlp
    if nlp is None:
        try:
            nlp = spacy.load("en_core_web_sm")
        except:
            pass
    return nlp

def extract_keywords(text):
    """
    Dynamically extract tech keywords using LLM or spacy heuristics.
    For speed, we'll use a fast LLM call for extraction.
    """
    prompt = f"Extract a JSON list of all hard skills, programming languages, tools, and frameworks from this text:\n\n{text[:2000]}\n\nOutput only a valid JSON array of strings like [\"python\", \"react\"]."
    result = extract_json_from_claude(analyze_with_claude(prompt, "You extract technical keywords. Output ONLY JSON."))
    if isinstance(result, list):
        return [r.lower() for r in result]
    return []

def layer1_keyword_engine(resume_skills, required_skills):
    """
    Calculate Keyword Coverage.
    """
    if not required_skills: return 0.0
    matched = set(resume_skills).intersection(set(required_skills))
    return (len(matched) / len(required_skills)) * 100

def layer2_semantic_engine(resume_text, required_skills):
    """
    Calculate Semantic Match using Vector Search.
    """
    if not required_skills: return 0.0
    
    # We query pinecone for each skill or a combined query
    query = " ".join(required_skills)
    matches = search_similar_chunks(query, top_k=5)
    
    if not matches:
        return 50.0 # Neutral baseline if Pinecone fails or is empty
        
    # Evaluate matches quality via LLM
    prompt = f"Does the following resume excerpts prove strong experience with: {query}?\nExcerpts:\n{matches}\n\nOutput ONLY a valid JSON object: {{\"semantic_score\": 0 to 100}}"
    res = extract_json_from_claude(analyze_with_claude(prompt, "Evaluate semantic match. Output JSON."))
    return res.get("semantic_score", 50.0)

def layer3_context_engine(resume_text, job_description):
    """
    Experience Quality Score.
    """
    prompt = f"Evaluate the contextual quality, depth, and leadership of experience in this resume against the JD.\nJD: {job_description}\nResume: {resume_text}\nOutput ONLY JSON: {{\"experience_score\": 0 to 100, \"reason\": \"...\"}}"
    res = extract_json_from_claude(analyze_with_claude(prompt, "Evaluate experience. Output JSON."))
    return res.get("experience_score", 50.0)

def layer4_achievement_engine(resume_text):
    """
    Detect quantified achievements.
    """
    prompt = f"Analyze achievements in this resume. Look for numbers, %, metrics. High score for quantified impact, low for vague bullets.\nResume: {resume_text}\nOutput ONLY JSON: {{\"achievement_score\": 0 to 100}}"
    res = extract_json_from_claude(analyze_with_claude(prompt, "Evaluate achievements. Output JSON."))
    return res.get("achievement_score", 50.0)

def layer5_structure_engine(resume_text):
    """
    Resume Structure and formatting consistency (heuristics based on text).
    """
    lines = resume_text.split('\n')
    empty_lines = sum(1 for l in lines if not l.strip())
    # Very basic text-based heuristic for length & sections
    score = 80.0
    if len(resume_text) < 500: score -= 20
    if "education" not in resume_text.lower(): score -= 10
    if "experience" not in resume_text.lower(): score -= 10
    return max(0, score)

def layer6_readability_engine(resume_text):
    """
    Simulate Recruiter Eye Tracking. 
    Uses LLM to evaluate the first 6-second impression.
    """
    prompt = f"Simulate a recruiter scanning this resume for 6 seconds. Is the most critical info instantly visible? Are there massive walls of text?\nResume: {resume_text[:2000]}\nOutput ONLY JSON: {{\"readability_score\": 0 to 100, \"hotspots\": [\"...\"], \"hidden_strengths\": [\"...\"]}}"
    res = extract_json_from_claude(analyze_with_claude(prompt, "Evaluate readability. Output JSON."))
    return res.get("readability_score", 50.0), res

def full_analysis(resume_text, job_description):
    
    resume_skills = extract_keywords(resume_text)
    required_skills = extract_keywords(job_description)
    if not required_skills:
        required_skills = ["software engineering", "problem solving"]
        
    k_score = layer1_keyword_engine(resume_skills, required_skills)
    s_score = layer2_semantic_engine(resume_text, required_skills)
    e_score = layer3_context_engine(resume_text, job_description)
    a_score = layer4_achievement_engine(resume_text)
    st_score = layer5_structure_engine(resume_text)
    r_score, r_details = layer6_readability_engine(resume_text)
    
    final_ats = calculate_enterprise_score(k_score, s_score, e_score, a_score, st_score, r_score)
    
    return {
        "final_ats_score": final_ats,
        "layer_scores": {
            "keyword_match": k_score,
            "semantic_match": s_score,
            "experience_quality": e_score,
            "achievements": a_score,
            "structure": st_score,
            "recruiter_readability": r_score
        },
        "extracted_data": {
            "resume_skills": resume_skills,
            "required_skills": required_skills,
            "missing_skills": list(set(required_skills) - set(resume_skills))
        },
        "readability_details": r_details
    }