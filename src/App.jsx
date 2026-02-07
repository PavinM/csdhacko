import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import StudentDashboard from "./components/StudentDashboard";
import CoordinatorDashboard from "./components/CoordinatorDashboard";
import StudentManagement from "./components/StudentManagement";
import CoordinatorFeedback from "./components/CoordinatorFeedback";
import AdminDashboard from "./components/AdminDashboard";
import StudentFeedbackView from "./components/StudentFeedbackView";
import CoordinatorResources from "./components/CoordinatorResources";

function PrivateRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-academic-blue font-semibold">Loading Portal...</div>;

  if (!currentUser) {
    console.log("PrivateRoute: No currentUser");
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive role check
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(userRole?.toLowerCase())) {
    return (
      <div className="flex h-screen items-center justify-center bg-yellow-100 flex-col gap-4">
        <h1 className="text-3xl font-bold text-yellow-800">Access Denied: Role Mismatch</h1>
        <p className="text-lg">Your Role: <strong>{userRole}</strong></p>
        <p className="text-lg">Allowed Roles: <strong>{allowedRoles.join(', ')}</strong></p>
        <Link to="/login" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Back to Login</Link>
      </div>
    );
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
        {/* TopBar removed as requested */}
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

            <Route path="/student/view-feedback" element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentFeedbackView />
              </PrivateRoute>
            } />

            <Route path="/coordinator" element={
              <PrivateRoute allowedRoles={['coordinator', 'admin']}>
                <CoordinatorDashboard />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />

            {/* Coordinator Sub-routes */}
            <Route path="/coordinator/students" element={
              <PrivateRoute allowedRoles={['coordinator']}>
                <StudentManagement />
              </PrivateRoute>
            } />

            <Route path="/coordinator/feedback" element={
              <PrivateRoute allowedRoles={['coordinator', 'admin']}>
                <CoordinatorFeedback />
              </PrivateRoute>
            } />

            <Route path="/coordinator/resources" element={
              <PrivateRoute allowedRoles={['coordinator', 'admin']}>
                <CoordinatorResources />
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
