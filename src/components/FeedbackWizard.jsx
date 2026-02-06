import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Send, Star, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const FeedbackWizard = ({ companyName, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        companyName: companyName || "",
        rounds: [
            { roundName: "Aptitude", description: "", difficulty: "Medium" }
        ],
        overallExperience: "",
        rating: 5,
        status: "selected" // selected, rejected, waitlisted
    });

    useEffect(() => {
        if (companyName) {
            setFormData(prev => ({ ...prev, companyName }));
        }
    }, [companyName]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoundChange = (index, field, value) => {
        const newRounds = [...formData.rounds];
        newRounds[index][field] = value;
        setFormData(prev => ({ ...prev, rounds: newRounds }));
    };

    const addRound = () => {
        setFormData(prev => ({
            ...prev,
            rounds: [...prev.rounds, { roundName: "", description: "", difficulty: "Medium" }]
        }));
    };

    const removeRound = (index) => {
        setFormData(prev => ({
            ...prev,
            rounds: prev.rounds.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/feedback', {
                ...formData,
                studentId: currentUser._id,
                studentName: currentUser.name,
                department: currentUser.department
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit feedback");
            setLoading(false);
        }
    };

    // Steps rendering
    const renderStep1_Identity = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Step 1: Confirm Identity</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p><strong>Name:</strong> {currentUser?.name}</p>
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Department:</strong> {currentUser?.department}</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                    type="text"
                    value={formData.companyName}
                    disabled
                    className="w-full p-2 border border-slate-300 rounded bg-gray-100"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Placement Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="waitlisted">Waitlisted</option>
                </select>
            </div>
        </div>
    );

    const renderStep2_Rounds = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Step 2: Interview Rounds</h3>
                <button
                    onClick={addRound}
                    className="text-sm text-blue-600 font-medium hover:underline"
                >
                    + Add Round
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                {formData.rounds.map((round, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                        {formData.rounds.length > 1 && (
                            <button
                                onClick={() => removeRound(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                placeholder="Round Name (e.g., Technical)"
                                value={round.roundName}
                                onChange={(e) => handleRoundChange(index, 'roundName', e.target.value)}
                                className="p-2 border border-slate-300 rounded text-sm"
                            />
                            <select
                                value={round.difficulty}
                                onChange={(e) => handleRoundChange(index, 'difficulty', e.target.value)}
                                className="p-2 border border-slate-300 rounded text-sm"
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Describe what happened..."
                            value={round.description}
                            onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm h-20"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep3_Review = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Step 3: Overall Experience</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Your Experience</label>
                <textarea
                    value={formData.overallExperience}
                    onChange={(e) => handleInputChange('overallExperience', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded h-24 focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your thoughts about the process..."
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => handleInputChange('rating', star)}
                            className={`p-1 rounded-full transition ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            <Star size={24} fill="currentColor" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Share Interview Experience</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {step === 1 && renderStep1_Identity()}
                    {step === 2 && renderStep2_Rounds()}
                    {step === 3 && renderStep3_Review()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 flex items-center gap-1"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-1 shadow-sm"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Feedback"} <Send size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackWizard;
