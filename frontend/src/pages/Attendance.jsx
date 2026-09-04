import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import Pagination from '../components/Pagination';
import { Save, Check, X, Download } from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('MARK'); // MARK or HISTORY
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        if (user.role === 'TEACHER') {
          // If teacher, show only their assigned classes (or all classes if they can mark any, but prompt says "their own class")
          const theirClasses = res.data.filter(c => c.teacherId === user.id);
          setClasses(theirClasses);
          if (theirClasses.length > 0) setSelectedClass(theirClasses[0].id);
        } else {
          setClasses(res.data);
          if (res.data.length > 0) setSelectedClass(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
    if (selectedClass && viewMode === 'MARK') {
      fetchStudentsToMark();
    } else if (selectedClass && viewMode === 'HISTORY') {
      fetchHistory();
    }
  }, [selectedClass, date, viewMode]);

  const fetchStudentsToMark = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students?classId=${selectedClass}`);
      setStudents(res.data);
      // Also try to fetch today's attendance to pre-fill
      const histRes = await api.get(`/attendance/history?classId=${selectedClass}&date=${date}`);
      const existing = {};
      const validHistory = [];
      histRes.data.forEach(h => {
        if (h.date && new Date(h.date).toISOString().split('T')[0] === date) {
          existing[h.studentId] = h.status;
          validHistory.push(h);
        }
      });
      setHistory(validHistory);
      // Default to present if not marked
      const newRecords = {};
      res.data.forEach(s => {
        newRecords[s.id] = existing[s.id] || 'PRESENT';
      });
      setAttendanceRecords(newRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/history?classId=${selectedClass}&date=${date}`);
      // Strictly filter records on the frontend to ensure no old dates bleed through
      const filteredRecords = res.data.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === date;
      });
      setHistory(filteredRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (studentId) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const handleSave = async () => {
    const records = Object.keys(attendanceRecords).map(id => ({
      studentId: id,
      status: attendanceRecords[id]
    }));

    try {
      await api.post('/attendance', {
        classId: selectedClass,
        date,
        records
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance');
    }
  };

  const markTotalPages = Math.ceil(students.length / rowsPerPage);
  const paginatedStudents = students.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const historyTotalPages = Math.ceil(history.length / rowsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['Student Name', 'Roll Number', 'Date', 'Status'];
    const rows = history.map(record => {
      const d = new Date(record.date);
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
      return [
        `"${record.student?.name || 'Unknown Student'}"`,
        `"${record.student?.rollNumber || 'N/A'}"`,
        `="${formattedDate}"`,
        `"${record.status}"`
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const className = classes.find(c => c.id === selectedClass)?.name || 'Class';
    link.setAttribute('download', `Attendance_${className}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Attendance Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${viewMode === 'MARK' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('MARK')}>
            Mark Attendance
          </button>
          <button className={`btn ${viewMode === 'HISTORY' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('HISTORY')}>
            View History
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label">Select Class</label>
          <select className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
      ) : (
        <div className="card">
          {viewMode === 'MARK' ? (
            <>
              {students.length > 0 ? (
                <>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map(student => (
                          <tr key={student.id}>
                            <td>{student.rollNumber}</td>
                            <td style={{ fontWeight: 500 }}>{student.name}</td>
                            <td>{history.some(h => h.studentId === student.id) ? new Date(date).toLocaleDateString() : 'Not Marked'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={() => handleToggleAttendance(student.id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '20px',
                                  border: 'none',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  backgroundColor: attendanceRecords[student.id] === 'PRESENT' ? 'var(--success)' : 'var(--danger)',
                                  color: 'white',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                {attendanceRecords[student.id] === 'PRESENT' ? <><Check size={16}/> Present</> : <><X size={16}/> Absent</>}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalPages={markTotalPages} onPageChange={setCurrentPage} totalItems={students.length} rowsPerPage={rowsPerPage} />
                  </div>
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                      <Save size={20} /> Save Attendance
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No students found in this class.
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', padding: '0 1rem', paddingTop: '1rem' }}>
                <button className="btn btn-outline" onClick={handleExportCSV} disabled={history.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Export CSV
                </button>
              </div>
              <div className="table-container">
                <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map(record => (
                    <tr key={record.id}>
                      <td>{record.student?.rollNumber || 'N/A'}</td>
                      <td style={{ fontWeight: 500 }}>{record.student?.name || 'Unknown Student'}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: record.status === 'PRESENT' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: record.status === 'PRESENT' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No attendance records found for this date.</td></tr>
                  )}
                </tbody>
              </table>
              <Pagination currentPage={currentPage} totalPages={historyTotalPages} onPageChange={setCurrentPage} totalItems={history.length} rowsPerPage={rowsPerPage} />
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
