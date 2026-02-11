import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../lib/api";
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    Users,
    LogOut,
    ChevronRight,
    UserCog,
    Briefcase,
    Bell,
    X,
    MessageSquare
} from "lucide-react";
import kecLogo from "../assets/KEC.png";

export default function Sidebar() {
    const { userRole, currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [pendingEditRequests, setPendingEditRequests] = useState(0);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (userRole === 'coordinator') {
            fetchPendingCount();
        }
        fetchNotifications();

        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userRole]);

    const fetchPendingCount = async () => {
        try {
            const res = await api.get('/users/edit-requests?status=pending');
            setPendingEditRequests(res.data.length);
        } catch (error) {
            console.error("Error fetching pending edit requests:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.length); // Simplified: Assume all fetched are "unread" for this session
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!currentUser) return null;

    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            role: 'student',
            label: 'My Dashboard',
            path: '/student',
            icon: LayoutDashboard
        },
        {
            role: 'student',
            label: 'View Feedback',
            path: '/student/view-feedback',
            icon: FileText
        },
        {
            role: 'student',
            label: 'Placement Drives',
            path: '/drives',
            icon: Briefcase
        },
        {
            role: 'coordinator',
            label: 'Dashboard',
            path: '/coordinator',
            icon: LayoutDashboard
        },
        {
            role: 'coordinator',
            label: 'Placement Drives',
            path: '/drives',
            icon: Briefcase
        },
        {
            role: 'coordinator',
            label: 'Student Management',
            path: '/coordinator/students',
            icon: Users
        },
        {
            role: 'coordinator',
            label: 'Students\' Feedback',
            path: '/coordinator/feedback',
            icon: FileText
        },
        {
            role: 'coordinator',
            label: 'Feedback Repository',
            path: '/student/view-feedback',
            icon: MessageSquare
        },
        {
            role: 'coordinator',
            label: 'Student Edit Requests',
            path: '/coordinator/edit-requests',
            icon: UserCog,
            badge: 'pendingEditRequests'
        },
        {
            role: 'coordinator',
            label: 'Shared Resources',
            path: '/coordinator/resources',
            icon: CheckSquare
        },
        {
            role: 'admin',
            label: 'System Admin',
            path: '/admin',
            icon: Users
        },
        {
            role: 'admin',
            label: 'Placement Drives',
            path: '/drives',
            icon: Briefcase
        },
        {
            role: 'admin',
            label: 'Feedbacks',
            path: '/coordinator/feedback',
            icon: FileText
        },
        {
            role: 'admin',
            label: 'Feedback Repository',
            path: '/student/view-feedback',
            icon: MessageSquare
        },
    ];

    const relevantNav = navItems.filter(item => {
        return item.role === userRole;
    });

    return (
        <aside className="w-72 bg-[#003366] text-white min-h-screen fixed left-0 top-0 hidden md:flex flex-col shadow-2xl z-50">
            {/* Branding Header */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-white/10 bg-[#002855]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg p-1 flex-shrink-0 shadow-md">
                        <img src={kecLogo} alt="KEC" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg tracking-tight leading-none text-white">
                            KEC <span className="text-[#8cc63f]">PORTAL</span>
                        </h1>
                    </div>
                </div>

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-full hover:bg-white/10 transition relative text-blue-200 hover:text-white"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#002855] animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-[-100px] mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-slate-800 animate-fade-in-up origin-top-right">
                            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-sm text-[#003366]">Notifications</h3>
                                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-sm">
                                        <p>No new updates.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {notifications.map((notif, idx) => (
                                            <Link
                                                key={idx}
                                                to={notif.link}
                                                onClick={() => setShowNotifications(false)}
                                                className="block p-4 hover:bg-indigo-50 transition"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'drive' ? 'bg-blue-500' :
                                                        notif.type === 'feedback' ? 'bg-green-500' :
                                                            notif.type === 'alert' ? 'bg-red-500' : 'bg-slate-400'
                                                        }`}></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 mb-0.5">{notif.title}</p>
                                                        <p className="text-xs text-slate-500 leading-snug">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                                <Link to={userRole === 'student' ? '/student' : '/coordinator'} onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 py-6 border-b border-white/5 mx-2">
                <p className="text-xs font-semibold text-blue-300 uppercase mb-1">Welcome Back,</p>
                <h2 className="text-lg font-bold text-white truncate">{currentUser.name}</h2>
                <span className="inline-block mt-1 px-3 py-1 rounded-md text-xs font-bold bg-[#8cc63f]/20 text-[#8cc63f] capitalize border border-[#8cc63f]/30 tracking-wide">
                    {userRole}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Main Menu</p>

                {relevantNav.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive(item.path)
                            ? "bg-[#8cc63f] text-[#003366] shadow-lg font-bold translate-x-1"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={isActive(item.path) ? "text-[#003366]" : "text-blue-300 group-hover:text-white"} />
                            <span>{item.label}</span>
                            {item.badge === 'pendingEditRequests' && pendingEditRequests > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingEditRequests}
                                </span>
                            )}
                        </div>
                        {isActive(item.path) && <ChevronRight size={16} />}
                    </Link>
                ))}
            </nav>



            {/* Footer / Copyright */}
            <div className="p-4 border-t border-white/5 space-y-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-white/10 hover:text-red-200 rounded-xl transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:text-red-100" />
                    <span className="font-medium">Logout</span>
                </button>
                <div className="text-center text-[10px] text-blue-400/60">
                    &copy; 2026 Kongu Engineering College<br />All Rights Reserved.
                </div>
            </div>
        </aside>
    );
}
