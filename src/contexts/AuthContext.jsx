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
        setLoading(true);
        console.log("AuthContext: Attempting login for", email);
        alert("DEBUG: Starting login process...");
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log("AuthContext: Login success, received data:", data);
            alert("DEBUG: API Success! Data Received: " + JSON.stringify(data).substring(0, 100));

            // Data should contain user info + token
            setCurrentUser(data);
            setUserRole(data.role);
            localStorage.setItem("user", JSON.stringify(data));

            // Verify immediate storage
            const check = localStorage.getItem("user");
            alert("DEBUG: Verify Storage: " + (check ? "SAVED OK" : "SAVE FAILED"));

            console.log("AuthContext: State updated. Role:", data.role);

            return true;
        } catch (error) {
            console.error("Login Error:", error.response?.data?.message || error.message);
            alert("DEBUG: Login API Failed: " + (error.response?.data?.message || error.message));
            throw new Error(error.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    // Signup Function (Public Registration)
    const signup = async (email, password, additionalData) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Google Login Function
    const googleLogin = async (token) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Create User (Admin/Coordinator feature - adds student/user without logging in)
    const createUser = async (email, password, additionalData) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Logout Function
    const logout = () => {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("user");
        // Optional: Call API to invalidate token if using server-side sessions
    };

    const value = {
        currentUser,
        userRole,
        loading,
        login,
        signup,
        googleLogin,
        createUser,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
