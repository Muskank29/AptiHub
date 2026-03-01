// models/topic.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const Topic = mongoose.model("Topic", topicSchema);
module.exports = Topic;
