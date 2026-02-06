import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { Users, Building, BarChart2, MoreVertical, Search, UserPlus, X } from "lucide-react";

export default function AdminDashboard() {
    const { currentUser, createUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', department: '' });

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
        } catch (error) {
            console.error("Error fetching users:", error);
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
            fetchUsers(); // Refresh list
            alert("Coordinator created successfully!");
        } catch (error) {
            alert("Error creating user: " + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading system data...</div>;

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'bg-sky-500' },
        { label: 'Departments', value: '3', icon: Building, color: 'bg-teal-500' },
        { label: 'Active Drives', value: '12', icon: BarChart2, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-900">System Administration</h1>
                    <p className="text-slate-500 text-sm">Overview and User Management</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md"
                >
                    <UserPlus size={18} /> New Coordinator
                </button>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
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
