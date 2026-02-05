import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Check, X, ChevronDown, ChevronUp, Clock, FileCheck } from "lucide-react";

export default function CoordinatorDashboard() {
    const { currentUser } = useAuth();
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Feedback Review</h1>
                    <p className="text-sm text-gray-500">Department: {currentUser?.department}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                    <Clock size={18} />
                    <span className="font-bold">{pendingFeedback.length} Pending</span>
                </div>
            </div>

            {pendingFeedback.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileCheck className="mx-auto text-green-100 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-700">All caught up!</h3>
                    <p className="text-gray-500">There are no pending feedback submissions to review.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingFeedback.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                            {/* Summary Row */}
                            <div
                                className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-academic-blue font-bold text-lg">
                                        {item.companyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{item.companyName}</h3>
                                        <p className="text-sm text-gray-500">{item.jobRole} • {item.driveDate}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Student: {item.studentName}</span>
                                            <span className="font-medium text-gray-400">ID: {item.studentId.slice(0, 6)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {expandedId !== item.id && (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'rejected'); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"><X size={20} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'approved'); }} className="p-2 text-green-500 hover:bg-green-50 rounded-full transition"><Check size={20} /></button>
                                        </div>
                                    )}
                                    <span className="text-gray-400">
                                        {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </div>
                            </div>

                            {/* Extended Details */}
                            {expandedId === item.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-fade-in">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Experience</h4>
                                                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-100">{item.overallExperience}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preparation Tips</h4>
                                                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-100">{item.preparationTips}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interview Rounds</h4>
                                            <div className="space-y-3">
                                                {item.rounds.map((r, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-100">
                                                        <span className="font-bold text-academic-blue block mb-1">{r.name}</span>
                                                        <p className="text-gray-600 text-sm">{r.questions}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                        <button onClick={() => handleAction(item.id, 'rejected')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition font-medium shadow-sm">
                                            <X size={18} /> Reject
                                        </button>
                                        <button onClick={() => handleAction(item.id, 'approved')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition font-bold">
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
