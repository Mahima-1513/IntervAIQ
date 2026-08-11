from fastapi import FastAPI

app = FastAPI(
    title="AI Interview & Skill Gap Analyzer",
    description="AI-powered interview preparation and skill gap analysis system",
    version="1.0.0"
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