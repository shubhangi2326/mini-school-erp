import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', teacherId: '' });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users')
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data.filter(u => u.role === 'TEACHER'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/classes/${editingId}`, formData);
      } else {
        await api.post('/classes', formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', teacherId: '' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save class');
    }
  };

  const handleEdit = (cls) => {
    setFormData({ name: cls.name, teacherId: cls.teacherId || '' });
    setEditingId(cls.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class? This may fail if there are assigned students.')) {
      try {
        await api.delete(`/classes/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete class. Ensure no students are assigned to it first.');
      }
    }
  };

  const totalPages = Math.ceil(classes.length / rowsPerPage);
  const paginatedClasses = classes.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div>
      <div className="page-header">
        <h1>Classes</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ name: '', teacherId: '' }); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>In-Charge Teacher</th>
                <th>Total Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClasses.map(cls => (
                <tr key={cls.id}>
                  <td style={{ fontWeight: 500 }}>{cls.name}</td>
                  <td>{cls.teacher ? cls.teacher.name : <span style={{color: 'var(--text-muted)'}}>Unassigned</span>}</td>
                  <td>{cls._count.students}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={() => handleEdit(cls)} style={{ padding: '0.25rem 0.5rem' }}><Edit2 size={14}/></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(cls.id)} style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No classes found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={classes.length} rowsPerPage={rowsPerPage} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Class Name (e.g. Grade 6 - A)</label>
            <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Class Teacher</label>
            <select className="form-select" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
              <option value="">Select a Teacher (Optional)</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Class</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
