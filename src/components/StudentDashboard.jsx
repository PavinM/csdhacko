import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { XCircle, FileText, Calendar, Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, CheckCircle, Briefcase, Sparkles, Share2, UserCheck } from "lucide-react";
import FeedbackWizard from "./FeedbackWizard";
import ProfileModal from "./ProfileModal";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [upcomingDrives, setUpcomingDrives] = useState([]);
    const [ongoingDrives, setOngoingDrives] = useState([]);
    const [completedDrives, setCompletedDrives] = useState([]);
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]); // All approved feedbacks (Global View)
    const [mySubmissions, setMySubmissions] = useState([]); // Student's own submissions (all statuses)
    const [loading, setLoading] = useState(true);
    const [viewFeedback, setViewFeedback] = useState(null); // Local: Feedback object to view details

    // Modal State (From Remote: Wizard Logic)
    const [activeModal, setActiveModal] = useState(null); // 'feedback' | null
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Companies for "Availability"
            const companyRes = await api.get('/companies');

            // Helper function to check strict eligibility
            const isStudentEligible = (c) => {
                // 1. Whitelist Check (Manual Override)
                const eligibilityList = c.eligibleStudents?.map(e => e.toLowerCase().trim().replace(/\.\./g, '.')) || [];
                const userEmail = currentUser.email.toLowerCase().trim().replace(/\.\./g, '.');
                const userRollNo = currentUser.rollNo ? currentUser.rollNo.toLowerCase().trim() : "";
                const isWhitelisted = eligibilityList.includes(userEmail) || (userRollNo && eligibilityList.includes(userRollNo));

                // 2. Dynamic Criteria Check (Domain + Marks)
                let meetsCriteria = true;

                // Domain Check
                if (c.domain && c.domain !== 'Both') {
                    if (c.domain !== currentUser.domain) meetsCriteria = false;
                }

                // Marks Check (Strict)
                const sCGPA = parseFloat(currentUser.cgpa || 0);
                const s10th = parseFloat(currentUser.tenthMark || 0);
                const s12th = parseFloat(currentUser.twelfthMark || 0);

                if (c.eligibility) {
                    if (c.eligibility.cgpaMin && sCGPA < parseFloat(c.eligibility.cgpaMin)) meetsCriteria = false;
                    if (c.eligibility.tenthMin && s10th < parseFloat(c.eligibility.tenthMin)) meetsCriteria = false;
                    if (c.eligibility.twelfthMin && s12th < parseFloat(c.eligibility.twelfthMin)) meetsCriteria = false;
                }

                // Return true if EITHER whitelisted OR meets criteria
                return isWhitelisted || meetsCriteria;
            };

            // Categorize Drives
            const upcoming = [];
            const ongoing = [];
            const completed = [];
            const today = new Date().toISOString().split('T')[0];

            companyRes.data.forEach(c => {
                if (!isStudentEligible(c)) return; // Strictly filter out ineligible drives

                if (c.status === 'completed') {
                    completed.push(c);
                } else if (c.status === 'scheduled') {
                    if (c.visitDate > today) {
                        upcoming.push(c);
                    } else {
                        // Scheduled but date is today or past (and not marked completed) -> Ongoing
                        ongoing.push(c);
                    }
                } else if (!c.status || c.status === 'ongoing') {
                    // Fallback or explicit ongoing
                    ongoing.push(c);
                }
            });

            setUpcomingDrives(upcoming);
            setOngoingDrives(ongoing);
            setCompletedDrives(completed);

            // 2. Fetch All Approved Feedbacks (Global View)
            const feedbackRes = await api.get('/feedback?status=approved');
            setApprovedFeedbacks(feedbackRes.data);

            // 3. Fetch Student's Own Submissions (to track status)
            const mySubmissionsRes = await api.get('/feedback/my-submissions');
            setMySubmissions(mySubmissionsRes.data);

        } catch (error) {
            console.error("Error fetching student dashboard data:", error);
        }
        setLoading(false);
    };

    // Helper: Check if student has submitted feedback for a company
    const getSubmissionStatus = (companyName) => {
        const submission = mySubmissions.find(sub => sub.companyName === companyName);
        return submission || null;
    };

    const handleGiveFeedback = (company) => {
        setSelectedCompany(company); // Pass full company object with visitDate, roles, etc.
        setActiveModal('feedback');
    };

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6 pb-10">

            {/* 1. Profile Banner */}
            <div onClick={() => setShowProfileModal(true)} className="bg-gradient-to-r from-indigo-900 to-sky-500 rounded-xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01]">
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

            {/* PLACEMENT SUCCESS BANNER */}
            {currentUser?.isPlaced && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl p-1 shadow-lg animate-fade-in-up">
                    <div className="bg-white rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Congratulations! 🎉</h2>
                                <p className="text-slate-600">
                                    You have been placed at <span className="font-bold text-emerald-700 text-lg">{currentUser.placedCompany}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGiveFeedback({ name: currentUser.placedCompany })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <FileText size={20} /> Share Interview Experience
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* 2. Main Content: Help Juniors / Pending Feedbacks */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Help Your Juniors Grow!</h2>
                                <p className="text-sm text-slate-500 font-medium">Available Opportunities & Feedback</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-8">
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-8 text-center">
                                    <div className="inline-flex p-4 bg-white rounded-full shadow-md mb-4 text-indigo-600">
                                        <Briefcase size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-indigo-900 mb-2">My Placement Drives</h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        View and manage all your eligible placement opportunities. Check ongoing drives, upcoming schedules, and provide feedback for completed interviews.
                                    </p>

                                    <div className="flex justify-center gap-4 text-sm font-bold text-slate-500 mb-6">
                                        <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm w-24">
                                            <span className="text-emerald-500 text-xl">{ongoingDrives.length}</span>
                                            <span>Ongoing</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm w-24">
                                            <span className="text-blue-500 text-xl">{upcomingDrives.length}</span>
                                            <span>Upcoming</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm w-24">
                                            <span className="text-purple-500 text-xl">{completedDrives.length}</span>
                                            <span>Completed</span>
                                        </div>
                                    </div>

                                    <Link to="/drives" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform hover:scale-105 active:scale-95">
                                        View All Drives <ChevronRight size={20} />
                                    </Link>
                                </div>
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
            </div >

            {/* Feedback Details Modal (Local Feature) */}
            {
                viewFeedback && (
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
                )
            }

            {/* Wizard Modal (Remote Feature - Replacing Local Inline Form) */}
            {
                activeModal === 'feedback' && (
                    <FeedbackWizard
                        currentUser={currentUser}
                        initialCompany={selectedCompany}
                        onClose={() => setActiveModal(null)}
                        onSuccess={() => {
                            setActiveModal(null);
                            fetchDashboardData();
                        }}
                    />
                )
            }

            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileModal
                    currentUser={currentUser}
                    onClose={() => setShowProfileModal(false)}
                />
            )}
        </div >
    );
}
