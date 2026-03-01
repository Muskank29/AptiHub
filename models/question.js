// models/question.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 },
});

module.exports = mongoose.model("Question", questionSchema);
