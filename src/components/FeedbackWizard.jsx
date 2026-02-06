import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Briefcase, Calendar, Layers, Check } from 'lucide-react';
import api from '../lib/api'; // MERN API

export default function FeedbackWizard({ currentUser, onClose, onSuccess, initialCompany = '', initialPackage = '' }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Changed from string to object

    const [formData, setFormData] = useState({
        // Step 1: Drive Details
        companyName: initialCompany,
        jobRole: '', // Added for MERN Schema
        salaryPackage: initialPackage,
        driveDate: '',
        driveDate: '',
        department: '', // Removed default 'CSE'
        eligibility: {
            degree: '',
            cgpa: '',
            tenthPercentage: '',
            twelfthPercentage: '',
            activeArrears: 'No',
            historyOfArrears: 'No',
            gapYears: '',
            nationality: '',
            other: ''
        },
        numberOfRounds: 3,

        // Step 2 ton N: Round Details (Dynamic)
        rounds: [], // Will be initialized based on numberOfRounds

        // Final Step: Tips & Review
        preparationTips: '',
        overallExperience: '', // Added for MERN Schema
        overallDifficulty: '' // Removed default 'Medium'
    });

    // Initialize rounds array when number of rounds changes
    const updateRoundsCount = (count) => {
        const newRounds = Array(parseInt(count)).fill(null).map((_, i) => ({
            roundType: '',
            mode: '',
            difficulty: '',
            topics: '',
            duration: '',
            experience: '',
            resources: ''
        }));

        setFormData(prev => ({
            ...prev,
            numberOfRounds: parseInt(count),
            rounds: newRounds
        }));
    };

    // Initialize rounds on first load if empty
    useEffect(() => {
        if (formData.rounds.length === 0 && formData.numberOfRounds > 0) {
            updateRoundsCount(formData.numberOfRounds);
        }
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (value) setErrors(prev => ({ ...prev, [field]: '' })); // Clear specific error
    };

    const handleRoundChange = (index, field, value) => {
        const newRounds = [...formData.rounds];
        newRounds[index] = { ...newRounds[index], [field]: value };
        setFormData(prev => ({ ...prev, rounds: newRounds }));
        if (value) setErrors(prev => ({ ...prev, [`round${index}_${field}`]: '' })); // Clear specific error
    };

    const validateStep = (currentStep) => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!formData.companyName) newErrors.companyName = "Company Name is required";
            if (!formData.jobRole) newErrors.jobRole = "Job Role is required";
            if (!formData.driveDate) newErrors.driveDate = "Drive Date is required";
            if (!formData.department) newErrors.department = "Department is required";
            if (!formData.eligibility.degree) newErrors.eligibility = "Degree is required";
            if (!formData.eligibility.cgpa) newErrors.eligibility = "CGPA is required";
        } else if (currentStep > 1 && currentStep <= 1 + formData.rounds.length) {
            const roundIndex = currentStep - 2;
            const round = formData.rounds[roundIndex];
            if (!round.roundType) newErrors[`round${roundIndex}_roundType`] = "Round Type is required";
            if (!round.mode) newErrors[`round${roundIndex}_mode`] = "Mode is required";
            if (!round.difficulty) newErrors[`round${roundIndex}_difficulty`] = "Difficulty is required";
            if (!round.topics) newErrors[`round${roundIndex}_topics`] = "Topics are required";
            if (!round.experience) newErrors[`round${roundIndex}_experience`] = "Experience details are required";
        } else if (currentStep === totalSteps) {
            if (!formData.preparationTips) newErrors.preparationTips = "Preparation Tips are required";
            if (!formData.overallExperience) newErrors.overallExperience = "Overall Experience is required";
            if (!formData.overallDifficulty) newErrors.overallDifficulty = "Overall Difficulty is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Transform data for MERN Schema
            // Schema requires: rounds: [{name, questions}], overallExperience (string)
            // We append extra data (eligibility, package, difficulty) to overallExperience to preserve it

            const extraDataSummary = `
            \n\n--- Additional Details ---
            Package: ${formData.salaryPackage}
            Difficulty: ${formData.overallDifficulty}
            Eligibility: ${JSON.stringify(formData.eligibility)}
            `;

            const mernPayload = {
                companyName: formData.companyName,
                jobRole: formData.jobRole,
                driveDate: formData.driveDate,
                department: formData.department,
                overallExperience: formData.overallExperience + extraDataSummary,
                preparationTips: formData.preparationTips,
                rounds: formData.rounds.map(r => ({
                    name: r.roundType + (r.mode ? ` (${r.mode})` : ''),
                    questions: r.experience + (r.topics ? `\n\nKey Topics: ${r.topics}` : '') + (r.resources ? `\n\nResources: ${r.resources}` : '')
                }))
            };

            await api.post('/feedback', mernPayload);
            onSuccess();
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = 2 + formData.rounds.length; // 1 (Intro) + Rounds + 1 (Review)

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                                {step}
                            </span>
                            Step {step} <span className="text-slate-400 text-lg font-normal">/ {totalSteps}</span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {step === 1 && "Drive Information"}
                            {step > 1 && step <= 1 + formData.rounds.length && `Round ${step - 1} Details`}
                            {step === totalSteps && "Final Review & Tips"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5">
                    <div
                        className="bg-indigo-600 h-1.5 transition-all duration-500 ease-out"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    ></div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* STEP 1: Drive Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.companyName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 ${initialCompany ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        placeholder="e.g. TCS"
                                        readOnly={!!initialCompany}
                                    />
                                    {errors.companyName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.companyName}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Job Role</label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.jobRole ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                        value={formData.jobRole}
                                        onChange={(e) => handleInputChange('jobRole', e.target.value)}
                                        placeholder="e.g. Software Engineer"
                                        required
                                    />
                                    {errors.jobRole && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.jobRole}</p>}
                                </div>

                                {initialPackage && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Package (LPA)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 opacity-70 cursor-not-allowed"
                                            value={formData.salaryPackage}
                                            readOnly
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Drive Date</label>
                                    <input
                                        type="date"
                                        className={`w-full border ${errors.driveDate ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                        value={formData.driveDate}
                                        onChange={(e) => handleInputChange('driveDate', e.target.value)}
                                        required
                                    />
                                    {errors.driveDate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.driveDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Department</label>
                                    <select
                                        className={`w-full border ${errors.department ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 appearance-none`}
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                    >
                                        <option value="" disabled>Select Department</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="AIDS">AIDS</option>
                                        <option value="AIML">AIML</option>
                                    </select>
                                    {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.department}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Number of Rounds</label>
                                    <select
                                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700"
                                        value={formData.numberOfRounds}
                                        onChange={(e) => updateRoundsCount(e.target.value)}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Eligibility Criteria</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">

                                        {/* Degree */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Degree</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.degree}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, degree: e.target.value } }))}
                                            >
                                                <option value="" disabled>Select Degree</option>
                                                <option value="B.E / B.Tech">B.E / B.Tech</option>
                                                <option value="MCA">MCA</option>
                                                <option value="B.E / B.Tech / MCA">B.E / B.Tech / MCA</option>
                                                <option value="Any Degree">Any Degree</option>
                                            </select>
                                        </div>

                                        {/* CGPA */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">CGPA</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.cgpa}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, cgpa: e.target.value } }))}
                                            >
                                                <option value="" disabled>Select CGPA</option>
                                                <option value="No Criteria">No Criteria</option>
                                                <option value=">= 6.0">≥ 6.0</option>
                                                <option value=">= 6.5">≥ 6.5</option>
                                                <option value=">= 7.0">≥ 7.0</option>
                                                <option value=">= 7.5">≥ 7.5</option>
                                                <option value=">= 8.0">≥ 8.0</option>
                                                <option value=">= 8.5">≥ 8.5</option>
                                            </select>
                                        </div>

                                        {/* 10th */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">10th %</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.tenthPercentage}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, tenthPercentage: e.target.value } }))}
                                            >
                                                <option value="" disabled>Select %</option>
                                                <option value="No Criteria">No Criteria</option>
                                                <option value=">= 50%">≥ 50%</option>
                                                <option value=">= 60%">≥ 60%</option>
                                                <option value=">= 70%">≥ 70%</option>
                                                <option value=">= 75%">≥ 75%</option>
                                                <option value=">= 80%">≥ 80%</option>
                                            </select>
                                        </div>

                                        {/* 12th */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">12th %</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.twelfthPercentage}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, twelfthPercentage: e.target.value } }))}
                                            >
                                                <option value="" disabled>Select %</option>
                                                <option value="No Criteria">No Criteria</option>
                                                <option value=">= 50%">≥ 50%</option>
                                                <option value=">= 60%">≥ 60%</option>
                                                <option value=">= 70%">≥ 70%</option>
                                                <option value=">= 75%">≥ 75%</option>
                                                <option value=">= 80%">≥ 80%</option>
                                            </select>
                                        </div>

                                        {/* Active Arrears */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Active Arrears</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.activeArrears}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, activeArrears: e.target.value } }))}
                                            >
                                                <option>No</option>
                                                <option>Yes</option>
                                            </select>
                                        </div>

                                        {/* History of Arrears */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">History of Arrears</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.historyOfArrears}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, historyOfArrears: e.target.value } }))}
                                            >
                                                <option>No</option>
                                                <option>Yes</option>
                                                <option>Allowed</option>
                                            </select>
                                        </div>

                                        {/* Gap Years */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Gap Years</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.gapYears}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, gapYears: e.target.value } }))}
                                            >
                                                <option value="" disabled>Gap Years</option>
                                                <option value="Not Allowed">Not Allowed</option>
                                                <option value="Up to 1 Year">Up to 1 Year</option>
                                                <option value="Up to 2 Years">Up to 2 Years</option>
                                                <option value="Any">Any</option>
                                            </select>
                                        </div>

                                        {/* Nationality */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nationality</label>

                                            <select
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                                value={formData.eligibility.nationality}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, nationality: e.target.value } }))}
                                            >
                                                <option value="" disabled>Select</option>
                                                <option value="Indian">Indian</option>
                                                <option value="Any">Any</option>
                                            </select>
                                        </div>

                                        {/* Other */}
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Other Criteria</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                                                value={formData.eligibility.other}
                                                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: { ...prev.eligibility, other: e.target.value } }))}
                                                placeholder="Any other specific requirements..."
                                            />
                                        </div>
                                    </div>
                                    {errors.eligibility && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.eligibility}</p>}
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-4 items-start">
                                <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600 mt-1">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-900 text-sm">Why this step?</h4>
                                    <p className="text-sm text-indigo-800/80 mt-1">Collecting general information first helps us categorize your feedback for juniors effectively. This information is common for all students attending the drive.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DYNAMIC STEPS: Round Details */}
                    {step > 1 && step <= 1 + formData.rounds.length && (() => {
                        const roundIndex = step - 2;
                        return (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Round Type</label>
                                        <select
                                            className={`w-full border ${errors[`round${roundIndex}_roundType`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                            value={formData.rounds[roundIndex]?.roundType}
                                            onChange={(e) => handleRoundChange(roundIndex, 'roundType', e.target.value)}
                                        >
                                            <option value="" disabled>Select Type</option>
                                            <option>Aptitude</option>
                                            <option>Technical</option>
                                            <option>Coding</option>
                                            <option>Group Discussion</option>
                                            <option>HR Interview</option>
                                            <option>Managerial</option>
                                        </select>
                                        {errors[`round${roundIndex}_roundType`] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[`round${roundIndex}_roundType`]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Mode</label>
                                        <select
                                            className={`w-full border ${errors[`round${roundIndex}_mode`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                            value={formData.rounds[roundIndex]?.mode}
                                            onChange={(e) => handleRoundChange(roundIndex, 'mode', e.target.value)}
                                        >
                                            <option value="" disabled>Select Mode</option>
                                            <option>Online</option>
                                            <option>Offline (Pen & Paper)</option>
                                            <option>Face-to-Face</option>
                                        </select>
                                        {errors[`round${roundIndex}_mode`] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[`round${roundIndex}_mode`]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Difficulty</label>
                                        <select
                                            className={`w-full border ${errors[`round${roundIndex}_difficulty`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                            value={formData.rounds[roundIndex]?.difficulty}
                                            onChange={(e) => handleRoundChange(roundIndex, 'difficulty', e.target.value)}
                                        >
                                            <option value="" disabled>Select Difficulty</option>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                        {errors[`round${roundIndex}_difficulty`] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[`round${roundIndex}_difficulty`]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Duration</label>
                                        <input
                                            type="text"
                                            className={`w-full border ${errors[`round${roundIndex}_duration`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                            value={formData.rounds[roundIndex]?.duration}
                                            onChange={(e) => handleRoundChange(roundIndex, 'duration', e.target.value)}
                                            placeholder="e.g. 45 mins"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Key Topics / Questions</label>
                                        <input
                                            type="text"
                                            className={`w-full border ${errors[`round${roundIndex}_topics`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700`}
                                            value={formData.rounds[roundIndex]?.topics}
                                            onChange={(e) => handleRoundChange(roundIndex, 'topics', e.target.value)}
                                            placeholder="e.g. Quants, Java, OOPS, specific coding questions..."
                                            required
                                        />
                                        {errors[`round${roundIndex}_topics`] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[`round${roundIndex}_topics`]}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FileText size={14} /> Round Experience (Detailed Paragraph)
                                        </label>
                                        <textarea
                                            className={`w-full border ${errors[`round${roundIndex}_experience`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 resize-none`}
                                            value={formData.rounds[roundIndex]?.experience}
                                            onChange={(e) => handleRoundChange(roundIndex, 'experience', e.target.value)}
                                            placeholder="Share your experience in detail. What happened in this round? What questions were asked? How did you solve them?"
                                            required
                                        />
                                        {errors[`round${roundIndex}_experience`] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[`round${roundIndex}_experience`]}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Layers size={14} /> Share Resources
                                        </label>
                                        <textarea
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 resize-none"
                                            value={formData.rounds[roundIndex]?.resources}
                                            onChange={(e) => handleRoundChange(roundIndex, 'resources', e.target.value)}
                                            placeholder="Paste links to study materials, drive folders, or book references relevant to this round..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex gap-4 items-start">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600 mt-1">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-teal-900 text-sm">Targeted Feedback</h4>
                                        <p className="text-sm text-teal-800/80 mt-1">Breaking down each round helps juniors prepare for specific stages of the interview process.</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}



                    {/* FINAL STEP: Review & Tips */}
                    {step === totalSteps && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preparation Tips</label>
                                    <textarea
                                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-4 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 resize-none"
                                        placeholder="What advice would you give to juniors?"
                                        value={formData.preparationTips}
                                        onChange={(e) => handleInputChange('preparationTips', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Overall Experience</label>
                                    <textarea
                                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-4 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-700 resize-none"
                                        placeholder="Summarize the entire recruitment process..."
                                        value={formData.overallExperience}
                                        onChange={(e) => handleInputChange('overallExperience', e.target.value)}
                                        required
                                    />
                                    {errors.overallExperience && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.overallExperience}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Overall Difficulty Rating</label>
                                    <div className="flex gap-4">
                                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                                            <label key={diff} className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all text-center
                                                ${formData.overallDifficulty === diff
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 font-bold'
                                                    : errors.overallDifficulty ? 'bg-red-50 border-red-300 text-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="difficulty"
                                                    className="hidden"
                                                    value={diff}
                                                    checked={formData.overallDifficulty === diff}
                                                    onChange={() => handleInputChange('overallDifficulty', diff)}
                                                />
                                                {diff}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.overallDifficulty && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.overallDifficulty}</p>}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mt-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    Review Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Company</span>
                                        <span className="font-semibold text-slate-800">{formData.companyName || 'Not specified'}</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Rounds</span>
                                        <span className="font-semibold text-slate-800">{formData.numberOfRounds}</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Department</span>
                                        <span className="font-semibold text-slate-800">{formData.department}</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Total Tips</span>
                                        <span className="font-semibold text-slate-800">{formData.preparationTips.length > 0 ? "Added" : "None"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center z-10">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step < totalSteps ? (
                        <div className="flex flex-col items-end gap-2">

                            <button
                                onClick={nextStep}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transform active:scale-95 transition flex items-center gap-2"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transform active:scale-95 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Feedback'} <Check size={18} />
                        </button>
                    )}
                </div>

            </div>
        </div >
    );
}
