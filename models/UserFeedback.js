const mongoose = require('mongoose');

const UserFeedbackSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: String,
});

const UserFeedback = mongoose.model('UserFeedback', UserFeedbackSchema);

module.exports = UserFeedback;
