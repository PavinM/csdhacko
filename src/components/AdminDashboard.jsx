import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, auth } from "../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { Users, Building, BarChart2, MoreVertical, Search } from "lucide-react";

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

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-500' },
        { label: 'Departments', value: '3', icon: Building, color: 'bg-teal-500' },
        { label: 'Active Drives', value: '12', icon: BarChart2, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">System Administration</h1>
                <p className="text-gray-500 text-sm">Overview and User Management</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-gray-800 my-1">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                            <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                        </div>
                    </div>
                ))}
            </div>

            {/* User Table Card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">Registered Users</h2>
                        <p className="text-xs text-gray-500">Manage portal access</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 py-2 w-64">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input type="text" placeholder="Search users..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-5">User Profile</th>
                                <th className="p-5">Role</th>
                                <th className="p-5">Department</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-academic-blue/10 flex items-center justify-center text-xs font-bold text-academic-blue">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'coordinator' ? 'bg-teal-100 text-teal-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600 font-medium">{user.department || 'N/A'}</td>
                                    <td className="p-5">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 transition">
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
