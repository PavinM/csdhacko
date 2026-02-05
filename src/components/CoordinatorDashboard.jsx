import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Check, X, LogOut, ChevronDown, ChevronUp, AlertCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CoordinatorDashboard() {
    const { currentUser } = useAuth();
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

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

    const handleAction = async (id, status, comments = "") => {
        try {
            await updateDoc(doc(db, "feedback", id), {
                status,
                coordinatorComments: comments
            });
            setPendingFeedback(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error updating feedback:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6">
                <h1 className="text-2xl font-bold text-white">Coordinator Dashboard</h1>
                <p className="text-gray-400">Department: <span className="font-semibold text-kec-green">{currentUser?.department}</span></p>
            </div>

            <div className="flex items-center gap-3 mb-6 bg-yellow-500/10 text-yellow-200 p-4 rounded-lg border border-yellow-500/20">
                <AlertCircle size={20} />
                <h2 className="font-medium">Pending Approvals ({pendingFeedback.length})</h2>
            </div>

            {pendingFeedback.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-xl border-dashed border-white/20">
                    <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No pending feedback to review at this time.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingFeedback.map(item => (
                        <div key={item.id} className="glass-panel rounded-lg shadow-lg hover:bg-white/5 transition-colors">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-white">{item.companyName}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">{item.jobRole}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Submitted by: <span className="font-medium text-gray-200">{item.studentName}</span> • {item.driveDate}</p>
                                </div>
                                <button
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    className="flex items-center gap-1 text-sm font-medium text-kec-light-blue hover:text-white transition"
                                >
                                    {expandedId === item.id ? "Hide Details" : "Review Feedback"}
                                    {expandedId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {expandedId === item.id && (
                                <div className="border-t border-white/10 bg-black/20 p-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded border border-white/10">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Overall Experience</h4>
                                                <p className="text-gray-200 text-sm leading-relaxed">{item.overallExperience}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded border border-white/10">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preparation Tips</h4>
                                                <p className="text-gray-200 text-sm leading-relaxed">{item.preparationTips}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-4 rounded border border-white/10 h-full">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Interview Rounds</h4>
                                            <div className="space-y-4">
                                                {item.rounds.map((r, i) => (
                                                    <div key={i} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                                        <span className="font-bold text-kec-light-blue text-sm block mb-1">{r.name}</span>
                                                        <p className="text-gray-300 text-sm">{r.questions}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                        <button onClick={() => handleAction(item.id, 'rejected')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition font-medium text-sm">
                                            <X size={16} /> Reject with Comments
                                        </button>
                                        <button onClick={() => handleAction(item.id, 'approved')}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg border border-white/10 transition font-medium text-sm">
                                            <Check size={16} /> Approve & Publish
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
