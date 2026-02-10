import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, User, Mail, Hash, Calendar } from "lucide-react";
import api from "../lib/api";

export default function EditRequestsManager() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/edit-requests?status=pending');
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching edit requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (requestId, status) => {
        setProcessing(requestId);
        try {
            await api.patch(`/users/edit-requests/${requestId}`, { status });
            await fetchRequests(); // Refresh the list
            alert(`Request ${status} successfully!`);
        } catch (error) {
            console.error("Error processing request:", error);
            alert(error.response?.data?.message || 'Failed to process request');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Student Edit Requests</h2>
                    <p className="text-sm text-slate-500 mt-1">Review and approve or reject student profile edit access requests</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold">
                    {requests.length} Pending
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                        <CheckCircle size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No Pending Requests</h3>
                    <p className="text-slate-500 text-sm">All edit requests have been processed.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-indigo-100 p-2 rounded-full">
                                            <User size={20} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{request.studentId?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-slate-500">{request.studentId?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 mt-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                                                <Hash size={10} /> Roll No
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800">{request.studentId?.rollNo || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Department</p>
                                            <p className="text-sm font-semibold text-slate-800">{request.studentId?.department || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Year</p>
                                            <p className="text-sm font-semibold text-slate-800">{request.studentId?.year || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Section</p>
                                            <p className="text-sm font-semibold text-slate-800">{request.studentId?.section || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {request.reason && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                            <p className="text-xs font-bold text-amber-900 uppercase mb-1">Reason for Request</p>
                                            <p className="text-sm text-amber-800 leading-relaxed">{request.reason}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock size={12} />
                                        <span>Requested on {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleProcessRequest(request._id, 'approved')}
                                        disabled={processing === request._id}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleProcessRequest(request._id, 'rejected')}
                                        disabled={processing === request._id}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
