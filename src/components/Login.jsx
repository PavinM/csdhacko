import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ChevronRight } from "lucide-react";
import kecLogo from "../assets/KEC.png"; // Importing local asset

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("student");
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Direct Redirect: Fetch role immediately to avoid race conditions
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const targetRole = userData.role || 'student';
                    navigate(`/${targetRole}`);
                } else {
                    // Fallback if no data exists
                    navigate("/student");
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email,
                    name,
                    role,
                    department: role === "admin" ? null : department,
                    createdAt: new Date()
                });

                // Navigate directly to the selected role dashboard
                navigate(`/${role}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans">
            <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[650px]">

                {/* Brand Side (Left) - Professional Academic Style */}
                <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#003366] to-[#002244] relative flex-col justify-between p-10 text-white">
                    <div className="relative z-10">
                        {/* Logo Section */}
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg p-3 mx-auto md:mx-0">
                            <img src={kecLogo} alt="KEC Logo" className="w-full h-full object-contain" />
                        </div>

                        {/* College Name & Branding */}
                        <div className="mb-2">
                            <h1 className="text-3xl font-extrabold tracking-wide leading-tight">
                                <span className="text-[#8cc63f]">KONGU</span> <br />
                                <span>ENGINEERING COLLEGE</span>
                            </h1>
                            <div className="h-1 w-20 bg-[#8cc63f] mt-4 rounded-full"></div>
                        </div>

                        <h2 className="text-lg font-light tracking-widest uppercase opacity-90 mt-2">
                            Transform Yourself
                        </h2>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                            <h3 className="font-bold text-lg mb-2 text-[#8cc63f]">Placement Feedback Portal</h3>
                            <p className="text-gray-200 text-sm leading-relaxed">
                                "Your gateway to placement success. Share insights, gain knowledge, and prepare for your future career."
                            </p>
                        </div>
                    </div>

                    {/* Background Pattern Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8cc63f]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full relative z-10">
                        {/* Role Selection Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                            {['student', 'coordinator', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${role === r
                                            ? "bg-white text-[#003366] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                                {isLogin ? `${role} Login` : `Create ${role} Account`}
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

                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-[#003366] focus:bg-white outline-none transition-colors"
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
                                                className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 focus:border-[#003366] focus:bg-white outline-none transition-colors"
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
                                        className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-[#003366] focus:bg-white outline-none transition-colors"
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
                                        className="w-full border-b-2 border-gray-200 bg-gray-50/50 rounded-t-lg px-4 py-2.5 pl-10 focus:border-[#003366] focus:bg-white outline-none transition-colors"
                                        placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                                >
                                    {isLogin ? "Sign In" : "Create Account"} <ChevronRight size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-6">
                            <p className="text-sm text-gray-600">
                                {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-[#003366] font-bold hover:text-[#8cc63f] transition-colors"
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
