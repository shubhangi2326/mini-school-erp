import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', password: '', classId: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users');
      setTeachers(res.data.filter(u => u.role === 'TEACHER'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, formData);
      } else {
        await api.post('/users', { ...formData, role: 'TEACHER' });
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', subject: '', password: '', classId: '' });
      setEditingId(null);
      fetchTeachers();
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save teacher');
    }
  };

  const handleEdit = (teacher) => {
    const teacherClass = classes.find(c => c.teacherId === teacher.id);
    setFormData({ 
      name: teacher.name, 
      email: teacher.email, 
      phone: teacher.phone || '', 
      subject: teacher.subject || '', 
      password: '',
      classId: teacherClass ? teacherClass.id : ''
    });
    setEditingId(teacher.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchTeachers();
      } catch (err) {
        alert('Failed to delete teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(t => {
    let match = true;
    if (filterSubject && t.subject !== filterSubject) match = false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!t.name?.toLowerCase().includes(query) && 
          !t.email?.toLowerCase().includes(query)) {
        match = false;
      }
    }
    return match;
  });

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div>
      <div className="page-header">
        <h1>Teachers</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: '200px' }}
            value={filterSubject}
            onChange={e => { setFilterSubject(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Subjects</option>
            {Array.from(new Set(teachers.map(t => t.subject).filter(Boolean))).map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="form-input" 
            style={{ width: '250px' }}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', subject: '', password: '', classId: '' }); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Teacher
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.map(teacher => (
                <tr key={teacher.id}>
                  <td style={{ fontWeight: 500 }}>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.subject || '-'}</td>
                  <td>{teacher.phone || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={() => handleEdit(teacher)} style={{ padding: '0.25rem 0.5rem' }}><Edit2 size={14}/></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(teacher.id)} style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No teachers found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredTeachers.length} rowsPerPage={rowsPerPage} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password {editingId && <span style={{fontSize:'0.75rem', fontWeight:'normal'}}>(leave blank to keep current)</span>}</label>
            <input type="password" className="form-input" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Class</label>
            <select className="form-select" required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
              <option value="">Select a class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.teacherId && c.teacherId !== editingId ? `(Currently assigned to ${c.teacher?.name || 'another teacher'})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Teacher</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
