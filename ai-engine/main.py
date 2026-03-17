from fastapi import FastAPI, UploadFile, File
import shutil
from parser import extract_text
from analyzer import extract_skills, calculate_score

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Resume Analyzer Running"}

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_location)

    resume_skills = extract_skills(text)

    required_skills = ["python","react","sql","docker"]

    result = calculate_score(resume_skills, required_skills)

    return {
        "resume_skills": resume_skills,
        "score": result["score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"]
    }