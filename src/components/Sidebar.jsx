import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    Users,
    LogOut,
    ChevronRight
} from "lucide-react";
import kecLogo from "../assets/KEC.png";

export default function Sidebar() {
    const { userRole, currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
            role: 'coordinator',
            label: 'Dashboard',
            path: '/coordinator',
            icon: LayoutDashboard
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
            role: 'admin',
            label: 'System Admin',
            path: '/admin',
            icon: Users
        },
        {
            role: 'admin',
            label: 'Feedbacks',
            path: '/coordinator/feedback',
            icon: FileText
        },
    ];

    const relevantNav = navItems.filter(item => {
        return item.role === userRole;
    });

    return (
        <aside className="w-72 bg-[#003366] text-white min-h-screen fixed left-0 top-0 hidden md:flex flex-col shadow-2xl z-50">
            {/* Branding Header */}
            <div className="h-24 flex items-center gap-4 px-6 border-b border-white/10 bg-[#002855]">
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex-shrink-0 shadow-md">
                    <img src={kecLogo} alt="KEC" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">
                        KEC <span className="text-[#8cc63f]">PORTAL</span>
                    </h1>
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest font-medium mt-1">Transform Yourself</p>
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 py-6 border-b border-white/5 mx-2">
                <p className="text-xs font-semibold text-blue-300 uppercase mb-1">Welcome Back,</p>
                <h2 className="text-lg font-bold text-white truncate">{currentUser.name}</h2>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#8cc63f]/20 text-[#8cc63f] capitalize border border-[#8cc63f]/30">
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
