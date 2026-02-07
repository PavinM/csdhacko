import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import * as XLSX from 'xlsx';
import { Check, X, ChevronDown, ChevronUp, Briefcase, Calendar, Star, Upload, Eye, Plus, Filter, Sparkles } from "lucide-react";
import { getDomainFromDept } from "../utils/studentUtils";

export default function CoordinatorFeedback() {
    const { currentUser } = useAuth();
    const userRole = currentUser?.role;
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [companies, setCompanies] = useState([]); // List of companies
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [uploadingFor, setUploadingFor] = useState(null);

    const [viewingListFor, setViewingListFor] = useState(null); // Company ID to view list
    const [domainFilter, setDomainFilter] = useState(''); // Domain Filter State - initialized in useEffect


    useEffect(() => {
        if (currentUser) {
            // Initialize Domain Filter based on User's Dept
            if (!domainFilter) {
                const userDomain = getDomainFromDept(currentUser.department);
                setDomainFilter(userDomain);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && domainFilter) {
            fetchPendingFeedback();
            fetchCompanies();
        }
    }, [currentUser, domainFilter]);

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get('/companies');
            // Filter only companies for this coordinator's department if necessary, 
            // but usually they might want to see all or just theirs. 
            // For now, let's filter by department to keep it clean if desired, or all.
            // Let's show all for now but highligh theirs? Plan said filtered.
            // Actually, backend returns all. Let's filter client side for management.
            setCompanies(data.filter(c => c.department === currentUser.department));
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const fetchPendingFeedback = async () => {
        try {
            // Filter by Domain instead of just current user's department
            const domainQuery = domainFilter === 'Both' ? '' : `&domainType=${domainFilter}`;
            // We removed specific department filter to allow seeing all pending feedbacks in the domain
            const { data } = await api.get(`/feedback?status=pending${domainQuery}`);
            setPendingFeedback(data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            alert("Failed to fetch feedback.");
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

    const handleFileUpload = (e, companyId) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const emails = data
                    .map(row => row['Email'] || row['email'] || row['EMAIL'])
                    .filter(email => email)
                    .map(email => String(email).trim().toLowerCase()); // Normalize: string, trim, lowercase

                if (emails.length === 0) {
                    alert('No emails found in the uploaded sheet. Please ensure there is a column named "Email".');
                    return;
                }

                await api.put(`/companies/${companyId}/eligibility`, { eligibleStudents: emails });
                alert(`Successfully updated eligibility list! Found ${emails.length} students.`);
                fetchCompanies(); // Refresh data
                setUploadingFor(null);
            } catch (error) {
                console.error("Error processing file:", error);
                alert("Error processing file: " + error.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMarkCompleted = async (companyId) => {
        if (!window.confirm("Are you sure you want to mark this drive as completed? This will open feedback for eligible students.")) return;
        try {
            await api.put(`/companies/${companyId}/status`, { status: 'completed' });
            fetchCompanies();
            alert("Drive marked as completed!");
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading feedback data...</div>;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A237E]">Student's Feedback</h1>
                    <p className="text-slate-500 text-sm">Review submissions & manage placement drives</p>
                </div>
            </div>

            {/* Pending Reviews Section */}
            <div>
                <div className="flex gap-2 items-center">
                    <Star size={20} className="text-[#1A237E]" />
                    <h2 className="text-lg font-bold text-[#1A237E]">Pending Reviews</h2>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingFeedback.length}</span>
                </div>

                {/* Domain Filter UI */}
                <div className="flex items-center gap-2">
                    {domainFilter && domainFilter !== 'Both' && (
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-bold flex gap-1 items-center">
                            <Sparkles size={10} /> Auto-detected: {domainFilter}
                        </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filter by Domain:</span>
                    <select
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2 outline-none focus:border-indigo-500 font-medium"
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                    >
                        <option value="Both">Both (All)</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                    </select>
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
                                                <span className="text-slate-300">|</span>
                                                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-indigo-100">
                                                    {item.department}
                                                </span>
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

            {/* Manage Drives Section */}
            {
                userRole !== 'admin' && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase size={20} className="text-[#1A237E]" />
                            <h2 className="text-lg font-bold text-[#1A237E]">Manage Drives</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.filter(c => {
                                if (domainFilter === 'Both') return true;
                                if (!domainFilter) return true; // If domainFilter is not yet set (e.g., initial render), show all
                                // Include BOTH and Missing/Legacy domains
                                return c.domain === domainFilter || c.domain === 'Both' || !c.domain;
                            }).map(company => (
                                <div key={company._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#1A237E]">{company.name}</h3>
                                            <p className="text-sm text-slate-500">{company.roles}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${company.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {company.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-600 mb-6">
                                        <p className="flex items-center gap-2"><Calendar size={14} /> {company.visitDate}</p>
                                        <p className="flex items-center gap-2 text-indigo-600 font-medium">
                                            <Check size={14} />
                                            {company.eligibleStudents?.length || 0} Students Eligible
                                            <button
                                                onClick={() => setViewingListFor(company)}
                                                className="ml-2 text-xs font-bold text-indigo-700 underline hover:text-indigo-900"
                                            >
                                                (View List)
                                            </button>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 relative">
                                        {company.status !== 'completed' ? (
                                            <>
                                                <button
                                                    onClick={() => handleMarkCompleted(company._id)}
                                                    className="flex-1 bg-white border border-green-600 text-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-50 transition"
                                                >
                                                    Mark Completed
                                                </button>

                                                <button
                                                    onClick={() => setUploadingFor(company._id)}
                                                    className="flex-1 bg-[#1A237E] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#283593] transition flex items-center justify-center gap-2"
                                                >
                                                    <Upload size={14} /> Upload list
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setViewingListFor(company)}
                                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                            >
                                                <Eye size={14} /> View List
                                            </button>
                                        )}

                                        {/* Hidden File Input triggered by state */}
                                        {uploadingFor === company._id && (
                                            <div className="absolute bottom-full left-0 right-0 bg-white shadow-xl rounded-lg p-3 border border-slate-200 mb-2 z-10 animate-fade-in">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-slate-600">Select Excel File</span>
                                                    <button onClick={() => setUploadingFor(null)}><X size={14} className="text-slate-400" /></button>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    onChange={(e) => handleFileUpload(e, company._id)}
                                                    className="block w-full text-xs text-slate-500
                                            file:mr-2 file:py-1 file:px-2
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">*Column "Email" required</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {companies.length === 0 && (
                                <div className="col-span-full text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 font-medium">No drives scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Add Company Modal */}

            {/* View Eligible List Modal */}
            {
                viewingListFor && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-fade-in-up">
                            <div className="flex justify-between items-center p-5 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-lg text-[#1A237E]">Eligible Students</h3>
                                    <p className="text-xs text-slate-500">{viewingListFor.name}</p>
                                </div>
                                <button
                                    onClick={() => setViewingListFor(null)}
                                    className="text-slate-400 hover:text-slate-600 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-5 space-y-2">
                                {viewingListFor.eligibleStudents && viewingListFor.eligibleStudents.length > 0 ? (
                                    viewingListFor.eligibleStudents.map((email, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <span className="text-slate-700 font-medium truncate">{email}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-10">No students added yet.</p>
                                )}
                            </div>
                            <div className="p-5 border-t border-slate-100 bg-slate-50">
                                <button
                                    onClick={() => setViewingListFor(null)}
                                    className="w-full bg-[#1A237E] hover:bg-[#283593] text-white py-2.5 rounded-lg font-bold transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
