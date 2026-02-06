import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { XCircle, FileText, Calendar, Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, CheckCircle, Briefcase, Sparkles, Share2 } from "lucide-react";
import FeedbackWizard from "./FeedbackWizard";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [availableCompanies, setAvailableCompanies] = useState([]); // Companies open for feedback
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]); // All approved feedbacks (Global View)
    const [loading, setLoading] = useState(true);

    // Modal State (Keep Local Wizard Logic)
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

    const handleGiveFeedback = (company) => {
        setSelectedCompany(company.name); // Wizard expects string name? Or object? 
        // Local Wizard prop: initialCompany={selectedCompany} 
        // In local logic: setSelectedCompany(companyName) (String).
        // So passing company.name is correct.
        setActiveModal('feedback');
    };

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Profile Banner (From Remote) */}
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
                {/* 2. Main Content: Help Juniors / Pending Feedbacks (From Remote) */}
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
                                            <div key={fb._id} className="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-100 transition duration-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-700">{fb.companyName}</h4>
                                                        <span className="text-xs text-slate-500">{fb.jobRole}</span>
                                                    </div>
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">APPROVED</span>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2 italic">"{fb.overallExperience}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wizard Modal (Local Feature) */}
            {activeModal === 'feedback' && (
                <FeedbackWizard
                    currentUser={currentUser}
                    initialCompany={selectedCompany}
                    // initialPackage passed if needed, but not in remote data model simple generic
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
