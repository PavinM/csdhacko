import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StudentDashboard from "./components/StudentDashboard";
import CoordinatorDashboard from "./components/CoordinatorDashboard";
import AdminDashboard from "./components/AdminDashboard";

function PrivateRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-academic-blue font-semibold">Loading Portal...</div>;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div className="text-center mt-20 text-red-600 font-bold">Access Denied</div>;
  }

  return children;
}

function Layout({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile state

  // Dont show layout on login
  if (location.pathname === '/login') return children;

  return (
    <div className="min-h-screen bg-academic-gray flex">
      {currentUser && <Sidebar mobileOpen={sidebarOpen} />}
      <div className="flex-1 flex flex-col min-w-0 transition-all md:pl-72">
        {currentUser && <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Redirect based on role
function DashboardRedirect() {
  const { userRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  if (userRole === 'admin') return <Navigate to="/admin" />;
  if (userRole === 'coordinator') return <Navigate to="/coordinator" />;
  return <Navigate to="/student" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />

            <Route path="/student" element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            } />

            <Route path="/coordinator" element={
              <PrivateRoute allowedRoles={['coordinator']}>
                <CoordinatorDashboard />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
