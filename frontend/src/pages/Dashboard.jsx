import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Users, UserSquare2, BookOpen, CalendarCheck, CheckCircle, XCircle, Clock, User as UserIcon, Mail, Phone, Hash } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [adminStats, setAdminStats] = useState(null);
  
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user.role === 'STUDENT') {
          const [profileRes, statsRes, historyRes] = await Promise.all([
            api.get('/student/profile'),
            api.get('/student/attendance/stats'),
            api.get('/student/attendance')
          ]);
          setStudentProfile(profileRes.data);
          setStudentStats(statsRes.data);
          setStudentHistory(historyRes.data);
        } else {
          const res = await api.get('/dashboard/stats');
          setAdminStats(res.data);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data', err);
        const errMsg = err.response?.data?.error || 'Failed to load data. Please check your connection.';
        setError(errMsg);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  if (user?.role === 'STUDENT' && studentProfile && studentStats && studentHistory) {
    return (
      <div>
        <div className="page-header">
          <h1>Student Dashboard</h1>
        </div>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={20} /> My Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Name</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{studentProfile.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Roll Number</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={16} color="var(--text-muted)"/> {studentProfile.rollNumber}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Class</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="var(--text-muted)"/> {studentProfile.class}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Email</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--text-muted)"/> {studentProfile.email}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Guardian Contact</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--text-muted)"/> {studentProfile.guardianContact}
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '1.5rem' }}>Attendance Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><CalendarCheck size={24} /></div>
            <div>
              <div className="stat-value">{studentStats.totalDays}</div>
              <div className="stat-label">Total Days</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)' }}><CheckCircle size={24} /></div>
            <div>
              <div className="stat-value">{studentStats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}><XCircle size={24} /></div>
            <div>
              <div className="stat-value">{studentStats.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Clock size={24} /></div>
            <div>
              <div className="stat-value">{studentStats.percentage}%</div>
              <div className="stat-label">Attendance Percentage</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Attendance Distribution</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            {studentStats.totalDays > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Present', value: studentStats.present },
                      { name: 'Absent', value: studentStats.absent }
                    ]}
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={100} 
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="var(--success)" />
                    <Cell fill="var(--danger)" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No data to display chart.</div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>My Attendance History</h2>
          {studentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No attendance records found.
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentHistory.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.class}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: record.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: record.status === 'PRESENT' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin/Teacher Dashboard
  if (adminStats) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard Overview</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div>
              <div className="stat-value">{adminStats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon"><UserSquare2 size={24} /></div>
            <div>
              <div className="stat-value">{adminStats.totalTeachers}</div>
              <div className="stat-label">Total Teachers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><BookOpen size={24} /></div>
            <div>
              <div className="stat-value">{adminStats.totalClasses}</div>
              <div className="stat-label">Total Classes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><CalendarCheck size={24} /></div>
            <div>
              <div className="stat-value">
                {adminStats.todayAttendance.totalMarked > 0 
                  ? `${adminStats.todayAttendance.present} / ${adminStats.todayAttendance.totalMarked}`
                  : '0'}
              </div>
              <div className="stat-label">Today's Attendance (Present/Marked)</div>
            </div>
          </div>
        </div>

        {adminStats.classWiseAttendance && adminStats.classWiseAttendance.length > 0 && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2>Class-wise Attendance</h2>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminStats.classWiseAttendance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => [`${value}%`, 'Attendance']} />
                  <Bar dataKey="percentage" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Welcome to Aelyx ERP</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            This is a simplified School Management System where administrators can manage staff, 
            students, and classes, while teachers can effortlessly mark attendance for their assigned classes.
            Use the sidebar navigation to explore the different modules.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
