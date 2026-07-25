import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const COLUMNS = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const EXCLUDED_USER_NAMES = ['test user'];

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
  });
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const didInit = useRef(false);
  const filterRef = useRef(null);

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

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const filtered = res.data.filter(
        (u) => !EXCLUDED_USER_NAMES.includes((u.name || '').trim().toLowerCase())
      );
      setUsers(filtered);
    } catch (err) {
      // Non-critical
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchTasks();
    fetchUsers();
  }, []);

  // Close the filter panel when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCreateModal = (status) => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: status || 'To Do',
      priority: 'Medium',
      dueDate: '',
      assignee: '',
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignee: task.assignee?._id || '',
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

    const payload = {
      ...formData,
      dueDate: formData.dueDate || null,
      assignee: formData.assignee || null,
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/tasks', payload);
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
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      setError('Could not update task status.');
      fetchTasks();
    }
  };

  const handlePriorityChange = async (task, newPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, priority: newPriority } : t))
    );
    try {
      await api.put(`/tasks/${task._id}`, { priority: newPriority });
    } catch (err) {
      setError('Could not update task priority.');
      fetchTasks();
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'Done') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterPriority('All');
    setFilterAssignee('All');
  };

  const activeFilterCount = [filterStatus, filterPriority, filterAssignee].filter(
    (v) => v !== 'All'
  ).length;

  const isFiltering = searchQuery.trim() !== '' || activeFilterCount > 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchesAssignee =
      filterAssignee === 'All' ||
      (filterAssignee === 'Unassigned' && !task.assignee) ||
      task.assignee?._id === filterAssignee;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

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

      <div className="board-toolbar">
        <input
          type="text"
          placeholder="Search by task name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="filter-dropdown-wrap" ref={filterRef}>
          <button
            type="button"
            className="filter-btn"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <FilterIcon />
            Filters
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-panel-group">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilters(false);
                  }}
                >
                  <option value="All">All</option>
                  {COLUMNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-panel-group">
                <label>Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => {
                    setFilterPriority(e.target.value);
                    setShowFilters(false);
                  }}
                >
                  <option value="All">All</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="filter-panel-group">
                <label>Assignee</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => {
                    setFilterAssignee(e.target.value);
                    setShowFilters(false);
                  }}
                >
                  <option value="All">All</option>
                  <option value="Unassigned">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button type="button" className="filter-clear-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {isFiltering && (
          <button type="button" className="clear-all-btn" onClick={clearFilters}>
            <ClearIcon /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="board-loading">Loading tasks...</p>
      ) : isFiltering && filteredTasks.length === 0 ? (
        <p className="board-loading">No tasks match your search/filters.</p>
      ) : (
        <div className="board-columns">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column);
            if (isFiltering && columnTasks.length === 0) return null;
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
                      <div className="task-card-top">
                        <h4>{task.title}</h4>
                      </div>

                      {task.description && <p>{task.description}</p>}

                      {(task.dueDate || task.assignee) && (
                        <div className="task-meta">
                          {task.dueDate && (
                            <span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}>
                              📅 {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.assignee && (
                            <span className="assignee-tag">👤 {task.assignee.name}</span>
                          )}
                        </div>
                      )}

                      <div className="task-card-controls">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          className="status-select"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>

                        <select
                          value={task.priority || 'Medium'}
                          onChange={(e) => handlePriorityChange(task, e.target.value)}
                          className={`priority-select priority-${(task.priority || 'Medium').toLowerCase()}`}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div className="task-card-footer">
                        <div className="task-card-actions">
                          <button onClick={() => openEditModal(task)} title="Edit task" className="icon-btn icon-btn-edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDelete(task._id)} title="Delete task" className="icon-btn icon-btn-delete">
                            <DeleteIcon />
                          </button>
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

              <div className="field-row">
                <div className="field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    {COLUMNS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleFormChange}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="field">
                  <label>Assignee</label>
                  <select name="assignee" value={formData.assignee} onChange={handleFormChange}>
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
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