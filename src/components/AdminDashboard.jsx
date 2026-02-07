import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api"; // MERN API
import * as XLSX from 'xlsx';
import { Users, Building, BarChart2, MoreVertical, Search, UserPlus, X, Star, FileCheck, CheckCircle, Plus, Upload, FileSpreadsheet, Trash2 } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState('');
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', department: '' });

    // New Company Form State
    const [newCompany, setNewCompany] = useState({
        name: '',
        visitDate: '',
        domain: '',
        roles: [''],
        salaryPackage: { min: '', max: '' },
        eligibility: {
            cgpaMin: '',
            cgpaMax: '',
            tenthMin: '',
            twelfthMin: ''
        }
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
            setNewCompany({
                name: '',
                visitDate: '',
                domain: '',
                roles: [''],
                salaryPackage: { min: '', max: '' },
                eligibility: { cgpaMin: '', cgpaMax: '', tenthMin: '', twelfthMin: '' }
            });
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



    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            alert("User deleted successfully");
        } catch (error) {
            console.error("Delete user error:", error);
            alert("Failed to delete user: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading system data...</div>;

    const stats = [
        { label: 'Pending Approvals', value: dashboardData.pendingFeedback, icon: Star, iconColor: 'text-amber-500', bgColor: 'bg-amber-500/10' },
        { label: 'Total Feedbacks', value: dashboardData.totalFeedback, icon: FileCheck, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-600/10' },
        { label: 'System Users', value: users.length, icon: Users, iconColor: 'text-sky-500', bgColor: 'bg-sky-500/10' },
        { label: 'Active Drives', value: dashboardData.companies, icon: BarChart2, iconColor: 'text-teal-500', bgColor: 'bg-teal-500/10' },
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-0 animate-fade-in relative">
                        {/* Header - Fixed */}
                        <div className="bg-[#1A237E] p-6 text-white shrink-0 relative">
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

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="add-company-form" onSubmit={handleAddCompany} className="space-y-5">
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
                                        <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Domain</label>
                                        <select
                                            required
                                            className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                            value={newCompany.domain} onChange={e => setNewCompany({ ...newCompany, domain: e.target.value })}
                                        >
                                            <option value="">Select Domain</option>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Software">Software</option>
                                            <option value="Both">Both</option>
                                        </select>
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
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Package (LPA)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number" step="0.1" min="0"
                                            className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                            value={newCompany.salaryPackage.min} onChange={e => setNewCompany({ ...newCompany, salaryPackage: { ...newCompany.salaryPackage, min: e.target.value } })}
                                            placeholder="Min (e.g. 10)"
                                        />
                                        <input
                                            type="number" step="0.1" min="0"
                                            className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                            value={newCompany.salaryPackage.max} onChange={e => setNewCompany({ ...newCompany, salaryPackage: { ...newCompany.salaryPackage, max: e.target.value } })}
                                            placeholder="Max (e.g. 15)"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Roles Offered</label>
                                    <div className="space-y-2">
                                        {newCompany.roles.map((role, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text" required
                                                    className="flex-1 border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                                    value={role}
                                                    onChange={e => {
                                                        const updatedRoles = [...newCompany.roles];
                                                        updatedRoles[index] = e.target.value;
                                                        setNewCompany({ ...newCompany, roles: updatedRoles });
                                                    }}
                                                    placeholder="e.g. SDE"
                                                />
                                                {newCompany.roles.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedRoles = newCompany.roles.filter((_, i) => i !== index);
                                                            setNewCompany({ ...newCompany, roles: updatedRoles });
                                                        }}
                                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setNewCompany({ ...newCompany, roles: [...newCompany.roles, ''] })}
                                            className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Add Role
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Eligibility Criteria</label>
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">CGPA Range</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="number" step="0.01" min="0" max="10"
                                                    className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#1A237E] outline-none transition bg-white text-sm"
                                                    value={newCompany.eligibility.cgpaMin}
                                                    onChange={e => setNewCompany({ ...newCompany, eligibility: { ...newCompany.eligibility, cgpaMin: e.target.value } })}
                                                    placeholder="Min (e.g. 7.0)"
                                                />
                                                <input
                                                    type="number" step="0.01" min="0" max="10"
                                                    className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#1A237E] outline-none transition bg-white text-sm"
                                                    value={newCompany.eligibility.cgpaMax}
                                                    onChange={e => setNewCompany({ ...newCompany, eligibility: { ...newCompany.eligibility, cgpaMax: e.target.value } })}
                                                    placeholder="Max (e.g. 10.0)"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">10th % (Min)</label>
                                                <input
                                                    type="number" step="0.01" min="0" max="100"
                                                    className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#1A237E] outline-none transition bg-white text-sm"
                                                    value={newCompany.eligibility.tenthMin}
                                                    onChange={e => setNewCompany({ ...newCompany, eligibility: { ...newCompany.eligibility, tenthMin: e.target.value } })}
                                                    placeholder="e.g. 75"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">12th % (Min)</label>
                                                <input
                                                    type="number" step="0.01" min="0" max="100"
                                                    className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#1A237E] outline-none transition bg-white text-sm"
                                                    value={newCompany.eligibility.twelfthMin}
                                                    onChange={e => setNewCompany({ ...newCompany, eligibility: { ...newCompany.eligibility, twelfthMin: e.target.value } })}
                                                    placeholder="e.g. 75"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl shrink-0">
                            <button type="submit" form="add-company-form" className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3.5 rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                                <Plus size={18} /> Schedule Drive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {isBulkUploading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in relative">
                        <button onClick={() => setIsBulkUploading(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-xl font-bold text-emerald-800 mb-2 flex items-center gap-2"><Upload size={24} /> Bulk Student Upload</h2>
                        <p className="text-sm text-slate-500 mb-6">Upload an Excel file to register or update students. Supported columns: <b>Name, Email, RollNo, Department, 10th %, 12th %, Current CGPA</b>.</p>

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
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <stat.icon size={24} className={stat.iconColor} />
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
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                            {users.filter(user =>
                                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No matches found for "{searchQuery}"
                                    </td>
                                </tr>
                            ) : (
                                users.filter(user =>
                                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map(user => (
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
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
