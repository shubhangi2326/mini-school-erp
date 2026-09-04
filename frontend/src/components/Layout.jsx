import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LayoutDashboard, Users, UserSquare2, BookOpen, CalendarCheck, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTeacherOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BookOpen size={28} />
          <span>Aelyx ERP</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          
          {isTeacherOrAdmin && (
            <Link to="/attendance" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}>
              <CalendarCheck size={20} /> Attendance
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/teachers" className={`nav-link ${location.pathname === '/teachers' ? 'active' : ''}`}>
                <UserSquare2 size={20} /> Teachers
              </Link>
              <Link to="/students" className={`nav-link ${location.pathname === '/students' ? 'active' : ''}`}>
                <Users size={20} /> Students
              </Link>
              <Link to="/classes" className={`nav-link ${location.pathname === '/classes' ? 'active' : ''}`}>
                <BookOpen size={20} /> Classes
              </Link>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            <div><strong>{user?.name}</strong></div>
            <div style={{ color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
