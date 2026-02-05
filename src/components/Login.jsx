import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ChevronRight } from "lucide-react";

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
                await signInWithEmailAndPassword(auth, email, password);
                navigate("/dashboard");
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

                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="mb-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/e/e0/Kongu_Engineering_College_Logo.png"
                            alt="KEC"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? "Welcome Back" : "Join KEC Portal"}
                    </h2>
                    <p className="text-gray-300 text-sm">
                        {isLogin ? "Sign in to access placement feedback." : "Create your account today."}
                    </p>
                </div>

                {error && <div className="bg-red-500/20 border border-red-500/50 p-3 mb-6 text-red-200 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-kec-light-blue outline-none transition"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white focus:bg-white/10 focus:border-kec-light-blue outline-none [&>option]:bg-gray-900"
                                    >
                                        <option value="student">Student</option>
                                        <option value="coordinator">Coordinator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {role !== 'admin' && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dept</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CSE"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:bg-white/10 focus:border-kec-light-blue outline-none transition"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="email"
                                placeholder="student@kongu.edu"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-kec-light-blue outline-none transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-kec-light-blue outline-none transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-kec-blue to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] border border-white/10"
                    >
                        {isLogin ? "Sign In" : "Create Account"} <ChevronRight size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        {isLogin ? "New to the portal?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-kec-green font-bold hover:underline hover:text-green-400 transition"
                        >
                            {isLogin ? "Register Now" : "Login Here"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
