import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API

import { Users, FileCheck, Building, BarChart2, Star, Sparkles } from "lucide-react";
import { getDomainFromDept } from "../utils/studentUtils";
import AssignStudentsModal from "./AssignStudentsModal"; // Added Modal Import

export default function CoordinatorDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        pendingFeedback: 0,
        totalFeedback: 0,
        companies: 0,
        approved: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentCompanies, setRecentCompanies] = useState([]); // Store filtered companies for display
    const [pendingAssignment, setPendingAssignment] = useState([]); // Action item: Drives waiting for student assignment

    const [activeModal, setActiveModal] = useState(null); // 'assign' | null
    const [selectedAssignmentDrive, setSelectedAssignmentDrive] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchStats();
        }
    }, [currentUser]);

    const fetchStats = async () => {
        try {
            // Determine Domain
            const userDomain = getDomainFromDept(currentUser.department);
            console.log("Coordinator Domain:", userDomain);

            // Fetch feedback for this DOMAIN (or department if Both/Unknown)
            let query = `?department=${currentUser.department}`; // Default fallback
            if (userDomain !== 'Both') {
                query = `?domainType=${userDomain}`;
            }

            const { data: feedbacks } = await api.get(`/feedback${query}`);

            // Fetch Companies for this Domain
            // Since we don't have a direct "count companies by domain" endpoint yet (unless we filter client side or add one),
            // we can fetch all companies and filter client side for now.
            const { data: allCompanies } = await api.get('/companies');
            const domainCompanies = allCompanies.filter(c => {
                // Treats missing domain as 'Both' (Legacy support)
                if (!c.domain || c.domain === 'Both') return true;
                return c.domain === userDomain;
            });

            const uniqueCompaniesCount = domainCompanies.length;

            setStats({
                pendingFeedback: feedbacks.filter(f => f.status === 'pending').length,
                totalFeedback: feedbacks.length,
                approved: feedbacks.filter(f => f.status === 'approved').length,
                companies: uniqueCompaniesCount,
                domain: userDomain // Store for display
            });

            // Store the companies for the list view
            setRecentCompanies(domainCompanies.slice(0, 5)); // Show top 5 recent

            // Filter for Drives that might need assignment (e.g., recently added or scheduled)
            // For now, we list all 'Scheduled' ones as "Pending Assignment/Verification"
            const dueForAssignment = domainCompanies.filter(c => c.status === 'scheduled');
            setPendingAssignment(dueForAssignment);

        } catch (error) {
            console.error("Error fetching stats:", error);
        }
        setLoading(false);
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500 gap-2"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* 1. Welcome Banner - KEC Style */}
            <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold uppercase tracking-wide drop-shadow-sm">Welcome, {currentUser?.name || "Coordinator"}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-blue-100 text-lg font-light">Department of {currentUser?.department}</p>
                        {stats.domain && (
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                <Sparkles size={14} /> {stats.domain} Domain
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative z-10 hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white border-4 border-white/30 backdrop-blur-sm">
                        <Building className="w-10 h-10" />
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Reviews" value={stats.pendingFeedback} icon={<Star size={24} />} color="amber" />
                <StatCard title="Total Feedbacks" value={stats.totalFeedback} icon={<FileCheck size={24} />} color="blue" />
                <StatCard title="Approved" value={stats.approved} icon={<CheckIcon size={24} />} color="teal" />
                <StatCard title="Active Companies" value={stats.companies} icon={<BarChart2 size={24} />} color="indigo" />
            </div>

            {/* 3. Recent Activity / Quick View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#E8EAF6] rounded-lg text-[#1A237E]">
                            <Star size={20} />
                        </div>
                        <h3 className="font-bold text-[#1A237E]">Action Required</h3>
                    </div>

                    {pendingAssignment.length > 0 ? (
                        <div className="space-y-4">
                            {pendingAssignment.slice(0, 3).map(drive => (
                                <div key={drive._id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#1A237E]">{drive.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {drive.visitDate}
                                            </span>
                                            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                                Verification Pending
                                            </span>
                                        </div>
                                        {/* Assuming 'drive' has a 'rounds' array, and each round has 'resources' */}
                                        {drive.rounds && drive.rounds.length > 0 && drive.rounds.map((round, roundIndex) => (
                                            <div key={roundIndex} className="mt-2 text-xs text-slate-600">
                                                {round.resources && round.resources.split('\n').map((res, i) => {
                                                    if (!res.trim()) return null;
                                                    // Check if it's a file path or link
                                                    // const isFile = res.includes('[File]'); // This logic might need refinement based on actual resource format
                                                    const userUrl = res.split(': ')[1]?.trim();

                                                    // Logic to determine correct HREF
                                                    let finalUrl = userUrl;
                                                    if (userUrl && !userUrl.startsWith('http://') && !userUrl.startsWith('https://')) {
                                                        // If relative path (legacy local upload), prepend API URL
                                                        finalUrl = `${api.defaults.baseURL}${userUrl}`;
                                                    }

                                                    return (
                                                        <a
                                                            key={i}
                                                            href={finalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-indigo-600 hover:underline truncate"
                                                        >
                                                            {res}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                                        onClick={() => {
                                            setSelectedAssignmentDrive(drive);
                                            setActiveModal('assign');
                                        }}
                                    >
                                        Verify & Assign
                                    </button>
                                </div>
                            ))}
                            {stats.pendingFeedback > 0 && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-800">{stats.pendingFeedback} Pending Reviews</h4>
                                        <p className="text-xs text-amber-700">Approve feedback.</p>
                                    </div>
                                    <a href="/coordinator/feedback" className="bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-amber-600 transition">
                                        Review
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : stats.pendingFeedback > 0 ? (
                        <div className="p-6 bg-amber-50 border border-amber-100 rounded-lg text-center">
                            <h4 className="text-lg font-bold text-amber-800 mb-2">You have {stats.pendingFeedback} pending reviews</h4>
                            <p className="text-sm text-amber-700 mb-4">Students are waiting for approval.</p>
                            <a href="/coordinator/feedback" className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-amber-600 transition">Go to Reviews</a>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <FileCheck size={48} className="mb-2 opacity-50" />
                            <p>No pending actions.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-teal-50 rounded-lg text-[#00897B]">
                            <BarChart2 size={20} />
                        </div>
                        <h3 className="font-bold text-[#1A237E]">Department Status</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Feedback Approval Rate</span>
                            <span className="font-bold text-[#1A237E]">
                                {stats.totalFeedback > 0 ? Math.round((stats.approved / stats.totalFeedback) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Active Companies</span>
                            <span className="font-bold text-[#1A237E]">{stats.companies}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Active Recruitment Drives List (Added for extra visibility) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-[#1A237E] flex items-center gap-2">
                        <Building size={20} /> Active Recruitment Drives ({stats.domain} Domain)
                    </h3>
                    <a href="/coordinator/feedback" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-slate-100">Company</th>
                                <th className="p-4 border-b border-slate-100">Domain</th>
                                <th className="p-4 border-b border-slate-100">Date</th>
                                <th className="p-4 border-b border-slate-100">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {recentCompanies.length > 0 ? recentCompanies.map(company => (
                                <tr key={company._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-[#1A237E]">{company.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${company.domain === 'Hardware' ? 'bg-orange-100 text-orange-700' :
                                            company.domain === 'Software' ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                            {company.domain || 'Both'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">{company.visitDate}</td>
                                    <td className="p-4">{company.roles?.join(", ") || "N/A"}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No active drives found for {stats.domain} domain.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Assign Students Modal */}
            {activeModal === 'assign' && selectedAssignmentDrive && (
                <AssignStudentsModal
                    currentUser={currentUser}
                    company={selectedAssignmentDrive}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedAssignmentDrive(null);
                    }}
                    onSuccess={() => {
                        setActiveModal(null);
                        setSelectedAssignmentDrive(null);
                        fetchStats(); // Refresh data/counts
                    }}
                />
            )}
        </div>
    );
}

// Sub-components
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        amber: 'bg-amber-50 text-amber-500',
        blue: 'bg-blue-50 text-blue-600',
        teal: 'bg-teal-50 text-teal-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className={`text-3xl font-bold mt-1 text-slate-800`}>{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                {icon}
            </div>
        </div>
    );
}

function CheckIcon({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
}
