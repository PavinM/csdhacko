import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  difficulty: String,
  mode: String,
  questions: String,
  resources: String
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    index: true
  },
  role: String,
  rounds: [roundSchema],
  overallExperience: String,
  rating: Number,
  tipsForJuniors: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
