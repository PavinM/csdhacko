import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                setUserRole(user.role);
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    // Login Function
    const login = async (email, password) => {
        // setLoading(true); // REMOVED: Prevent app unmount
        console.log("AuthContext: Attempting login for", email);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log("AuthContext: Login success, received data:", data);

            // Data should contain user info + token
            setCurrentUser(data);
            // Normalize role to lowercase to prevent case-sensitivity issues in routing
            const safeRole = data.role ? data.role.toLowerCase() : 'student';
            setUserRole(safeRole);
            const storedData = { ...data, role: safeRole };
            localStorage.setItem("user", JSON.stringify(storedData));

            console.log("AuthContext: State updated. Role:", data.role);

            // Return queryable data for immediate usage
            return data;
        } catch (error) {
            console.error("Login Error:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Invalid email or password");
        }
        // finally { setLoading(false); } // REMOVED
    };

    // Signup Function (Public Registration)
    const signup = async (email, password, additionalData) => {
        // setLoading(true); // REMOVED
        try {
            const { data } = await api.post('/auth/register', {
                email,
                password,
                ...additionalData
            });

            setCurrentUser(data);
            setUserRole(data.role);
            localStorage.setItem("user", JSON.stringify(data));

            return true;
        } catch (error) {
            console.error("Signup Error:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to create account");
        }
        // finally { setLoading(false); } // REMOVED
    };

    // Google Login Function
    const googleLogin = async (token) => {
        // setLoading(true); // REMOVED
        try {
            const { data } = await api.post('/auth/google', { token });
            console.log("AuthContext: Google Login success", data);

            setCurrentUser(data);
            setUserRole(data.role);
            localStorage.setItem("user", JSON.stringify(data));

            return true;
        } catch (error) {
            console.error("Google Login Error:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Google Sign-In failed");
        }
        // finally { setLoading(false); } // REMOVED
    };

    // Create User (Admin/Coordinator feature - adds student/user without logging in)
    const createUser = async (email, password, additionalData) => {
        // setLoading(true); // REMOVED
        try {
            // This endpoint is protected, axios interceptor will handle token
            await api.post('/users', {
                email,
                password,
                ...additionalData
            });
            return true;
        } catch (error) {
            console.error("Create User Error:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to create user");
        }
        // finally { setLoading(false); } // REMOVED
    };

    // Update Local User Data (after profile edit)
    const updateUserProfile = (userData) => {
        setCurrentUser(userData);
        // Preserve the token or other fields if the backend response doesn't include them?
        // Usually login response has token, but profile update might just have user fields.
        // We should merge with existing localStorage data to be safe about tokens.
        const stored = JSON.parse(localStorage.getItem("user") || '{}');
        const updated = { ...stored, ...userData };

        localStorage.setItem("user", JSON.stringify(updated));
    };

    // Logout Function
    const logout = () => {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("user");
    };

    const value = {
        currentUser,
        userRole,
        loading,
        login,
        signup,
        googleLogin,
        createUser,
        updateUserProfile,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
