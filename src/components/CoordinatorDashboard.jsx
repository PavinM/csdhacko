import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import { Users, FileCheck, Building, BarChart2, Star } from "lucide-react";

export default function CoordinatorDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        pendingFeedback: 0,
        totalFeedback: 0,
        companies: 0,
        approved: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchStats();
        }
    }, [currentUser]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get(`/feedback?department=${currentUser.department}`);

            const uniqueCompanies = new Set(data.map(f => f.companyName)).size;
            setStats({
                pendingFeedback: data.filter(f => f.status === 'pending').length,
                totalFeedback: data.length,
                approved: data.filter(f => f.status === 'approved').length,
                companies: uniqueCompanies
            });

        } catch (error) {
            console.error("Error fetching stats:", error);
        }
        setLoading(false);
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500 gap-2"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>Loading dashboard...</div>;

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50 min-h-screen">
            <div className="animate-fade-in space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-2xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold uppercase tracking-wide drop-shadow-sm">Welcome, {currentUser?.name}</h1>
                        <p className="text-blue-100 text-lg mt-2 font-light">Managing placement activities for {currentUser?.department}</p>
                    </div>
                    <div className="relative z-10 hidden md:block">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white border-4 border-white/30 backdrop-blur-sm">
                            <Building className="w-10 h-10" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Pending Reviews" value={stats.pendingFeedback} icon={<Star size={24} />} color="amber" />
                    <StatCard title="Total Feedbacks" value={stats.totalFeedback} icon={<FileCheck size={24} />} color="blue" />
                    <StatCard title="Approved" value={stats.approved} icon={<CheckIcon size={24} />} color="teal" />
                    <StatCard title="Active Companies" value={stats.companies} icon={<BarChart2 size={24} />} color="indigo" />
                </div>

                {/* Quick Actions / Recent Activity Block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#E8EAF6] rounded-lg text-[#1A237E]">
                                <Star size={20} />
                            </div>
                            <h3 className="font-bold text-[#1A237E]">Action Required</h3>
                        </div>

                        {stats.pendingFeedback > 0 ? (
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
            </div>
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
