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

Generate interview questions for a candidate.

Job Role: {job_role}

Candidate Skills:
{", ".join(skills)}

Generate:
- 3 Easy questions
- 3 Medium questions
- 2 Hard questions

Focus on the candidate's skills and job role.

Return the questions in a clear format.
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
