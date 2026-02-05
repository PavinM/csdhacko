import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { auth } from "../lib/firebase";

export default function Header() {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const dashboardLink = userRole === 'admin' ? '/admin' : userRole === 'coordinator' ? '/coordinator' : '/student';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg h-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                {/* Branding Section */}
                <div className="flex items-center gap-4">
                    {/* Logo Container - White Circle for contrast */}
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/e/e0/Kongu_Engineering_College_Logo.png"
                            alt="KEC Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Text Branding - Adapted for Dark Mode */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide leading-none flex flex-col md:block">
                            <span className="text-kec-green">KONGU </span>
                            <span className="text-white">ENGINEERING COLLEGE</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="block h-[2px] w-8 bg-kec-light-blue rounded-full"></span>
                            <p className="text-[10px] md:text-xs font-bold text-kec-light-blue tracking-[0.2em] uppercase shadow-black drop-shadow-sm">
                                Transform Yourself
                            </p>
                            <span className="block h-[2px] w-8 bg-kec-light-blue rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* User Section & Nav */}
                {currentUser && (
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            <Link to={dashboardLink} className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
                        </nav>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/20">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-bold text-white leading-none">{currentUser.name}</span>
                                <span className="text-xs text-kec-green capitalize font-medium">{currentUser.role}</span>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full border border-white/10">
                                <User size={18} className="text-white/80" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 text-red-300 hover:text-red-200 transition-colors p-1"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
