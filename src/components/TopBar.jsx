import { useAuth } from "../contexts/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function TopBar({ toggleSidebar }) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    if (!currentUser) return null;

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 ml-0 md:ml-64 transition-all w-full md:w-[calc(100%-16rem)]">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-academic-blue">
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-semibold text-gray-700 hidden sm:block">
                    Welcome, <span className="text-academic-blue">{currentUser.name}</span>
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </div>
    );
}
