SKILLS = [
    "Python",
    "SQL",
    "FastAPI",
    "Django",
    "Flask",
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "NLP",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Power BI",
    "Alteryx"
]


def extract_skills(text):
    detected_skills = []

    text_lower = text.lower()

    for skill in SKILLS:
        if skill.lower() in text_lower:
            detected_skills.append(skill)

    return detected_skills