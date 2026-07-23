import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = creating new
  const [formData, setFormData] = useState({ title: '', description: '', status: 'To Do' });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError('Could not load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = (status) => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: status || 'To Do' });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      await fetchTasks();
      closeModal();
    } catch (err) {
      setError('Could not save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError('Could not delete task. Please try again.');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      setError('Could not update task status.');
      fetchTasks(); // revert on failure
    }
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <div>
          <span className="auth-eyebrow">NightShift</span>
          <h2 className="board-title">Welcome, {user?.name}</h2>
        </div>
        <div className="board-header-actions">
          <button onClick={() => openCreateModal()} className="add-task-btn">+ Add Task</button>
          <button onClick={handleLogout} className="logout-btn">Log out</button>
        </div>
      </header>

      {error && <div className="auth-error board-error">{error}</div>}

      {loading ? (
        <p className="board-loading">Loading tasks...</p>
      ) : (
        <div className="board-columns">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column);
            return (
              <div className="board-column" key={column}>
                <div className="board-column-header">
                  <span>{column}</span>
                  <span className="task-count">{columnTasks.length}</span>
                </div>

                <div className="board-column-body">
                  {columnTasks.length === 0 && (
                    <p className="empty-column">No tasks yet</p>
                  )}

                  {columnTasks.map((task) => (
                    <div className="task-card" key={task._id}>
                      <h4>{task.title}</h4>
                      {task.description && <p>{task.description}</p>}

                      <div className="task-card-footer">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          className="status-select"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>

                        <div className="task-card-actions">
                          <button onClick={() => openEditModal(task)} title="Edit">✏️</button>
                          <button onClick={() => handleDelete(task._id)} title="Delete">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="add-task-column-btn" onClick={() => openCreateModal(column)}>
                  + Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  {COLUMNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="modal-cancel-btn">Cancel</button>
                <button type="submit" className="auth-submit modal-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}