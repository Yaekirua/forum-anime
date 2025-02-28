const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  author: String,
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);