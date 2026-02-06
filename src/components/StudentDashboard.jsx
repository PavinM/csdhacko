import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, XCircle, FileText, CheckCircle, Calendar, Briefcase, Sparkles, Share2 } from "lucide-react";
import FeedbackWizard from "./FeedbackWizard";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
            fetchFeedbacks();
        }
    }, [currentUser]);

    const fetchFeedbacks = async () => {
        try {
            // Fetch ALL approved feedbacks for the student to read
            const { data } = await api.get('/feedback?status=approved');
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        }
        setLoading(false);
    };




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
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Package (LPA)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="e.g. 12 LPA"
                                    value={tempCompanyDetails.package}
                                    onChange={(e) => setTempCompanyDetails(prev => ({ ...prev, package: e.target.value }))}
                                />
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
