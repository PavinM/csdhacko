import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { Plus, CheckCircle, Clock, XCircle, FileText, Calendar, Briefcase, ChevronDown, ChevronUp } from "lucide-react";

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                    <p className="text-gray-400">Department of {currentUser?.department}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-kec-blue to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg border border-white/10 transition-all text-sm font-medium"
                >
                    {showForm ? "Cancel Submission" : <><Plus size={18} /> Submit New Feedback</>}
                </button>
            </div>

            {/* Submission Form */}
            {showForm && (
                <div className="glass-panel rounded-xl p-6 md:p-8 animate-fade-in-down">
                    <div className="flex items-center gap-2 mb-6 text-kec-light-blue border-b border-white/10 pb-3">
                        <FileText size={20} />
                        <h2 className="text-lg font-bold">Feedback Submission Form</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Company Name</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white"
                                    value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Drive Date</label>
                                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white [color-scheme:dark]"
                                    value={formData.driveDate} onChange={e => setFormData({ ...formData, driveDate: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Job Role</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white"
                                    value={formData.jobRole} onChange={e => setFormData({ ...formData, jobRole: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Difficulty Level</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white [&>option]:bg-gray-900"
                                    value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Rounds */}
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Recruitment Rounds</h3>
                            <div className="space-y-4">
                                {formData.rounds.map((round, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3">
                                        <input type="text" placeholder="Round Name (e.g. Aptitude)" className="bg-white/5 border border-white/10 rounded-lg p-2 md:w-1/3 text-sm text-white focus:border-kec-light-blue outline-none"
                                            value={round.name} onChange={e => handleRoundChange(index, 'name', e.target.value)} required />
                                        <textarea placeholder="Questions asked or topics covered..." className="bg-white/5 border border-white/10 rounded-lg p-2 md:w-2/3 text-sm h-10 min-h-[40px] focus:h-20 transition-all text-white focus:border-kec-light-blue outline-none"
                                            value={round.questions} onChange={e => handleRoundChange(index, 'questions', e.target.value)} required />
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddRound} className="mt-4 text-sm font-semibold text-kec-light-blue hover:text-white transition-colors">+ Add Another Round</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Overall Experience</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg p-3 h-24 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white"
                                    placeholder="Describe the overall process and atmosphere..."
                                    value={formData.overallExperience} onChange={e => setFormData({ ...formData, overallExperience: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Preparation Tips for Juniors</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg p-3 h-24 focus:bg-white/10 focus:border-kec-light-blue outline-none text-white"
                                    placeholder="What should they focus on? any specific resources?"
                                    value={formData.preparationTips} onChange={e => setFormData({ ...formData, preparationTips: e.target.value })} required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-400 font-medium hover:text-white transition-colors">Cancel</button>
                            <button type="submit" className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg border border-white/10">Submit Feedback</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map(item => (
                    <div key={item.id} className="glass-panel overflow-hidden hover:bg-white/5 transition-colors duration-300 flex flex-col h-full rounded-xl">
                        <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">{item.companyName}</h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                    <Briefcase size={14} /> {item.jobRole}
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                    item.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                }`}>
                                {item.status === 'approved' ? 'Verified' : item.status}
                            </span>
                        </div>

                        <div className="p-5 flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Calendar size={14} />
                                {item.driveDate}
                                <span className="mx-1">•</span>
                                Difficulty:
                                <span className={`${item.difficulty === 'Hard' ? 'text-red-400' :
                                        item.difficulty === 'Medium' ? 'text-yellow-400' :
                                            'text-green-400'
                                    }`}>{item.difficulty}</span>
                            </div>

                            <div className="space-y-3">
                                {item.rounds && item.rounds.slice(0, 2).map((r, i) => (
                                    <div key={i} className="text-sm bg-black/20 p-2.5 rounded border border-white/5">
                                        <span className="font-bold text-kec-light-blue block mb-1">{r.name}</span>
                                        <p className="text-gray-300 line-clamp-2">{r.questions}</p>
                                    </div>
                                ))}
                                {item.rounds && item.rounds.length > 2 && (
                                    <p className="text-xs text-blue-400 font-medium text-center">+ {item.rounds.length - 2} more rounds</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                            <button className="text-kec-light-blue font-semibold text-sm hover:text-white transition-colors">View Full Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
