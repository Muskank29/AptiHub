const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
require('dotenv').config(); // load .env variables
// const db = require('./init/firebase'); // Firestore instance
const cors = require('cors');
const admin = require("firebase-admin");
// const serviceAccount = require("./init/serviceAccountKey.json");
const serviceAccount = require("./init/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 8080;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");
app.use(cors()); // allow requests from mobile app

// ===== Session Middleware =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || "aptiHubSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// ===== Test Firebase Connection =====
app.get("/test-firebase", async (req, res) => {
  try {
    const snapshot = await db.collection('users').limit(1).get();
    if (snapshot.empty) {
      return res.send("Firestore connected! But no users yet.");
    }
    const user = snapshot.docs[0].data();
    res.send("Firestore connected! First user: " + JSON.stringify(user));
  } catch (err) {
    console.error(err);
    res.send("Firestore connection failed: " + err.message);
  }
});

// ===== Home Page =====
app.get("/", (req, res) => {
  res.render("index", { title: "AptiHub" });
});

// ===== User Routes =====
app.get("/user/signup", (req, res) => res.render("userSignup"));

app.post("/user/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.send("Email and password required.");

  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.send("Email already registered. <a href='/user/signup'>Try Again</a>");
    }

    await db.collection('users').add({ email, password });
    res.send("Sign up successful! <a href='/user/login'>Login Now</a>");
  } catch (err) {
    console.log(err);
    res.send("Error occurred. <a href='/user/signup'>Try Again</a>");
  }
});

app.get("/user/login", (req, res) => res.render("userLogin"));

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.send("Email and password required.");

  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.send("Invalid credentials. <a href='/user/login'>Try Again</a>");
    }

    const userDoc = snapshot.docs[0].data();
    if (userDoc.password !== password) {
      return res.send("Invalid credentials. <a href='/user/login'>Try Again</a>");
    }

    req.session.userId = snapshot.docs[0].id; // store Firestore doc ID
    res.redirect("/topics");
  } catch (err) {
    console.log(err);
    res.send("Error occurred. <a href='/user/login'>Try Again</a>");
  }
});


// ===== Admin Routes =====
app.get("/admin/login", (req, res) => res.render("adminLogin"));

app.post("/admin/login", async (req, res) => {
  let { email, password } = req.body;
  email = email.trim().toLowerCase();

  try {
    // 🔹 Get the Firebase user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    // 🔹 Fetch admin document by UID (admins/{uid})
    const adminDoc = await db.collection("admins").doc(uid).get();

    if (!adminDoc.exists) {
      return res.send(
        "Access denied. You are not registered as an admin. <a href='/admin/login'>Try Again</a>"
      );
    }

    const adminData = adminDoc.data();

    // 🔹 Verify isAdmin flag
    if (!adminData.isAdmin) {
      return res.send(
        "Access denied. You do not have admin privileges. <a href='/admin/login'>Try Again</a>"
      );
    }

    // 🔹 Check password using Firebase Auth REST API
    const fetch = (await import("node-fetch")).default;
    const firebaseConfig = {
      apiKey: "AIzaSyDLF_JF9FtOBxW8TlpWYkKx3coM85QmX1U", // ⚠ Replace with your actual Firebase Web API key
    };

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.send(
        "Invalid email or password. <a href='/admin/login'>Try Again</a>"
      );
    }

    // ✅ Login successful — store UID in session
    req.session.adminId = uid;
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.send("Error logging in. <a href='/admin/login'>Try Again</a>");
  }
});

// ===== Admin Middleware =====
function isAdminLoggedIn(req, res, next) {
  if (req.session.adminId) return next();
  res.redirect("/admin/login");
}

// ===== Admin Pages =====
app.get("/admin/dashboard", isAdminLoggedIn, (req, res) =>
  res.render("adminDashboard")
);
app.get("/admin/logout", (req, res) =>
  req.session.destroy(() => res.redirect("/admin/login"))
);
// ===== Admin: Add Question =====
app.get("/admin/add-question", isAdminLoggedIn, (req, res) => {
  res.render("addQuestion", { title: "Add Question" });
});

