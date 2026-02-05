import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { Plus, CheckCircle, XCircle, FileText, Calendar, Briefcase, Sparkles } from "lucide-react";

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        companyName: "",
        driveDate: "",
        jobRole: "",
        rounds: [{ name: "", questions: "" }],
        difficulty: "Medium",
        overallExperience: "",
        preparationTips: ""
    });

    useEffect(() => {
        if (currentUser) {
            fetchFeedbacks();
        }
    }, [currentUser]);

    const fetchFeedbacks = async () => {
        try {
            const q = query(
                collection(db, "feedback"),
                where("department", "==", currentUser.department)
            );
            const querySnapshot = await getDocs(q);
            const feedbackList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const relevantFeedback = feedbackList.filter(f => f.studentId === currentUser.uid || f.status === 'approved');
            setFeedbacks(relevantFeedback);
        } catch (error) {
            console.error("Error fetching feedback:", error);
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
            await addDoc(collection(db, "feedback"), {
                ...formData,
                studentId: currentUser.uid,
                studentName: currentUser.name,
                department: currentUser.department,
                status: "pending",
                createdAt: serverTimestamp()
            });
            setShowForm(false);
            fetchFeedbacks();
            setFormData({
                companyName: "",
                driveDate: "",
                jobRole: "",
                rounds: [{ name: "", questions: "" }],
                difficulty: "Medium",
                overallExperience: "",
                preparationTips: ""
            });
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading your dashboard...</div>;

    return (
        <div className="space-y-6">

            {/* Dashboard Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Department: <span className="font-semibold text-academic-blue">{currentUser?.department}</span>
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mt-4 md:mt-0 flex items-center gap-2 bg-academic-teal hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-medium"
                >
                    {showForm ? "Cancel Submission" : <><Plus size={18} /> Add Interview Experience</>}
                </button>
            </div>

            {/* Submission Form Card */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 animate-fade-in-down">
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
                        {/* General Info */}
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

                        {/* Rounds Section */}
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
            )}

            {/* Stats / Filters Row */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Filter pills can go here */}
            </div>

            {/* Feedbacks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {feedbacks.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col h-full group">

                        {/* Card Header */}
                        <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-lg group-hover:bg-blue-50 group-hover:text-academic-blue transition-colors">
                                    {item.companyName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 leading-tight">{item.companyName}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <Calendar size={10} /> {item.driveDate}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-50 text-green-600' :
                                    item.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                        'bg-yellow-50 text-yellow-600'
                                }`}>
                                {item.status}
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 select-none">
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-academic-blue text-xs font-semibold">
                                    <Briefcase size={12} /> {item.jobRole}
                                </span>
                                <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-semibold">
                                    {item.difficulty}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {item.rounds && item.rounds.slice(0, 2).map((r, i) => (
                                    <div key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-200">
                                        <span className="font-semibold text-gray-800">{r.name}</span>
                                        <p className="text-xs text-gray-500 line-clamp-1 truncate">{r.questions}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors">
                            <span className="text-xs text-gray-400 font-medium">By {item.studentName}</span>
                            <button className="text-xs font-bold text-academic-teal hover:text-teal-800 flex items-center gap-1">
                                View Details <Sparkles size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
