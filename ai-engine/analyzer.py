import spacy

nlp = spacy.load("en_core_web_sm")

skills_db = [
"python","java","c","c++","react","angular","node","express",
"sql","mysql","mongodb","docker","kubernetes","aws",
"machine learning","deep learning","data science",
"html","css","javascript","typescript"
]

def extract_skills(text):

    text = text.lower()

    found_skills = []

    for skill in skills_db:
        if skill in text:
            found_skills.append(skill)

    return found_skills


def calculate_score(resume_skills, required_skills):

    matched = []

    for skill in required_skills:
        if skill in resume_skills:
            matched.append(skill)

    score = (len(matched) / len(required_skills)) * 100

    return {
        "score": round(score,2),
        "matched_skills": matched,
        "missing_skills": list(set(required_skills) - set(matched))
    }