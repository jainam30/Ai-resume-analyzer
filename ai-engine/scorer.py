def calculate_enterprise_score(keyword_score, semantic_score, experience_score, achievement_score, structure_score, readability_score):
    """
    Weighted scoring formula:
    Keyword Match = 20%
    Semantic Match = 25%
    Experience Quality = 20%
    Achievements = 15%
    Structure = 10%
    Recruiter Readability = 10%
    """
    weights = {
        "keyword": 0.20,
        "semantic": 0.25,
        "experience": 0.20,
        "achievement": 0.15,
        "structure": 0.10,
        "readability": 0.10
    }
    
    total = (
        keyword_score * weights["keyword"] +
        semantic_score * weights["semantic"] +
        experience_score * weights["experience"] +
        achievement_score * weights["achievement"] +
        structure_score * weights["structure"] +
        readability_score * weights["readability"]
    )
    
    return round(total, 2)
