from parser import extract_text
from analyzer import extract_skills, calculate_score

resume_text = extract_text("sample_resume.pdf")

resume_skills = extract_skills(resume_text)

required_skills = ["python","react","sql","docker"]

result = calculate_score(resume_skills, required_skills)

print("Resume Skills:", resume_skills)
print("Score:", result["score"])
print("Matched Skills:", result["matched_skills"])
print("Missing Skills:", result["missing_skills"])