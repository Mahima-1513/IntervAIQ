import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_interview_questions(job_role, skills):

    prompt = f"""
You are an expert technical interviewer.

Create a clear, practical interview practice set for a candidate.

Job Role: {job_role}

Candidate Skills:
{", ".join(skills)}

Write exactly 8 concise questions: 3 Easy, 3 Medium, and 2 Hard.
Use this exact format, with one question per line:
Easy
1. [Skill] Question?
2. [Skill] Question?
3. [Skill] Question?
Medium
1. [Skill] Question?
2. [Skill] Question?
3. [Skill] Question?
Hard
1. [Skill] Question?
2. [Skill] Question?

Ask natural questions a real interviewer might ask. Keep each question easy to understand and focused on one idea. Mix foundational concepts with practical, job-related scenarios. Avoid tables, markdown grids, answers, long introductions, and duplicate questions.
Use only the provided job role and skills when choosing topics. Do not include literal Markdown symbols such as **, |, or #.
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5
    )

    return response.choices[0].message.content

def evaluate_answer(question, answer):

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer based on:

1. Correctness
2. Technical understanding
3. Completeness
4. Clarity

Give the result in this format:

Score: X/10

Correct Points:
- ...

Missing Points:
- ...

Improvement Suggestions:
- ...

Final Feedback:
...
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
