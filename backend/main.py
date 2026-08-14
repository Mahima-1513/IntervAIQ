from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
import io
from pydantic import BaseModel

from backend.skill_extractor import extract_skills
from backend.job_roles import JOB_ROLES
from backend.roadmap import generate_roadmap
from backend.ai_service import generate_interview_questions, evaluate_answer

app = FastAPI(
    title="AI Interview & Skill Gap Analyzer",
    description="AI-powered interview preparation and skill gap analysis system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI Interview Assistant is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        return {
            "error": "Please upload a PDF file"
        }

    content = await file.read()

    pdf = PdfReader(io.BytesIO(content))

    text = ""

    for page in pdf.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    skills = extract_skills(text)       

    return {
    "filename": file.filename,
    "pages": len(pdf.pages),
    "skills_detected": skills,
    "text": text
}

@app.post("/skill-gap")
async def skill_gap(
    resume: UploadFile = File(...),
    job_role: str = "python_developer"
):

    content = await resume.read()

    pdf = PdfReader(io.BytesIO(content))

    text = ""

    for page in pdf.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    # Resume se skills detect
    user_skills = extract_skills(text)

    # Job role ki required skills
    required_skills = JOB_ROLES.get(job_role, [])

    # Matching skills
    matched_skills = []

    for skill in required_skills:
        if skill in user_skills:
            matched_skills.append(skill)

    # Missing skills
    missing_skills = []

    for skill in required_skills:
        if skill not in user_skills:
            missing_skills.append(skill)

    # Personalized roadmap
    roadmap = generate_roadmap(missing_skills)

    # Match percentage
    if len(required_skills) > 0:
        match_percentage = round(
            (len(matched_skills) / len(required_skills)) * 100
        )
    else:
        match_percentage = 0

    return {
        "job_role": job_role,
        "match_percentage": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "personalized_roadmap": roadmap
    }

@app.post("/generate-interview")
async def generate_interview(
    job_role: str = "python_developer"
):

    required_skills = JOB_ROLES.get(job_role, [])

    questions = generate_interview_questions(
        job_role,
        required_skills
    )

    return {
        "job_role": job_role,
        "questions": questions
    }

class AnswerRequest(BaseModel):
    question: str
    answer: str


@app.post("/evaluate-answer")
async def evaluate_candidate_answer(request: AnswerRequest):

    feedback = evaluate_answer(
        request.question,
        request.answer
    )

    return {
        "evaluation": feedback
    }