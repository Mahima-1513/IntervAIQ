ROADMAPS = {

    "Django": {
        "duration": "2 Days",
        "topics": [
            "Django basics",
            "Models and ORM",
            "CRUD operations",
            "Django REST Framework"
        ]
    },

    "Docker": {
        "duration": "1 Day",
        "topics": [
            "Docker basics",
            "Dockerfile",
            "Images and containers",
            "Dockerize FastAPI application"
        ]
    },

    "Pytest": {
        "duration": "1 Day",
        "topics": [
            "Pytest basics",
            "Unit testing",
            "API testing",
            "Write tests for FastAPI"
        ]
    },

    "Git": {
        "duration": "1 Day",
        "topics": [
            "Git basics",
            "Branches",
            "Commits",
            "Pull requests"
        ]
    },

    "SQL": {
        "duration": "2 Days",
        "topics": [
            "SELECT queries",
            "Joins",
            "Group By",
            "Subqueries"
        ]
    },

    "Machine Learning": {
        "duration": "3 Days",
        "topics": [
            "ML fundamentals",
            "Data preprocessing",
            "Model training",
            "Model evaluation"
        ]
    },

    "Pandas": {
        "duration": "1 Day",
        "topics": [
            "DataFrames",
            "Data cleaning",
            "Filtering",
            "GroupBy"
        ]
    }
}


def generate_roadmap(missing_skills):

    roadmap = []

    for skill in missing_skills:

        if skill in ROADMAPS:

            roadmap.append({
                "skill": skill,
                "duration": ROADMAPS[skill]["duration"],
                "topics": ROADMAPS[skill]["topics"]
            })

    return roadmap