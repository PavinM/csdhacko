import mongoose from 'mongoose';

const companySchema = mongoose.Schema({
    name: { type: String, required: true },
    visitDate: { type: String, required: true },
    domain: {
        type: String,
        required: true,
        enum: ['Hardware', 'Software', 'Both']
    },
    roles: {
        type: [String],
        default: []
    },
    salaryPackage: {
        min: { type: Number },
        max: { type: Number }
    },
    eligibility: {
        cgpaMin: { type: Number },
        cgpaMax: { type: Number },
        tenthMin: { type: Number },
        twelfthMin: { type: Number }
    },
    eligibleStudents: { type: [String], default: [] },
    status: {
        type: String,
        default: 'scheduled',
        enum: ['scheduled', 'completed', 'cancelled']
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
