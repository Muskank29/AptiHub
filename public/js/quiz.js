const allQuestions = window.allQuestions || [];
let currentIndex = 0;
let score = 0;

const quizContainer = document.getElementById("quiz-container");
const feedback = document.getElementById("feedback");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");
const submitBtn = document.getElementById("submitBtn");
const timeDisplay = document.getElementById("timeDisplay");

const totalTime = allQuestions.length * 60; // 1 min per question
let timeLeft = totalTime;
let timer;

// ===== Timer =====
function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timeDisplay) {
      timeDisplay.innerText = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      finishQuiz(true); // true means time up
    }
  }, 1000);
}

  function showQuestion(index) {
  const q = allQuestions[index];

  // Labels A-D
  const labels = ["A", "B", "C", "D"];

  // Clean options → remove leading numbers/labels like "1. " or "A. "
  const cleanOptions = (q.options || []).map(opt =>
    (opt || "").toString().replace(/^[A-D]\.\s*/i, "").replace(/^\d+\.\s*/, "").trim()
  );

  // Build HTML and include data-index for each option button
  quizContainer.innerHTML = `
    <div class="question" data-index="${index}">
      <p><b>Q${index + 1}:</b> ${q.question}</p>
      <ul>
        ${cleanOptions
          .map(
            (opt, i) => `
          <li>
            <button class="option-btn" data-answer="${labels[i]}" data-index="${i}">
              ${labels[i]}. ${opt}
            </button>
          </li>`
          )
          .join("")}
      </ul>
    </div>`;

  feedback.innerText = "";
  feedback.className = "";
  prevBtn.style.display = index > 0 ? "inline-block" : "none";
  nextBtn.style.display = "none";
  submitBtn.style.display =
    index === allQuestions.length - 1 ? "inline-block" : "none";

  // Normalized correct answer (as string)
  const rawCorrect = (q.correctAnswer || "").toString().trim();

  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedLabel = btn.getAttribute("data-answer"); // "A", "B", ...
      const optIndex = parseInt(btn.getAttribute("data-index"), 10); // 0,1,2,3
      const selectedText = cleanOptions[optIndex] || "";

      // Normalize stored correct answer to check several formats
      let isCorrect = false;

      // 1) If correct is single letter A-D
      if (/^[A-D]$/i.test(rawCorrect)) {
        isCorrect = selectedLabel.toUpperCase() === rawCorrect.toUpperCase();
      }

      // 2) If correct is a number (maybe "1" meaning first option)
      if (!isCorrect && /^\d+$/.test(rawCorrect)) {
        const num = parseInt(rawCorrect, 10);
        // treat 1 as first option (1-based)
        isCorrect = (optIndex === num - 1);
      }

      // 3) If correct is full text (or text with leading label like "A. 5% loss" or "1. 5% loss")
      if (!isCorrect && rawCorrect.length > 0) {
        // clean stored correct text of leading label/number too
        const cleanedCorrectText = rawCorrect
          .replace(/^[A-D]\.\s*/i, "")
          .replace(/^\d+\.\s*/, "")
          .trim()
          .toLowerCase();

        isCorrect = selectedText.trim().toLowerCase() === cleanedCorrectText;
      }

      // Feedback + score
      if (isCorrect) {
        feedback.innerText = "✅ Correct!";
        feedback.className = "correct";
        // increment score: use q.marks if available else 1
        score += Number(q.marks || 1);
      } else {
        // Show both letter and the option text as the correct answer
        // Determine display of correct label + text:
        let correctLabel = "";
        let correctText = "";

        // If stored as letter, map to text
        if (/^[A-D]$/i.test(rawCorrect)) {
          correctLabel = rawCorrect.toUpperCase();
          const idx = ["A","B","C","D"].indexOf(correctLabel);
          correctText = cleanOptions[idx] || "";
        } else if (/^\d+$/.test(rawCorrect)) {
          const num = parseInt(rawCorrect, 10);
          correctLabel = ["A","B","C","D"][num - 1] || "";
          correctText = cleanOptions[num - 1] || "";
        } else {
          // Try to extract label from stored text like "A. text" or "1. text"
          const maybeClean = rawCorrect.replace(/^[A-D]\.\s*/i, "").replace(/^\d+\.\s*/, "").trim();
          correctText = maybeClean;
          // Try find matching option index
          const foundIndex = cleanOptions.findIndex(o => o.trim().toLowerCase() === maybeClean.toLowerCase());
          if (foundIndex !== -1) correctLabel = ["A","B","C","D"][foundIndex];
        }

        const correctDisplay = (correctLabel ? `${correctLabel}. ` : "") + (correctText || rawCorrect);
        feedback.innerText = `❌ Wrong! Correct answer: ${correctDisplay}`;
        feedback.className = "wrong";
      }

      nextBtn.style.display = "inline-block";
    });
  });
}




// ===== Navigation =====
function nextQuestion() {
  currentIndex++;
  if (currentIndex < allQuestions.length) {
    showQuestion(currentIndex);
  } else {
    finishQuiz();
  }
}

function finishQuiz(timeUp = false) {
  clearInterval(timer);
  quizContainer.innerHTML = `
    <h2>🎉 Quiz Completed!</h2>
    <p>Your final score: <b>${score}/${allQuestions.length}</b></p>
    ${timeUp ? "<p style='color:red;'>⏰ Time’s up!</p>" : ""}
  `;
  feedback.innerText = "";
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
  skipBtn.style.display = "none";
  submitBtn.style.display = "none";
}

// ===== Button Listeners =====
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
});

nextBtn.addEventListener("click", () => {
  nextQuestion();
});

skipBtn.addEventListener("click", () => {
  nextQuestion();
});

submitBtn.addEventListener("click", () => {
  finishQuiz();
});

// ===== Start Quiz =====
startTimer();
showQuestion(currentIndex);
