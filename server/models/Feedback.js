import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    department: { type: String, required: true },

    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    driveDate: { type: String, required: true },

    overallExperience: { type: String, required: true },
    preparationTips: { type: String },

    rounds: [{
        name: { type: String },
        questions: { type: String }
    }],

    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
}, {
    timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