app.post("/admin/add-question", isAdminLoggedIn, async (req, res) => {
  const { question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, topic } = req.body;

  try {
    if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !difficulty || !topic) {
      return res.send("All fields are required. <a href='/admin/add-question'>Try Again</a>");
    }

    // Select collection based on difficulty
    let collectionName;
    switch (difficulty.toLowerCase()) {
      case "easy":
        collectionName = "easy_questions";
        break;
      case "medium":
        collectionName = "medium_questions";
        break;
      case "hard":
        collectionName = "hard_questions";
        break;
      default:
        return res.send("Invalid difficulty level. <a href='/admin/add-question'>Try Again</a>");
    }

    // Add question to Firestore
    await db.collection(collectionName).add({
      question,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer,
      topic: topic.trim().toLowerCase()
    });

    res.send(`Question added to ${difficulty} collection successfully! <a href='/admin/add-question'>Add Another</a>`);
  } catch (err) {
    console.error("Error adding question:", err);
    res.send("Error adding question. <a href='/admin/add-question'>Try Again</a>");
  }
});

app.get("/admin/view-questions", isAdminLoggedIn, async (req, res) => {
  try {
    const collections = ["easy_questions", "medium_questions", "hard_questions"];
    const allQuestions = [];

    for (const col of collections) {
      const snapshot = await db.collection(col).get();
      snapshot.forEach(doc => {
        allQuestions.push({
          id: doc.id,
          ...doc.data(),
          difficulty: col.replace("_questions", "")
        });
      });
    }

    res.render("viewQuestion", { allQuestions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.send("Error fetching questions.");
  }
});

app.get("/admin/delete-question/:id", isAdminLoggedIn, async (req, res) => {
  try {
    await db.collection("questions").doc(req.params.id).delete();
    res.redirect("/admin/view-questions");
  } catch (err) {
    console.error(err);
    res.send("Error deleting question.");
  }
});


// ===== Show Topics =====
app.get("/topics", async (req, res) => {
  try {
    // Fetch topics from easy_questions collection
    const snapshot = await db.collection("easy_questions").get();

    // Extract unique topics
    const topics = [...new Set(snapshot.docs.map(doc => doc.data().topic))];

    res.render("topic", {
      topics,
      title: "Select Topic"
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching topics.");
  }
});


// ===== Show Difficulty Options =====
app.get("/difficulty/:topic", (req, res) => {
  const topic = req.params.topic;

  res.render("difficulty", {
    topic,
    difficulties: ["Easy", "Medium", "Hard"], // list of difficulties
    title: `Select Difficulty for ${topic}`
  });
});


// ===== Show Quiz Questions =====
app.get("/quiz/:topic/:difficulty", async (req, res) => {
  const { topic, difficulty } = req.params;

  try {
    let collectionName;

    if (difficulty === "Easy") collectionName = "easy_questions";
    else if (difficulty === "Medium") collectionName = "medium_questions";
    else if (difficulty === "Hard") collectionName = "hard_questions";
    else return res.send("Invalid difficulty selected.");

    const snapshot = await db.collection(collectionName)
      .where("topic", "==", topic)
      .get();

    const allQuestions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (!allQuestions.length)
      return res.send("No questions found for this topic and difficulty.");

    res.render("question", {
      topic,
      difficulty,
      allQuestions,
      title: `${topic} - ${difficulty} Quiz`
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching quiz questions.");
  }
});

// ===== User: Delete Account Page =====
app.get("/user/delete-account", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/user/login");
  }
  res.render("deleteAccount");
});


// ===== User: Submit Delete Account Request (Password + Reason) =====
app.post("/user/delete-account", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/user/login");
  }

  const userId = req.session.userId;
  const { password, reason } = req.body;

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    // check password
    if (userDoc.data().password !== password) {
      return res.send("Wrong password. <a href='/user/delete-account'>Try again</a>");
    }

    // store request
    await db.collection("deleteRequests").add({
      userId: userId,
      email: userDoc.data().email,
      reason: reason,
      createdAt: new Date()
    });

    res.send("Delete account request submitted successfully.");
  } catch (err) {
    console.error(err);
    res.send("Error submitting delete request.");
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
