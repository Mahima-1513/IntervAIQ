const API_URL = "https://intervaiq.onrender.com";

// Global scores
let currentSkillScore = 0;
let currentInterviewScore = 0;


// ===============================
// 1. Upload Resume
// ===============================

async function uploadResume() {

    const fileInput = document.getElementById("resume");
    const result = document.getElementById("resumeResult");

    if (!fileInput.files.length) {
        result.innerHTML = "⚠️ Please select a PDF resume first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    result.innerHTML = "⏳ Analyzing your resume...";

    try {

        const response = await fetch(`${API_URL}/upload-resume`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            result.innerHTML = `❌ ${data.error}`;
            return;
        }

        const skillChips = data.skills_detected
            .map(skill => `<span class="chip">${skill}</span>`)
            .join("");

        result.innerHTML = `
            <div class="result-title success">
                ✅ Resume Analyzed
            </div>

            <p><strong>File:</strong> ${data.filename}</p>

            <p><strong>Pages:</strong> ${data.pages}</p>

            <p class="chip-label">
                Skills Detected:
            </p>

            <div class="chip-container">
                ${skillChips}
            </div>
        `;

    } catch (error) {

        result.innerHTML =
            "❌ Backend connection failed. Please make sure FastAPI is running.";

        console.error(error);
    }
}


// ===============================
// 2. Skill Gap Analysis
// ===============================

async function checkSkillGap() {

    const fileInput = document.getElementById("resume");
    const jobRole = document.getElementById("jobRole").value;
    const result = document.getElementById("skillResult");

    if (!fileInput.files.length) {

        result.innerHTML =
            "⚠️ Please upload your resume first.";

        return;
    }

    const formData = new FormData();

    formData.append(
        "resume",
        fileInput.files[0]
    );

    result.innerHTML =
        "⏳ Checking your skill gap...";

    try {

        const response = await fetch(
            `${API_URL}/skill-gap?job_role=${jobRole}`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        // SAVE SKILL SCORE
        currentSkillScore =
            Number(data.match_percentage) || 0;

        // Update UI
        document.getElementById("skillScore").textContent =
            currentSkillScore + "/100";


        const matchedChips = data.matched_skills
            .map(
                skill =>
                    `<span class="chip chip-green">${skill}</span>`
            )
            .join("")
            ||
            "<span class='muted'>None</span>";


        const missingChips = data.missing_skills
            .map(
                skill =>
                    `<span class="chip chip-red">${skill}</span>`
            )
            .join("")
            ||
            "<span class='muted'>None</span>";


        result.innerHTML = `

            <div class="result-title">
                🎯 Skill Gap Result
            </div>

            <p>
                <strong>Job Role:</strong>
                ${data.job_role}
            </p>

            <div class="progress-label">

                <span>Match</span>

                <span>
                    ${data.match_percentage}%
                </span>

            </div>

            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="width:${data.match_percentage}%">
                </div>

            </div>


            <p class="chip-label">
                ✅ Matched Skills:
            </p>

            <div class="chip-container">
                ${matchedChips}
            </div>


            <p class="chip-label">
                ⚠️ Missing Skills:
            </p>

            <div class="chip-container">
                ${missingChips}
            </div>

        `;

    } catch (error) {

        result.innerHTML =
            "❌ Unable to connect with backend.";

        console.error(error);
    }
}


// ===============================
// 3. Generate Interview
// ===============================

async function generateInterview() {

    const jobRole =
        document.getElementById("jobRole").value;

    const result =
        document.getElementById("questions");

    result.innerHTML =
        "🤖 AI is generating interview questions...";


    try {

        const response = await fetch(
            `${API_URL}/generate-interview?job_role=${jobRole}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const detail = data.detail || data.error || `Request failed (${response.status})`;
            throw new Error(detail);
        }

        if (!data.questions) {
            throw new Error("The backend returned no interview questions.");
        }

        result.innerHTML = `

            <div class="result-title">
                🤖 AI Interview Questions
            </div>

            <p class="question-role">Practice questions for <strong>${escapeHTML(formatJobRole(data.job_role || jobRole))}</strong></p>

            <div class="ai-response">
                ${formatInterviewQuestions(data.questions)}
            </div>

        `;

    } catch (error) {

        result.innerHTML = `❌ Unable to generate questions: ${error.message}`;
        console.error(error);
    }
}


// ===============================
// 4. Evaluate Answer
// ===============================

async function evaluateAnswer() {

    const question =
        document.getElementById("question").value;

    const answer =
        document.getElementById("answer").value;

    const result =
        document.getElementById("evaluation");


    if (!question || !answer) {

        result.innerHTML =
            "⚠️ Please enter both question and answer.";

        return;
    }


    result.innerHTML =
        "🧠 AI is evaluating your answer...";


    try {

        const response = await fetch(
            `${API_URL}/evaluate-answer`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question,
                    answer: answer
                })
            }
        );


        const data = await response.json();


        // Find score like 7/10
        const scoreMatch =
            data.evaluation.match(
                /Score:\s*(\d+)\/10/i
            );


        let scoreHTML = "";


        if (scoreMatch) {

            const score =
                Number(scoreMatch[1]);


            // SAVE INTERVIEW SCORE
            // Convert 10 scale → 100 scale
            currentInterviewScore =
                score * 10;


            // Update readiness section
            document.getElementById(
                "interviewScore"
            ).textContent =
                currentInterviewScore + "/100";


            scoreHTML = `

                <div class="score-circle">

                    <span class="score-number">
                        ${score}
                    </span>

                    <span class="score-total">
                        /10
                    </span>

                </div>

            `;
        }


        result.innerHTML = `

            <div class="result-title">
                📊 AI Evaluation
            </div>

            ${scoreHTML}

            <div class="ai-response">
                ${formatAIResponse(data.evaluation)}
            </div>

        `;


    } catch (error) {

        result.innerHTML =
            "❌ Unable to evaluate answer.";

        console.error(error);
    }
}


// ===============================
// 5. Format AI Response
// ===============================

function formatAIResponse(text) {

    let formatted = text

        .replace(
            /Score:\s*\d+\/10/i,
            ""
        )

        .replace(
            /(Easy Questions|Medium Questions|Hard Questions|Correct Points:|Missing Points:|Improvement Suggestions:|Final Feedback:)/g,

            "<div class='section-heading'>$1</div>"
        )

        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )

        .replace(
            /^- (.*)$/gm,
            "<div class='bullet'>• $1</div>"
        )

        .replace(
            /\n/g,
            "<br>"
        );


    return formatted;
}

function formatInterviewQuestions(text) {
    const groups = { Easy: [], Medium: [], Hard: [] };
    let currentLevel = "";
    const lines = String(text).split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || /^\|?\s*:?-{3,}/.test(line)) continue;

        const cells = line.split("|").map(cell => cell.trim());
        while (cells.length && !cells[0]) cells.shift();
        while (cells.length && !cells[cells.length - 1]) cells.pop();
        if (/^(difficulty|level)$/i.test(cells[0] || "") || /^(question|focus area|skill focus)$/i.test(cells[1] || "")) continue;

        let level = "";
        let question = "";
        let skill = "";

        if (cells.length >= 3 && /^(easy|medium|hard|beginner|intermediate|advanced)$/i.test(cells[0])) {
            level = cells[0];
            currentLevel = level.toLowerCase();
            question = cells[1];
            skill = cells[2];
        } else if (line.includes("|") && currentLevel && cells.length >= 2) {
            question = cells[0];
            skill = cells[1];
        } else {
            const heading = line.replace(/^#{1,3}\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
            if (/interview questions|question bank/i.test(heading)) continue;
            const matchedLevel = heading.match(/^(easy|medium|hard|beginner|intermediate|advanced)( questions)?$/i);
            if (matchedLevel) {
                currentLevel = matchedLevel[1].toLowerCase();
                continue;
            }
            currentLevel = currentLevel || "easy";
            question = cells.length > 1 ? cells.slice(1).join(" ") : line;
            const numbered = question.match(/^\s*(?:\d+[.)]|[-*])\s*(.*)$/);
            if (numbered) question = numbered[1];
        }

        question = question
            .replace(/\*\*/g, "")
            .replace(/`/g, "")
            .replace(/^\s*(?:\d+[.)]|[-*])\s*/, "")
            .trim();
        const taggedQuestion = question.match(/^\[([^\]]+)\]\s*(.*)$/);
        if (taggedQuestion) {
            skill = skill || taggedQuestion[1];
            question = taggedQuestion[2];
        }
        if (!question || /^(question|skill focus)$/i.test(question)) continue;

        const normalizedLevel = (level || currentLevel).toLowerCase();
        const group = /^(easy|beginner)$/.test(normalizedLevel) ? "Easy"
            : /^(medium|intermediate)$/.test(normalizedLevel) ? "Medium"
            : /^(hard|advanced)$/.test(normalizedLevel) ? "Hard" : "Easy";
        groups[group].push({ skill: skill.replace(/\*\*/g, "").replace(/`/g, ""), question });
    }

    const sections = Object.entries(groups).filter(([, items]) => items.length);
    if (!sections.length) {
        const cleaned = String(text).replace(/\*\*/g, "").replace(/`/g, "").replace(/\|/g, " ").trim();
        return `<section class="question-level"><h4>Easy</h4><div class="question-card"><p>${escapeHTML(cleaned)}</p></div></section>`;
    }

    return sections.map(([level, items]) => `
        <section class="question-level">
            <h4>${level}</h4>
            <div class="question-list">
                ${items.map(({ skill, question }, index) => `
                    <article class="question-card">
                        <span class="question-number">${index + 1}</span>
                        <div>
                            ${skill ? `<span class="question-skill">${escapeHTML(skill)}</span>` : ""}
                            <p>${escapeHTML(question)}</p>
                        </div>
                    </article>
                `).join("")}
            </div>
        </section>
    `).join("");
}

function formatJobRole(role) {
    return String(role).replace(/[_-]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}


// ===============================
// 6. Interview Readiness Score
// ===============================

function calculateReadinessScore() {

    // Get latest scores
    const skillScore =
        currentSkillScore;

    const interviewScore =
        currentInterviewScore;


    // Calculate average
    const readinessScore =
        Math.round(
            (skillScore + interviewScore) / 2
        );


    // Main score
    document.getElementById(
        "readinessScore"
    ).textContent =
        readinessScore;


    // Individual scores
    document.getElementById(
        "skillScore"
    ).textContent =
        skillScore + "/100";


    document.getElementById(
        "interviewScore"
    ).textContent =
        interviewScore + "/100";


    // Readiness level
    let level;


    if (readinessScore >= 80) {

        level =
            "🏆 Excellent Preparation";

    }

    else if (readinessScore >= 60) {

        level =
            "👍 Good Preparation";

    }

    else if (readinessScore >= 40) {

        level =
            "📚 Needs Improvement";

    }

    else {

        level =
            "⚠️ More Preparation Required";
    }


    document.getElementById(
        "readinessLevel"
    ).textContent =
        level;


    // Result message
    document.getElementById(
        "readinessResult"
    ).textContent =
        "Your overall interview readiness score is " +
        readinessScore +
        "/100.";
}
