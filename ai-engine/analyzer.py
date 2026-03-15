import spacy

nlp = spacy.load("en_core_web_sm")

skills_db = [
"python","java","react","node","sql","machine learning",
"docker","aws","kubernetes"
]

def extract_skills(text):

    doc = nlp(text.lower())

    found_skills = []

    for skill in skills_db:
        if skill in text:
            found_skills.append(skill)

    return found_skills