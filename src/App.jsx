import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Header from "./components/Header";
import StudentDashboard from "./components/StudentDashboard";
import CoordinatorDashboard from "./components/CoordinatorDashboard";
import AdminDashboard from "./components/AdminDashboard";

function PrivateRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div className="text-white text-center mt-20">Access Denied</div>;
  }

  return children;
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
        <div className="min-h-screen pt-24 bg-gray-900"> {/* Dark Background, padding for h-24 header */}
          <Header />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
