import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
<<<<<<< HEAD
import { Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, XCircle, FileText, CheckCircle, Calendar, Briefcase, Sparkles, Share2 } from "lucide-react";
import FeedbackWizard from "./FeedbackWizard";
=======
import { XCircle, FileText, Calendar } from "lucide-react";
>>>>>>> 809686e003f0875465da8dad87b80b6fbd38f8b7

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [availableCompanies, setAvailableCompanies] = useState([]); // Companies open for feedback
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]); // All approved feedbacks (Global View)
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'feedback' | 'resource' | null
    const [selectedCompany, setSelectedCompany] = useState("");
    const [tempCompanyDetails, setTempCompanyDetails] = useState({ name: '', package: '' });

    // Mock Data from HTML
    const AVAILABLE_COMPANIES = [
        { name: "Accenture", package: "₹ 9.2 LPA", initial: "A" },
        { name: "TCS", package: "₹ 7.5 LPA", initial: "T" },
        { name: "Infosys", package: "₹ 8.0 LPA", initial: "I" },
        { name: "Wipro", package: "₹ 7.8 LPA", initial: "W" },
        { name: "Cognizant", package: "₹ 8.5 LPA", initial: "C" },
        { name: "HCL Technologies", package: "₹ 7.2 LPA", initial: "H" }
    ];

    const handleCompanyClick = (companyName = "") => {
        setSelectedCompany(companyName);
        setTempCompanyDetails({ name: '', package: '' }); // Reset temp details for existing companies
        setActiveModal('feedback');
    };

    const handleOpenOffCampus = () => {
        setTempCompanyDetails({ name: '', package: '' });
        setActiveModal('off-campus-entry');
    };

    const handleOffCampusSubmit = (e) => {
        e.preventDefault();
        if (tempCompanyDetails.name && tempCompanyDetails.package) {
            setSelectedCompany(tempCompanyDetails.name);
            setActiveModal('feedback');
        }
    };

    const handleOpenResource = (e, companyName = "") => {
        e.stopPropagation();
        setSelectedCompany(companyName);
        setActiveModal('resource');
    };

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



<<<<<<< HEAD
=======
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
>>>>>>> 809686e003f0875465da8dad87b80b6fbd38f8b7

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Dashboard Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Help Your Juniors Grow!</h1>
                <p className="text-orange-500 font-medium mt-1">Pending Feedbacks</p>
            </div>

            {/* 2. Profile Section */}
            <div className="bg-gradient-to-br from-[#1A237E] to-[#283593] rounded-2xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden mb-10">
                {/* Background Pattern */}
                <div className="absolute -top-1/2 -right-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(139,195,74,0.1)_0%,transparent_70%)] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-2">{currentUser?.name || "Student Name"}</h2>
                    <p className="text-white/80 text-lg italic">{currentUser?.department || "Department"} Student</p>
                </div>

                <div className="relative z-10 hidden md:flex w-[100px] h-[100px] rounded-full bg-white items-center justify-center text-4xl shadow-lg border-4 border-white/30">
                    👤
                </div>
            </div>

<<<<<<< HEAD
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Left Column: Help Juniors / Pending Feedbacks */}
                {/* 3. Main Grid Content: Companies List */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Companies Open for Feedback</h3>
                        <button
                            onClick={handleOpenOffCampus}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 ml-auto"
                        >
                            <Plus size={18} /> Add Off-Campus
                        </button>
                    </div>

                    {/* Companies List - Vertical Stack */}
                    <div className="flex flex-col gap-4">
                        {AVAILABLE_COMPANIES.map((company, index) => {
                            // Check if feedback already exists for this company
                            const submittedFeedback = feedbacks.find(f => f.companyName.toLowerCase() === company.name.toLowerCase());
                            const status = submittedFeedback ? submittedFeedback.status : 'Pending Feedback';

                            const statusText = submittedFeedback ? (status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected') : "Pending Feedback";
                            const statusColor = submittedFeedback ? (status === 'approved' ? 'text-green-700 bg-green-100' : status === 'pending' ? 'text-amber-700 bg-amber-100' : 'text-red-500 bg-red-50') : "text-orange-500 bg-orange-50";

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleCompanyClick(company.name)}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-white hover:shadow-md border border-transparent hover:border-sky-200 transition-all duration-300 cursor-pointer flex items-center justify-between group"
                                >
                                    {/* Left Side: Name & Package */}
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-blue transition-colors truncate">
                                            {company.name}
                                        </h3>
                                        <p className="text-sm font-semibold text-slate-400">
                                            {company.package}
                                        </p>
                                    </div>

                                    {/* Right Side: Arrow Button */}
                                    <div className="flex items-center gap-3 shrink-0">

                                        <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full ${statusColor} whitespace-nowrap hidden sm:inline-block`}>
                                            {statusText}
                                        </span>

                                        <div className="w-10 h-10 rounded-full bg-white text-primary-blue shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
                                            <ChevronRight size={20} strokeWidth={3} className="ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Right Sidebar (Stats) */}
                <div className="space-y-6">
                    {/* Stats Widget Panel */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">My Activity</h3>
                        <div className="space-y-4">
                            {/* Total - Row Style */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                                <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-800">{AVAILABLE_COMPANIES.length}</h4>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Companies</p>
                                </div>
                            </div>

                            {/* Pending - Row Style */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-800">{Math.max(0, AVAILABLE_COMPANIES.length - feedbacks.length)}</h4>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
                                </div>
                            </div>

                            {/* Completed - Row Style */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-green-50/50 border border-green-100">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-800">{feedbacks.length}</h4>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

            </div>

            {/* Modals */}
            {activeModal === 'off-campus-entry' && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
=======
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

            {/* Submission Form Modal (Overlay) */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in-up">
                        <button
                            onClick={() => setShowFeedbackModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
>>>>>>> 809686e003f0875465da8dad87b80b6fbd38f8b7
                        >
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-slate-800 mb-1">Off-Campus Details</h2>
                        <p className="text-slate-500 text-sm mb-6">Enter company and package information</p>

                        <form onSubmit={handleOffCampusSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="e.g. Google"
                                    value={tempCompanyDetails.name}
                                    onChange={(e) => setTempCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
<<<<<<< HEAD
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Package (LPA)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="e.g. 12 LPA"
                                    value={tempCompanyDetails.package}
                                    onChange={(e) => setTempCompanyDetails(prev => ({ ...prev, package: e.target.value }))}
                                />
=======
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
>>>>>>> 809686e003f0875465da8dad87b80b6fbd38f8b7
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 mt-4"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}



            {activeModal === 'feedback' && (
                <FeedbackWizard
                    currentUser={currentUser}
                    initialCompany={selectedCompany}
                    initialPackage={tempCompanyDetails.package}
                    onClose={() => setActiveModal(null)}
                    onSuccess={() => {
                        setActiveModal(null);
                        fetchFeedbacks();
                    }}
                />
            )}


        </div>
    );
}
