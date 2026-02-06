import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import kecLogo from "../assets/KEC.png";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { currentUser, userRole, login, signup } = useAuth();

    useEffect(() => {
        if (currentUser && userRole) {
            navigate(`/${userRole}`);
        }
    }, [currentUser, userRole, navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, {
                    name,
                    role,
                    department: role === "admin" ? null : department
                });
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-gray p-4 md:p-6 font-sans">
            <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[650px]">

                {/* Brand Side (Left) - Professional Academic Style */}
                <div className="hidden md:flex w-5/12 bg-gradient-to-br from-brand-green to-brand-blue relative flex-col justify-between p-10 text-white">
                    <div className="relative z-10">
                        {/* Logo Section */}
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-lg p-3 mx-auto md:mx-0 border border-white/30">
                            <img src={kecLogo} alt="KEC Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>

                        {/* College Name & Branding */}
                        <div className="mb-2">
                            <h1 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-md">
                                <span>KONGU</span> <br />
                                <span>ENGINEERING COLLEGE</span>
                            </h1>
                            <div className="h-1 w-20 bg-accent-orange mt-4 rounded-full"></div>
                        </div>

                        <h2 className="text-lg font-light tracking-widest uppercase opacity-90 mt-2">
                            Transform Yourself
                        </h2>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-inner">
                            <h3 className="font-bold text-lg mb-2 text-white">Placement Feedback Portal</h3>
                            <p className="text-blue-50 text-sm leading-relaxed">
                                "Your gateway to placement success. Share insights, gain knowledge, and prepare for your future career."
                            </p>
                        </div>
                    </div>

                    {/* Background Pattern Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-dark-blue/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full relative z-10">
                        {/* Role Selection Tabs - Hidden on Signup */}
                        {isLogin && (
                            <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                                {['student', 'coordinator', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRole(r)}
                                        className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${role === r
                                            ? "bg-white text-brand-dark-blue shadow-sm border border-gray-200"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-brand-dark-blue mb-2 capitalize">
                                {isLogin ? `${role} Login` : `Create Admin Account`}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {isLogin ? "Welcome back! Please enter your details." : "Join the community to access exclusive resources."}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 border-l-4 border-red-500 flex items-center shadow-sm">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs font-semibold mb-6 flex items-center gap-2">
                                <span>Note:</span> Students and Coordinators must be added by their respective supervisors.
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-brand-blue focus:bg-white outline-none transition-colors"
                                                placeholder="John Doe"
                                                value={name} onChange={(e) => setName(e.target.value)} required
                                            />
                                        </div>
                                    </div>

                                    {role !== 'admin' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Department</label>
                                            <input
                                                type="text"
                                                className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 focus:border-brand-blue focus:bg-white outline-none transition-colors"
                                                placeholder="CSE"
                                                value={department} onChange={(e) => setDepartment(e.target.value)} required
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-brand-blue focus:bg-white outline-none transition-colors"
                                        placeholder="student@kongu.edu"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-brand-blue focus:bg-white outline-none transition-colors"
                                        placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-accent-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                                >
                                    {isLogin ? "Sign In" : "Create Account"} <ChevronRight size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-6">
                            <p className="text-sm text-gray-600">
                                {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
                                <button
                                    onClick={() => {
                                        const newMode = !isLogin;
                                        setIsLogin(newMode);
                                        if (!newMode) setRole("admin"); // Force admin on signup
                                        else setRole("student"); // Default to student on login
                                    }}
                                    className="text-brand-blue font-bold hover:text-brand-green transition-colors"
                                >
                                    {isLogin ? "Sign up now" : "Log in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
