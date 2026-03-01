// routes/api/questions.js

const express = require('express');
const router = express.Router();
const Question = require('../../models/question'); // your Question model

// ------------------------------------
// GET all questions
// ------------------------------------
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions); // return all questions
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// GET single question by ID
// ------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// CREATE new question (admin)
// ------------------------------------
router.post('/', async (req, res) => {
  try {
    const { title, options, correctAnswer, difficulty, marks } = req.body;

    if (!title || !options || !correctAnswer) {
      return res.status(400).json({ error: 'Title, options, and correctAnswer are required' });
    }

    const newQuestion = new Question({
      title,
      options,
      correctAnswer,
      difficulty,
      marks
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// UPDATE question by ID (admin)
// ------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated document
    );

    if (!updatedQuestion) return res.status(404).json({ error: 'Question not found' });
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// DELETE question by ID (admin)
// ------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
