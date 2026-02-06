import mongoose from 'mongoose';

const companySchema = mongoose.Schema({
    name: { type: String, required: true },
    visitDate: { type: String, required: true },
    roles: { type: String, required: true },
    eligibility: { type: String },
    salaryPackage: { type: String }, // e.g. "12 LPA"
    department: { type: String, required: true }, // Which department is hosting/coordinating
    eligibleStudents: { type: [String], default: [] }, // Array of student emails
    status: { type: String, default: 'scheduled', enum: ['scheduled', 'completed', 'cancelled'] },

    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
