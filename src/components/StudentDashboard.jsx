import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { Plus, ChevronRight, BarChart2, BookOpen, ExternalLink, XCircle, FileText } from "lucide-react";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
            setShowForm(false);
            setFormData({
                companyName: '',
                jobRole: '',
                driveDate: '',
                overallExperience: '',
                preparationTips: '',
                rounds: [{ name: '', questions: '' }],
                difficulty: 'Medium'
            });
            fetchFeedbacks(); // Refresh list
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Left Column: Help Juniors / Pending Feedbacks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Help Your Juniors Grow!</h2>
                                <p className="text-sm text-slate-500 font-medium">Pending feedback reviews</p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                            >
                                <Plus size={18} /> Add New
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* List Pending/Approved Feedbacks from State */}
                            {feedbacks.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="inline-flex p-4 bg-white rounded-full shadow-sm mb-3 text-slate-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-slate-500 font-medium">No feedbacks submitted yet.</p>
                                    <button onClick={() => setShowForm(true)} className="text-sky-600 font-bold mt-2 hover:underline hover:text-sky-700">Start here</button>
                                </div>
                            ) : (
                                feedbacks.map(item => (
                                    <div key={item._id} className="bg-slate-50 hover:bg-white transition-all duration-200 rounded-xl p-5 flex justify-between items-center group cursor-pointer border border-slate-100 hover:border-sky-500/30 hover:shadow-md">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-900 transition-colors">{item.companyName}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{item.jobRole || "Software Engineer"} • <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{item.difficulty || "Medium"}</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Right Column: Widgets */}
                <div className="space-y-6">
                    {/* My Analytics Widget */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <BarChart2 size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">My Activity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg text-center border-l-4 border-indigo-900">
                                <span className="block text-2xl font-bold text-indigo-900">{feedbacks.length}</span>
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg text-center border-l-4 border-teal-500">
                                <span className="block text-2xl font-bold text-teal-600">{feedbacks.filter(f => f.status === 'approved').length}</span>
                                <span className="text-xs text-teal-600 uppercase font-bold tracking-wider">Approved</span>
                            </div>
                            <div className="col-span-2 p-3 bg-amber-50 rounded-lg flex justify-between items-center px-6 border border-amber-100">
                                <span className="text-sm font-bold text-amber-800">Pending Review</span>
                                <span className="text-xl font-bold text-amber-800">{feedbacks.filter(f => f.status === 'pending').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Resources Widget */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                                <BookOpen size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Prep Resources</h3>
                        </div>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition group border border-transparent hover:border-slate-200">
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-900">GeeksforGeeks</span>
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500" />
                                </a>
                            </li>
                            <li>
                                <a href="https://leetcode.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition group border border-transparent hover:border-slate-200">
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-900">LeetCode</span>
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.indiabix.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition group border border-transparent hover:border-slate-200">
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-900">IndiaBix (Aptitude)</span>
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Submission Form Modal (Overlay) */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in-up">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 rounded-lg text-academic-blue">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Submit New Feedback</h2>
                                <p className="text-xs text-gray-500">Share your experience to help juniors</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name</label>
                                    <input type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required placeholder="e.g. Zoho" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Drive Date</label>
                                    <input type="date" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-academic-teal outline-none transition"
                                        value={formData.driveDate} onChange={e => setFormData({ ...formData, driveDate: e.target.value })} required />
                                </div>
                                <div>
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
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-gray-500 font-semibold hover:bg-gray-50 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-academic-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
