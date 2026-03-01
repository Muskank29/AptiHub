// models/difficulty.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const difficultySchema = new Schema({
  level: {
    type: String,
    required: true,
    unique: true
  }
});

const Difficulty = mongoose.model("Difficulty", difficultySchema);
module.exports = Difficulty;
