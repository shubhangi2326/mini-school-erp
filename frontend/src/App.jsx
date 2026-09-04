import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<ProtectedRoute roles={['ADMIN', 'TEACHER']}><Attendance /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute roles={['ADMIN']}><Teachers /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute roles={['ADMIN']}><Students /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute roles={['ADMIN']}><Classes /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
