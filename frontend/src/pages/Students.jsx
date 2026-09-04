import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', rollNumber: '', guardianContact: '', classId: '' });
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fetchStudents = async () => {
    try {
      const url = filterClass ? `/students?classId=${filterClass}` : '/students';
      const res = await api.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    setIsClassesLoading(true);
    setClassesError(null);
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      setClassesError('Failed to load classes');
    } finally {
      setIsClassesLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchStudents();
  }, [filterClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', rollNumber: '', guardianContact: '', classId: '' });
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setFormData({ 
      name: student.name, 
      email: student.email || '',
      password: '',
      rollNumber: student.rollNumber, 
      guardianContact: student.guardianContact || '', 
      classId: student.classId 
    });
    setEditingId(student.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (s.name?.toLowerCase().includes(query) || 
            s.email?.toLowerCase().includes(query) || 
            s.rollNumber?.toLowerCase().includes(query));
  });
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select style={{ border: 'none', outline: 'none', background: 'transparent' }} value={filterClass} onChange={e => setFilterClass(e.target.value)} disabled={isClassesLoading || !!classesError}>
              <option value="">{isClassesLoading ? 'Loading...' : classesError ? 'Error loading' : 'All Classes'}</option>
              {!isClassesLoading && !classesError && classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <input 
            type="text" 
            placeholder="Search by name, email, roll no..." 
            className="form-input" 
            style={{ width: '250px' }}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', password: '', rollNumber: '', guardianContact: '', classId: '' }); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Guardian Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.rollNumber}</td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>{student.email || '-'}</td>
                  <td>{student.class ? student.class.name : '-'}</td>
                  <td>{student.guardianContact || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={() => handleEdit(student)} style={{ padding: '0.25rem 0.5rem' }}><Edit2 size={14}/></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(student.id)} style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredStudents.length} rowsPerPage={rowsPerPage} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password {editingId && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>(leave blank to keep)</span>}</label>
            <input type="password" className="form-input" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input type="text" className="form-input" required value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            {isClassesLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem 0' }}>Loading classes...</div>
            ) : classesError ? (
              <div style={{ color: 'red', fontSize: '0.9rem', padding: '0.5rem 0' }}>{classesError}</div>
            ) : (
              <select className="form-select" required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Guardian Contact</label>
            <input type="text" className="form-input" value={formData.guardianContact} onChange={e => setFormData({...formData, guardianContact: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
