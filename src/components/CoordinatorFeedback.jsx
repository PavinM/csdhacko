import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { Check, X, ChevronDown, ChevronUp, Briefcase, Plus, Building, Calendar, Star } from "lucide-react";

export default function CoordinatorFeedback() {
    const { currentUser } = useAuth();
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [isAddingCompany, setIsAddingCompany] = useState(false);

    // New Company Form State
    const [newCompany, setNewCompany] = useState({
        name: '',
        visitDate: '',
        roles: '',
        eligibility: '',
        package: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchPendingFeedback();
        }
    }, [currentUser]);

    const fetchPendingFeedback = async () => {
        try {
            const { data } = await api.get(`/feedback?department=${currentUser.department}&status=pending`);
            setPendingFeedback(data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
        setLoading(false);
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/feedback/${id}/status`, { status });
            setPendingFeedback(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.error("Error updating feedback:", error);
            alert("Failed to update status");
        }
    };

    const handleAddCompany = async (e) => {
        e.preventDefault();
        try {
            await api.post('/companies', {
                ...newCompany,
                department: currentUser.department,
                status: 'scheduled'
            });
            setIsAddingCompany(false);
            setNewCompany({ name: '', visitDate: '', roles: '', eligibility: '', package: '' });
            alert("Company drive added successfully!");
        } catch (error) {
            alert("Error adding company: " + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading feedback data...</div>;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A237E]">Student's Feedback</h1>
                    <p className="text-slate-500 text-sm">Review submissions & manage placement drives</p>
                </div>
                <button
                    onClick={() => setIsAddingCompany(true)}
                    className="flex items-center gap-2 bg-[#00897B] hover:bg-[#00796B] text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus size={18} /> Add A Company
                </button>
            </div>

            {/* Pending Reviews Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Star size={20} className="text-[#1A237E]" />
                    <h2 className="text-lg font-bold text-[#1A237E]">Pending Reviews</h2>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingFeedback.length}</span>
                </div>

                {pendingFeedback.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center border-dashed">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Check size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                        <p className="text-slate-500 text-sm mt-1">No pending feedback to review at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingFeedback.map(item => (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-[#1A237E]/30 group">
                                {/* Summary Row */}
                                <div
                                    className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-[#E8EAF6] flex items-center justify-center text-[#1A237E] font-bold text-lg border border-[#C5CAE9]">
                                            {item.companyName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-[#1A237E] group-hover:text-[#283593] transition-colors">{item.companyName}</h3>
                                            <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                                <Briefcase size={14} /> {item.jobRole}
                                                <span className="text-slate-300">|</span>
                                                <Calendar size={14} /> {item.driveDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right mr-4 hidden md:block">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Student</p>
                                            <p className="text-sm font-semibold text-slate-700">{item.studentName}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {expandedId !== item._id && (
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleAction(item._id, 'rejected'); }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition border border-transparent hover:border-red-100" title="Reject">
                                                        <X size={20} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleAction(item._id, 'approved'); }}
                                                        className="p-2 text-[#00897B] hover:bg-teal-50 rounded-full transition border border-transparent hover:border-teal-100" title="Approve">
                                                        <Check size={20} />
                                                    </button>
                                                </div>
                                            )}
                                            <span className="text-slate-400 group-hover:text-[#1A237E]">
                                                {expandedId === item._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Extended Details */}
                                {expandedId === item._id && (
                                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fade-in">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <Star size={12} /> Overall Experience
                                                    </h4>
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-slate-700 leading-relaxed text-sm">
                                                        {item.overallExperience}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Preparation Tips</h4>
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-slate-700 leading-relaxed text-sm">
                                                        {item.preparationTips}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2">Interview Rounds</h4>
                                                <div className="space-y-3">
                                                    {item.rounds.map((r, i) => (
                                                        <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8BC34A]"></div>
                                                            <span className="font-bold text-[#1A237E] block mb-1">{r.name}</span>
                                                            <p className="text-slate-600 text-sm whitespace-pre-wrap">{r.questions}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                                            <button onClick={() => handleAction(item._id, 'rejected')}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition font-medium shadow-sm">
                                                <X size={18} /> Reject Feedback
                                            </button>
                                            <button onClick={() => handleAction(item._id, 'approved')}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] hover:bg-[#00796B] text-white rounded-lg shadow-md transition font-bold">
                                                <Check size={18} /> Approve & Publish
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Company Modal */}
            {isAddingCompany && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-0 animate-fade-in relative overflow-hidden">
                        <div className="bg-[#1A237E] p-6 text-white">
                            <button
                                onClick={() => setIsAddingCompany(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Building size={24} /> Add New Company
                            </h2>
                            <p className="text-blue-200 text-sm mt-1">Schedule a new placement drive</p>
                        </div>

                        <form onSubmit={handleAddCompany} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Company Name</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Visit Date</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.visitDate} onChange={e => setNewCompany({ ...newCompany, visitDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Package (LPA)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.package} onChange={e => setNewCompany({ ...newCompany, package: e.target.value })}
                                        placeholder="e.g. 12 LPA"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Roles Offered</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newCompany.roles} onChange={e => setNewCompany({ ...newCompany, roles: e.target.value })}
                                    placeholder="e.g. SDE, Data Analyst"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Eligibility Criteria</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white resize-none h-24"
                                    value={newCompany.eligibility} onChange={e => setNewCompany({ ...newCompany, eligibility: e.target.value })}
                                    placeholder="CGPA > 8.0, No Standing Arrears..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3.5 rounded-lg mt-2 shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                                <Plus size={18} /> Schedule Drive
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
