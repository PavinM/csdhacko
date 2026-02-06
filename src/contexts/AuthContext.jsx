import { createContext, useContext, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const cached = localStorage.getItem("authToken");
        return cached ? JSON.parse(cached) : null;
    });
    const [userRole, setUserRole] = useState(() => {
        const cached = localStorage.getItem("authToken");
        return cached ? JSON.parse(cached).role : null;
    });
    const [loading, setLoading] = useState(false);

    // Login Function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email), where("password", "==", password));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Invalid email or password");
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const fullUser = { uid: userDoc.id, ...userData };

            setCurrentUser(fullUser);
            setUserRole(userData.role);
            localStorage.setItem("authToken", JSON.stringify(fullUser));
            return true;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Signup Function
    const signup = async (email, password, additionalData) => {
        setLoading(true);
        try {
            // Check if user already exists
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                throw new Error("User already exists with this email");
            }

            // Create new user document
            const newUserRef = doc(collection(db, "users"));

            const newUser = {
                uid: newUserRef.id,
                email,
                password, // Note: Storing password as plain text for simplicity as requested
                ...additionalData,
                createdAt: serverTimestamp()
            };

            await setDoc(newUserRef, newUser);

            // Create local user object (serverTimestamp is not JSON serializable, so we use current date for local)
            const localUser = { ...newUser, createdAt: new Date().toISOString() };

            setCurrentUser(localUser);
            setUserRole(additionalData.role);
            localStorage.setItem("authToken", JSON.stringify(localUser));
            return true;

        } catch (error) {
            console.error("Signup Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Create User (Admin/Coordinator feature - does not log in)
    const createUser = async (email, password, additionalData) => {
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                throw new Error("User already exists with this email");
            }

            const newUserRef = doc(collection(db, "users"));
            const newUser = {
                uid: newUserRef.id,
                email,
                password,
                ...additionalData,
                createdAt: serverTimestamp()
            };

            await setDoc(newUserRef, newUser);
            return true;
        } catch (error) {
            console.error("Create User Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout Function
    const logout = () => {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("authToken");
    };

    const value = {
        currentUser,
        userRole,
        loading,
        login,
        signup,
        createUser,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
