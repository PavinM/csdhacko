import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, auth } from "../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { Users, Building, BarChart2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading system data...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Administration</h1>
                    <p className="text-gray-400">Overview and User Management</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:bg-white/5 transition">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-300"><Users size={24} /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{users.length}</h3>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Total Users</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:bg-white/5 transition">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-300"><Building size={24} /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">3</h3>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Departments</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:bg-white/5 transition">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-300"><BarChart2 size={24} /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">12</h3>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Drives this Year</p>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="glass-panel border border-white/10 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold text-gray-200 flex items-center gap-2"><Users size={18} /> User Directory</h2>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:text-white transition">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4 tracking-wide">Name</th>
                                <th className="p-4 tracking-wide">Email</th>
                                <th className="p-4 tracking-wide">Role</th>
                                <th className="p-4 tracking-wide">Department</th>
                                <th className="p-4 tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition">
                                    <td className="p-4 text-sm font-medium text-white">{user.name}</td>
                                    <td className="p-4 text-sm text-gray-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                user.role === 'coordinator' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400 font-mono">{user.department || '-'}</td>
                                    <td className="p-4"><span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 shadow-lg shadow-green-500/50"></span>Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
