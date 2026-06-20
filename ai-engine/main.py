from fastapi import FastAPI, UploadFile, File, Form
import shutil
import os
from parser import extract_text
from analyzer import full_analysis
from vector_store import store_resume_chunks
from agents.recruiter_agent import get_hiring_recommendation
from agents.company_simulator import simulate_top_companies
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Enterprise ATS Intelligence AI Running"}

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):
    file_location = f"temp_{file.filename}"
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Parse Text
        text = extract_text(file_location)
        if not text or len(text.strip()) == 0:
            return {"error": "Could not extract text from resume"}

        # 2. Store in Vector DB
        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        store_resume_chunks(file.filename, chunks)

        # 3. Multi-Layer ATS Scoring
        analysis_results = full_analysis(text, job_description)

        # 4. Agentic Evaluations
        hiring_rec = get_hiring_recommendation(text, job_description, analysis_results["layer_scores"])
        company_sim = simulate_top_companies(text, job_description)

        return {
            "ats_intelligence": analysis_results,
            "recruiter_agent": hiring_rec,
            "company_simulator": company_sim
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
        return {"error": str(e)}
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)