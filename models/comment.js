const mongoose = require('mongoose')

// Schema //
const commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
  }
})

// Model //
let Comment = new mongoose.model('Comment', commentSchema)

module.exports = Comment