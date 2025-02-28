const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: String,
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  author: String,
}, { timestamps: true });

module.exports = mongoose.model('Reply', replySchema);