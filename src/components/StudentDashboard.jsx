import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { XCircle, FileText, Calendar, Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, CheckCircle, Briefcase, Sparkles, Share2, UserCheck } from "lucide-react";
import FeedbackWizard from "./FeedbackWizard";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [availableCompanies, setAvailableCompanies] = useState([]); // Companies open for feedback
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]); // All approved feedbacks (Global View)
    const [loading, setLoading] = useState(true);
    const [viewFeedback, setViewFeedback] = useState(null); // Local: Feedback object to view details

    // Modal State (From Remote: Wizard Logic)
    const [activeModal, setActiveModal] = useState(null); // 'feedback' | null
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Companies for "Give Feedback"
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

    const handleGiveFeedback = (company) => {
        setSelectedCompany(company.name);
        setActiveModal('feedback');
    };

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6 pb-10">

            {/* 1. Profile Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-sky-500 rounded-xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide drop-shadow-sm">{currentUser?.name || "Student Name"}</h1>
                    <div className="flex items-center gap-3 text-blue-100 mt-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm border border-white/10">
                            {currentUser?.department || "Dept"}
                        </span>
                        {currentUser?.domain && (
                            <span className="bg-emerald-500/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm border border-emerald-400/30 text-emerald-100 flex items-center gap-1">
                                <Sparkles size={12} /> {currentUser.domain}
                            </span>
                        )}
                    </div>
                </div>
                <div className="relative z-10 hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white border-4 border-white/30 backdrop-blur-sm">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. Academic Details - Read Only */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-600" />
                    Academic Profile
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">10th %</p>
                        <p className="text-2xl font-extrabold text-blue-900">{currentUser?.tenthMark || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <p className="text-xs font-bold text-purple-600 uppercase mb-1">12th %</p>
                        <p className="text-2xl font-extrabold text-purple-900">{currentUser?.twelfthMark || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Current CGPA</p>
                        <p className="text-2xl font-extrabold text-emerald-900">{currentUser?.cgpa || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                        <p className="text-xs font-bold text-amber-600 uppercase mb-1">Domain</p>
                        <p className="text-lg font-extrabold text-amber-900">{currentUser?.domain || 'Not Assigned'}</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 italic">
                    <span className="font-bold">Note:</span> These details are managed by Admin. Contact your placement coordinator for any updates.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* 2. Main Content */}
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
                                                    onClick={() => handleGiveFeedback(company)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform active:scale-95"
                                                >
                                                    Give Feedback
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* 2. Global Approved Feedbacks (Read Only - Local Improved UI) */}
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

            {/* Feedback Details Modal (Local Feature) */}
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

            {/* Wizard Modal (Remote Feature - Replacing Local Inline Form) */}
            {activeModal === 'feedback' && (
                <FeedbackWizard
                    currentUser={currentUser}
                    initialCompany={selectedCompany}
                    onClose={() => setActiveModal(null)}
                    onSuccess={() => {
                        setActiveModal(null);
                        fetchDashboardData();
                    }}
                />
            )}
        </div>
    );
}

