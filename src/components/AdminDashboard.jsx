import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import * as XLSX from 'xlsx';
import { Users, Building, BarChart2, MoreVertical, Search, UserPlus, X, Star, FileCheck, CheckCircle, Plus, Upload, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    const { currentUser, createUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [companiesList, setCompaniesList] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        pendingFeedback: 0,
        totalFeedback: 0,
        companies: 0,
        approved: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', department: '' });

    // New Company Form State
    const [newCompany, setNewCompany] = useState({
        name: '',
        visitDate: '',
        roles: '',
        eligibility: '',
        package: '',
        department: '' // Admin must specify department
    });

    useEffect(() => {
        if (currentUser) {
            fetchAllData();
        }
    }, [currentUser]);

    const fetchAllData = async () => {
        try {
            const [usersRes, feedbackRes, companiesRes] = await Promise.all([
                api.get('/users'),
                api.get('/feedback'), // Admin sees all feedback
                api.get('/companies')
            ]);

            setUsers(usersRes.data);
            setCompaniesList(companiesRes.data);
            const feedbacks = feedbackRes.data;

            setDashboardData({
                totalUsers: usersRes.data.length,
                pendingFeedback: feedbacks.filter(f => f.status === 'pending').length,
                totalFeedback: feedbacks.length,
                approved: feedbacks.filter(f => f.status === 'approved').length,
                companies: companiesRes.data.length
            });

        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
        setLoading(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUser.email, newUser.password, {
                name: newUser.name,
                role: 'coordinator',
                department: newUser.department
            });
            setIsCreating(false);
            setNewUser({ name: '', email: '', password: '', department: '' });
            fetchAllData(); // Refresh list
            alert("Coordinator created successfully!");
        } catch (error) {
            alert("Error creating user: " + error.message);
        }
    };

    const handleAddCompany = async (e) => {
        e.preventDefault();
        try {
            await api.post('/companies', {
                ...newCompany,
                status: 'scheduled'
            });
            setIsAddingCompany(false);
            setNewCompany({ name: '', visitDate: '', roles: '', eligibility: '', package: '', department: '' });
            fetchAllData();
            alert("Company drive added successfully!");
        } catch (error) {
            alert("Error adding company: " + error.message);
        }
    };

    const handleBulkUpload = (e) => {
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

                if (data.length === 0) {
                    alert('No data found in the file.');
                    return;
                }

                // Call Bulk Register endpoint
                const res = await api.post('/auth/bulk-register', { students: data });

                alert(`Bulk upload successful! ${res.data.count} students registered.`);
                setIsBulkUploading(false);
                fetchAllData();
            } catch (error) {
                console.error("Bulk upload error:", error);
                alert("Bulk upload failed: " + (error.response?.data?.message || error.message));
            }
        };
        reader.readAsBinaryString(file);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading system data...</div>;

    const stats = [
        { label: 'Pending Approvals', value: dashboardData.pendingFeedback, icon: Star, color: 'bg-amber-500' },
        { label: 'Total Feedbacks', value: dashboardData.totalFeedback, icon: FileCheck, color: 'bg-indigo-600' },
        { label: 'System Users', value: users.length, icon: Users, color: 'bg-sky-500' },
        { label: 'Active Drives', value: dashboardData.companies, icon: BarChart2, color: 'bg-teal-500' },
    ];

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-900">System Administration</h1>
                    <p className="text-slate-500 text-sm">Overview, User Management & System Stats</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/coordinator/feedback" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
                        <FileCheck size={18} /> Manage Feedbacks
                    </Link>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md"
                    >
                        <UserPlus size={18} /> New Coordinator
                    </button>
                    <button
                        onClick={() => setIsAddingCompany(true)}
                        className="flex items-center gap-2 bg-[#1A237E] hover:bg-[#283593] text-white px-4 py-2 rounded-lg font-bold transition shadow-md"
                    >
                        <Plus size={18} /> Add Company
                    </button>
                    <button
                        onClick={() => setIsBulkUploading(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-md"
                    >
                        <Upload size={18} /> Bulk Students
                    </button>
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
                        <h2 className="text-xl font-bold text-indigo-900 mb-6">Add New Coordinator</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                                <input
                                    type="text" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    placeholder="e.g. CSE"
                                    value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input
                                    type="email" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                <input
                                    type="password" required
                                    className="w-full border rounded-lg p-2.5 focus:border-indigo-900 outline-none"
                                    value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Department</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.department} onChange={e => setNewCompany({ ...newCompany, department: e.target.value })}
                                        placeholder="e.g. CSE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Visit Date</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.visitDate} onChange={e => setNewCompany({ ...newCompany, visitDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Package (LPA)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.package} onChange={e => setNewCompany({ ...newCompany, package: e.target.value })}
                                        placeholder="e.g. 12 LPA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Roles Offered</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                        value={newCompany.roles} onChange={e => setNewCompany({ ...newCompany, roles: e.target.value })}
                                        placeholder="e.g. SDE"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Eligibility Criteria</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white resize-none h-24"
                                    value={newCompany.eligibility} onChange={e => setNewCompany({ ...newCompany, eligibility: e.target.value })}
                                    placeholder="CGPA > 8.0..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3.5 rounded-lg mt-2 shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                                <Plus size={18} /> Schedule Drive
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {isBulkUploading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in relative">
                        <button onClick={() => setIsBulkUploading(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-xl font-bold text-emerald-800 mb-2 flex items-center gap-2"><Upload size={24} /> Bulk Student Upload</h2>
                        <p className="text-sm text-slate-500 mb-6">Upload an Excel file to register multiple students. The file must have headers matching student fields (Name, Email, RollNo, Department, etc.).</p>

                        <div className="border-2 border-dashed border-emerald-100 bg-emerald-50 rounded-xl p-8 text-center hover:bg-emerald-100 transition cursor-pointer relative">
                            <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <FileSpreadsheet size={48} className="mx-auto text-emerald-400 mb-3" />
                            <p className="font-bold text-emerald-700">Click to upload Excel</p>
                            <p className="text-xs text-emerald-600 mt-1">.xlsx or .xls files supported</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-indigo-900 my-1">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                            <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Required Banner - Copied from Coordinator Dashboard logic */}
            {dashboardData.pendingFeedback > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                            <Star size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Pending Approvals</h3>
                            <p className="text-amber-700 text-sm">There are {dashboardData.pendingFeedback} feedback submissions waiting for review.</p>
                        </div>
                    </div>
                    <Link to="/coordinator/feedback" className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-amber-700 transition shadow-sm">
                        Review Now
                    </Link>
                </div>
            )}

            {/* Completed Drives Overview */}
            <div>
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Building size={20} /> Recruitment Drives Overview
                </h2>
                {dashboardData.companies === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                        No drives found in the system.
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Company</th>
                                    <th className="p-4">Department</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Eligibility</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {companiesList.map(company => (
                                    <tr key={company._id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-indigo-900">{company.name}</td>
                                        <td className="p-4 text-sm text-slate-600">{company.department}</td>
                                        <td className="p-4 text-sm text-slate-500">{company.visitDate}</td>
                                        <td className="p-4">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {company.eligibleStudents?.length || 0} Students
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${company.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {company.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 text-center text-slate-500 text-sm">
                            * Detailed company list management is available in Coordinator Dashboard.
                        </div>
                    </div>
                )}
            </div>

            {/* User Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-indigo-900">Registered Users</h2>
                        <p className="text-xs text-slate-500">Manage portal access</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 w-64">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input type="text" placeholder="Search users..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-5">User Profile</th>
                                <th className="p-5">Role</th>
                                <th className="p-5">Department</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-xs font-bold text-sky-600 border border-sky-100">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'coordinator' ? 'bg-teal-100 text-teal-700' :
                                                'bg-sky-100 text-sky-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-slate-600 font-medium">{user.department || 'N/A'}</td>
                                    <td className="p-5">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 transition">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
