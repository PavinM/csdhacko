import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { XCircle, FileText, Calendar } from "lucide-react";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [availableCompanies, setAvailableCompanies] = useState([]); // Companies open for feedback
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]); // All approved feedbacks (Global View)
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [viewFeedback, setViewFeedback] = useState(null); // Feedback object to view details

    // Form State
    const [formData, setFormData] = useState({
        companyName: '',
        jobRole: '',
        driveDate: '',
        overallExperience: '',
        preparationTips: '',
        rounds: [{ name: '', questions: '' }],
        difficulty: 'Medium'
    });

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Companies for "Give Feedback"
            // Filter: Status 'completed' AND Student Email in 'eligibleStudents'
            const companyRes = await api.get('/companies');
            const eligible = companyRes.data.filter(c =>
                c.status === 'completed' &&
                c.eligibleStudents?.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase())
            );
            setAvailableCompanies(eligible);

            // 2. Fetch All Approved Feedbacks (Global View)
            const feedbackRes = await api.get('/feedback?status=approved');
            setApprovedFeedbacks(feedbackRes.data);

        } catch (error) {
            console.error("Error fetching student dashboard data:", error);
        }
        setLoading(false);
    };

    const handleAddRound = () => {
        setFormData({ ...formData, rounds: [...formData.rounds, { name: "", questions: "" }] });
    };

    const handleRoundChange = (index, field, value) => {
        const newRounds = [...formData.rounds];
        newRounds[index][field] = value;
        setFormData({ ...formData, rounds: newRounds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/feedback', {
                ...formData,
                department: currentUser.department
            });
            alert("Feedback submitted successfully! Waiting for approval.");
            setShowFeedbackModal(false); // Changed from setShowForm to setShowFeedbackModal
            setFormData({
                companyName: '',
                jobRole: '',
                driveDate: '',
                overallExperience: '',
                preparationTips: '',
                rounds: [{ name: '', questions: '' }],
                difficulty: 'Medium'
            });
            fetchDashboardData(); // Refresh list
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback.");
        }
    };

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Profile Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-sky-500 rounded-xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                {/* Background Pattern for Banner */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide drop-shadow-sm">{currentUser?.name || "Student Name"}</h1>
                    <p className="text-blue-100 text-lg mt-2 font-light">{currentUser?.department || "Department Engineering"} Student</p>
                </div>

                <div className="relative z-10 hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white border-4 border-white/30 backdrop-blur-sm">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* 2. Main Content: Help Juniors / Pending Feedbacks */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Help Your Juniors Grow!</h2>
                                <p className="text-sm text-slate-500 font-medium">Pending feedback reviews</p>
                            </div>

                        </div>

                        <div className="space-y-4">
                            {/* 1. Eligible Drives (Give Feedback) */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Your Eligible Drives</h3>
                                {availableCompanies.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3 text-slate-300">
                                            <FileText size={24} />
                                        </div>
                                        <p className="text-slate-500 font-medium">No pending feedbacks.</p>
                                        <p className="text-xs text-slate-400">You can only give feedback for drives you attended.</p>
                                    </div>
                                ) : (
                                    availableCompanies.map(company => (
                                        <div key={company._id} className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all mb-4 relative overflow-hidden group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-indigo-900">{company.name}</h3>
                                                    <p className="text-sm text-slate-500">{company.roles}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {company.visitDate}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCompany(company);
                                                        setFormData({
                                                            ...formData,
                                                            companyName: company.name,
                                                            jobRole: company.roles,
                                                            driveDate: company.visitDate
                                                        });
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform active:scale-95"
                                                >
                                                    Give Feedback
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* 2. Global Approved Feedbacks (Read Only) */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Latest Student Experiences</h3>
                                {approvedFeedbacks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic text-sm">
                                        No experiences shared yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {approvedFeedbacks.map(fb => (
                                            <div key={fb._id} className="bg-white hover:bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm transition duration-200 group cursor-pointer"
                                                onClick={() => setViewFeedback(fb)}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-[#1A237E] text-lg">{fb.companyName}</h4>
                                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{fb.jobRole}</p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200">APPROVED</span>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                                        "{fb.overallExperience}"
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} /> {fb.driveDate}
                                                    </span>
                                                    <span className="font-bold text-indigo-600 group-hover:underline">Read Full Review →</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Feedback Details Modal */}
            {viewFeedback && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-xl text-[#1A237E]">{viewFeedback.companyName}</h3>
                                <p className="text-sm text-slate-500">{viewFeedback.jobRole} • {viewFeedback.driveDate}</p>
                            </div>
                            <button
                                onClick={() => setViewFeedback(null)}
                                className="text-slate-400 hover:text-slate-600 transition bg-white p-2 rounded-full shadow-sm hover:shadow"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            {/* Experience Section */}
                            <div>
                                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                    Overall Experience
                                </h4>
                                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                    {viewFeedback.overallExperience}
                                </div>
                            </div>

                            {/* Rounds Section */}
                            {viewFeedback.rounds && viewFeedback.rounds.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                                        Interview Rounds
                                    </h4>
                                    <div className="space-y-3">
                                        {viewFeedback.rounds.map((round, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                                <div className="font-bold text-[#1A237E] mb-1">{round.name}</div>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{round.questions}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preparation Tips Section */}
                            {viewFeedback.preparationTips && (
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                                        Preparation Tips
                                    </h4>
                                    <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                        {viewFeedback.preparationTips}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setViewFeedback(null)}
                                className="px-6 py-2 bg-[#1A237E] hover:bg-[#283593] text-white font-bold rounded-lg transition shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Form Modal (Overlay) */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in-up">
                        <button
                            onClick={() => setShowFeedbackModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 rounded-lg text-academic-blue">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Submit Feedback: {selectedCompany?.name}</h2>
                                <p className="text-xs text-gray-500">Share your experience to help juniors</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name</label>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name</label>
                                    <input type="text" className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg p-3 focus:ring-0 outline-none cursor-not-allowed"
                                        value={formData.companyName} readOnly />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Drive Date</label>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Drive Date</label>
                                    <input type="date" className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg p-3 focus:ring-0 outline-none cursor-not-allowed"
                                        value={formData.driveDate} readOnly />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Role</label>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Role</label>
                                    <input type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        value={formData.jobRole} onChange={e => setFormData({ ...formData, jobRole: e.target.value })} required placeholder="e.g. Developer" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Difficulty</label>
                                    <select className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-academic-blue uppercase tracking-wide">Interview Rounds</h3>
                                    <button type="button" onClick={handleAddRound} className="text-xs font-bold text-academic-teal hover:underline">+ Add Round</button>
                                </div>
                                <div className="space-y-4">
                                    {formData.rounds.map((round, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-1">
                                                <input type="text" placeholder="Round Name" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-academic-blue outline-none"
                                                    value={round.name} onChange={e => handleRoundChange(index, 'name', e.target.value)} required />
                                            </div>
                                            <div className="md:col-span-2">
                                                <textarea placeholder="Questions asked..." className="w-full border border-gray-200 rounded-lg p-3 text-sm h-[46px] min-h-[46px] focus:h-20 transition-all focus:border-academic-blue outline-none resize-none"
                                                    value={round.questions} onChange={e => handleRoundChange(index, 'questions', e.target.value)} required />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Overall Experience</label>
                                    <textarea className="w-full border border-gray-200 bg-gray-50 rounded-lg p-4 h-32 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        placeholder="Describe the overall process..."
                                        value={formData.overallExperience} onChange={e => setFormData({ ...formData, overallExperience: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Preparation Tips</label>
                                    <textarea className="w-full border border-gray-200 bg-gray-50 rounded-lg p-4 h-32 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        placeholder="Advice for juniors..."
                                        value={formData.preparationTips} onChange={e => setFormData({ ...formData, preparationTips: e.target.value })} required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-6 py-2.5 text-gray-500 font-semibold hover:bg-gray-50 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-academic-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
