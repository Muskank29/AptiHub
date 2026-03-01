// const express = require("express");
// const router = express.Router();
// const Question = require("../models/question");
// const Admin = require("../models/admin");

// // Middleware to check login
// function isLoggedIn(req, res, next) {
//   if (req.session && req.session.adminId) return next();
//   res.redirect("/admin/login");
// }

// // Login page
// router.get("/login", (req, res) => {
//   res.render("adminLogin");
// });

// // Login POST
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   const admin = await Admin.findOne({ username, password }); // simple check
//   if (admin) {
//     req.session.adminId = admin._id;
//     res.redirect("/admin/dashboard");
//   } else {
//     res.send("Invalid username or password");
//   }
// });

// // Logout
// router.get("/logout", (req, res) => {
//   req.session.destroy();
//   res.redirect("/admin/login");
// });

// // Dashboard
// router.get("/dashboard", isLoggedIn, async (req, res) => {
//   const allQuestions = await Question.find({}).lean();
//   res.render("adminDashboard", { allQuestions });
// });

// // Add question
// router.post("/add-question", isLoggedIn, async (req, res) => {
//   const { topic, difficulty, question, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;
//   await Question.create({
//     topic,
//     difficulty,
//     question,
//     options: { A: optionA, B: optionB, C: optionC, D: optionD },
//     correctAnswer,
//     marks: parseInt(marks)
//   });
//   res.redirect("/admin/dashboard");
// });

// // Edit question
// router.get("/edit-question/:id", isLoggedIn, async (req, res) => {
//   const q = await Question.findById(req.params.id).lean();
//   if (!q) return res.send("Question not found");
//   res.render("editQuestion", { q });
// });

// router.post("/edit-question/:id", isLoggedIn, async (req, res) => {
//   const { topic, difficulty, question, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;
//   await Question.findByIdAndUpdate(req.params.id, {
//     topic, difficulty, question,
//     options: { A: optionA, B: optionB, C: optionC, D: optionD },
//     correctAnswer,
//     marks: parseInt(marks)
//   });
//   res.redirect("/admin/dashboard");
// });

// // Delete question
// router.get("/delete-question/:id", isLoggedIn, async (req, res) => {
//   await Question.findByIdAndDelete(req.params.id);
//   res.redirect("/admin/dashboard");
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const session = require("express-session");

// Show admin login page
router.get("/login", (req,res)=>res.render("adminLogin", { title: "Admin Login", layout: false}));

// Handle admin login (example hardcoded, can use DB)
router.post("/login", (req,res)=>{
  const { username, password } = req.body;
  if(username==="admin" && password==="admin123"){  // replace with real DB later
    req.session.adminId = "admin123";
    res.redirect("/admin/dashboard");
  } else {
    res.send("Invalid credentials. <a href='/admin/login'>Try Again</a>");
  }
});

// Middleware
function isAdminLoggedIn(req,res,next){
  if(req.session.adminId) return next();
  res.redirect("/admin/login");
}

// Dashboard
router.get("/dashboard", isAdminLoggedIn, (req,res)=>res.render("adminDashboard", { title: "Admin Dashboard" }));

// Logout
router.get("/logout", (req,res)=>{
  req.session.destroy(()=>res.redirect("/admin/login"));
});

// Add/Edit/View questions handled via Firestore client-side
router.get("/add-question", isAdminLoggedIn, (req,res)=>res.render("addQuestion", { title: "Add Question" }));
router.get("/edit-question", isAdminLoggedIn, (req,res)=>res.render("editQuestion", { title: "Edit Question" }));
router.get("/view-questions", isAdminLoggedIn, (req,res)=>res.render("viewQuestion", { title: "All Questions" }));

module.exports = router;

