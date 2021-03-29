var mongoose = require('mongoose');

var schema = mongoose.Schema;

var questionSchema = new schema({
  createdAt: {
    type: String,
    required: [true, "date is reqiered"]
  },
  question: {
    type: String,
    required: [true, "date is reqiered"]
  },
  answer: {
    type: String,
    required: [true, "date is reqiered"]
  },
})

var question = mongoose.model('Question', questionSchema, 'questions');

module.exports = question;