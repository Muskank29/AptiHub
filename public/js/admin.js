// admin.js
// async function addQuestion(level, questionData) {
//   const collectionName = `${level}_questions`;
//   try {
//     const docRef = await db.collection(collectionName).add(questionData);
//     alert("Question added!");
//   } catch (err) {
//     console.error(err);
//     alert("Error adding question");
//   }
// }

// function handleFormSubmit() {
//   const newQuestion = {
//     questionText: document.getElementById("questionText").value,
//     options: [
//       document.getElementById("optionA").value,
//       document.getElementById("optionB").value,
//       document.getElementById("optionC").value,
//       document.getElementById("optionD").value,
//     ],
//     correctAnswer: document.getElementById("correctAnswer").value,
//   };

//   const level = document.getElementById("questionLevel").value;
//   addQuestion(level, newQuestion);
// }

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
   apiKey: "AIzaSyDLF_JF9FtOBxW8TlpWYkKx3coM85QmX1U",
  authDomain: "aptihub2529.firebaseapp.com",
  projectId: "aptihub2529",
  storageBucket: "aptihub2529.firebasestorage.app",
  messagingSenderId: "791326188951",
  appId: "1:791326188951:web:96433ac7d26705d70490d2",
  measurementId: "G-JX9T9Z4VW2"
};

// --- INITIALIZE FIREBASE AND GET SERVICES ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- GET HTML ELEMENTS ---
const addQuestionForm = document.getElementById('add-question-form');
const viewQuestionsButton = document.getElementById('view-questions-button');
const questionsListDiv = document.getElementById('questions-list');

// --- Handle Form to Add a New Question ---
addQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const level = document.getElementById('level-select').value;
    const collectionName = `${level}_questions`;

    // This is the corrected part. The field is now "question" to match your Android app.
    const questionData = {
        question: document.getElementById('question-input').value,
        options: document.getElementById('options-input').value.split(',').map(s => s.trim()),
        correctAnswer: document.getElementById('correct-answer-input').value
    };

    if (!questionData.question || questionData.options.length < 2 || !questionData.correctAnswer) {
        alert("Please fill out all fields correctly.");
        return;
    }

    try {
        await addDoc(collection(db, collectionName), questionData);
        alert('Question added successfully!');
        addQuestionForm.reset();
    } catch (error) {
        console.error("Error adding question: ", error);
        alert('Error adding question. Make sure your security rules are set correctly.');
    }
});

// --- Handle Button to View All Questions ---
viewQuestionsButton.addEventListener('click', async () => {
    questionsListDiv.innerHTML = 'Loading...';
    try {
        const easySnapshot = await getDocs(collection(db, "easy_questions"));
        const mediumSnapshot = await getDocs(collection(db, "medium_questions"));
        const hardSnapshot = await getDocs(collection(db, "hard_questions"));

        let html = '<h3>Easy Questions</h3>';
        easySnapshot.forEach(doc => {
            const q = doc.data();
            html += <p>${q.question} | <button class="delete-btn" data-id="${doc.id}" data-level="easy">Delete</button></p>;
        });

        html += '<h3>Medium Questions</h3>';
        mediumSnapshot.forEach(doc => {
            const q = doc.data();
            html += <p>${q.question} | <button class="delete-btn" data-id="${doc.id}" data-level="medium">Delete</button></p>;
        });
        
        html += '<h3>Hard Questions</h3>';
        hardSnapshot.forEach(doc => {
            const q = doc.data();
            html += <p>${q.question} | <button class="delete-btn" data-id="${doc.id}" data-level="hard">Delete</button></p>;
        });

        questionsListDiv.innerHTML = html;

    } catch (error) {
        console.error("Error viewing questions: ", error);
        questionsListDiv.innerHTML = 'Failed to load questions.';
    }
});

// --- Handle Delete Button Clicks ---
questionsListDiv.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        const level = e.target.dataset.level;
        const collectionName = `${level}_questions`;

        if (confirm('Are you sure you want to delete this question?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('Question deleted!');
                viewQuestionsButton.click(); // Refresh the list
            } catch (error) {
                console.error("Error deleting question: ", error);
                alert('Error deleting question. You may not have permission.');
            }
        }
    }
});