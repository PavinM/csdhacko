import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Check, X, ChevronDown, ChevronUp, Clock, FileCheck, UserPlus } from "lucide-react";

export default function CoordinatorDashboard() {
    const { currentUser, createUser } = useAuth();
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (currentUser) {
            fetchPendingFeedback();
        }
    }, [currentUser]);

    const fetchPendingFeedback = async () => {
        try {
            const q = query(
                collection(db, "feedback"),
                where("department", "==", currentUser.department),
                where("status", "==", "pending")
            );
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingFeedback(list);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
        setLoading(false);
    };

    const handleAction = async (id, status) => {
        try {
            await updateDoc(doc(db, "feedback", id), { status });
            setPendingFeedback(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error updating feedback:", error);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await createUser(newStudent.email, newStudent.password, {
                name: newStudent.name,
                role: 'student',
                department: currentUser.department // Inherit department from Coordinator
            });
            setIsCreating(false);
            setNewStudent({ name: '', email: '', password: '' });
            alert("Student created successfully!");
        } catch (error) {
            alert("Error creating student: " + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-900">Feedback Review</h1>
                    <p className="text-sm text-slate-500">Department: {currentUser?.department}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md"
                    >
                        <UserPlus size={18} /> New Student
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                        <Clock size={18} />
                        <span className="font-bold">{pendingFeedback.length} Pending</span>
                    </div>
                </div>
            </div>

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in relative">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-indigo-900 mb-6">Add New Student</h2>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input
                                    type="email" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                <input
                                    type="password" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2">
                                Create Student Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {pendingFeedback.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <FileCheck className="mx-auto text-teal-100 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
                    <p className="text-slate-500">There are no pending feedback submissions to review.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingFeedback.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-sky-500/30">
                            {/* Summary Row */}
                            <div
                                className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-lg border border-sky-100">
                                        {item.companyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-indigo-900">{item.companyName}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{item.jobRole} • {item.driveDate}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Student: {item.studentName}</span>
                                            <span className="font-medium text-slate-400">ID: {item.studentId.slice(0, 6)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {expandedId !== item.id && (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'rejected'); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"><X size={20} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'approved'); }} className="p-2 text-teal-500 hover:bg-teal-50 rounded-full transition"><Check size={20} /></button>
                                        </div>
                                    )}
                                    <span className="text-slate-400">
                                        {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </div>
                            </div>

                            {/* Extended Details */}
                            {expandedId === item.id && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fade-in">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Experience</h4>
                                                <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">{item.overallExperience}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preparation Tips</h4>
                                                <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">{item.preparationTips}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interview Rounds</h4>
                                            <div className="space-y-3">
                                                {item.rounds.map((r, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                        <span className="font-bold text-indigo-900 block mb-1">{r.name}</span>
                                                        <p className="text-slate-600 text-sm">{r.questions}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                                        <button onClick={() => handleAction(item.id, 'rejected')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition font-medium shadow-sm">
                                            <X size={18} /> Reject
                                        </button>
                                        <button onClick={() => handleAction(item.id, 'approved')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition font-bold">
                                            <Check size={18} /> Approve Feedback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
