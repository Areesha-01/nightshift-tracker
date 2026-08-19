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

export default function AdminDashboard() {
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

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Comments
  const [newComment, setNewComment] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentsTask, setCommentsTask] = useState(null);

  const didInit = useRef(false);
  const filterRef = useRef(null);

  // Pending user approvals
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showPendingPanel, setShowPendingPanel] = useState(true);

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

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/users/pending');
      setPendingUsers(res.data);
    } catch (err) {
      // Non-critical
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/verify`);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      fetchUsers();
    } catch (err) {
      setError('Could not approve user.');
    }
  };

  const handleRejectUser = async (userId) => {
    if (!window.confirm('Reject this user? Their account will be permanently deleted.')) return;
    try {
      await api.delete(`/users/${userId}/reject`);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError('Could not reject user.');
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
    fetchPendingUsers();
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
    setNewComment('');
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
    setNewComment('');
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
    setNewComment('');
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

  // Drag-and-drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTaskId(task._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (e, column) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column) setDragOverColumn(column);
  };

  const handleColumnDragLeave = (column) => {
    if (dragOverColumn === column) setDragOverColumn(null);
  };

  const handleDrop = (e, column) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    const task = tasks.find((t) => t._id === taskId);
    setDragOverColumn(null);
    setDraggedTaskId(null);
    if (task && task.status !== column) {
      handleStatusChange(task, column);
    }
  };

  const openCommentsPopup = (task) => {
    setNewComment('');
    setCommentsTask(task);
  };

  const closeCommentsPopup = () => {
    setCommentsTask(null);
    setNewComment('');
  };

  const handleAddComment = async (targetTask, isPopup) => {
    if (!newComment.trim() || !targetTask) return;
    setCommentSaving(true);
    try {
      const res = await api.post(`/tasks/${targetTask._id}/comments`, { text: newComment });
      setTasks((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
      if (isPopup) {
        setCommentsTask(res.data);
      } else {
        setEditingTask(res.data);
      }
      setNewComment('');
    } catch (err) {
      setError('Could not add comment.');
    } finally {
      setCommentSaving(false);
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
          <span className="auth-eyebrow">NightShift · Admin</span>
          <h2 className="board-title">Welcome, {user?.name}</h2>
        </div>
        <div className="board-header-actions">
          <button onClick={() => openCreateModal()} className="add-task-btn">+ Add Task</button>
          <button onClick={handleLogout} className="logout-btn">Log out</button>
        </div>
      </header>

      {error && <div className="auth-error board-error">{error}</div>}

      {pendingUsers.length > 0 && (
        <div className="admin-panel">
          <button
            type="button"
            className="admin-panel-toggle"
            onClick={() => setShowPendingPanel((prev) => !prev)}
          >
            {pendingUsers.length} account{pendingUsers.length > 1 ? 's' : ''} awaiting approval
            <span className="admin-panel-arrow">{showPendingPanel ? '▲' : '▼'}</span>
          </button>

          {showPendingPanel && (
            <div className="admin-panel-list">
              {pendingUsers.map((pu) => (
                <div className="admin-panel-item" key={pu._id}>
                  <div>
                    <span className="admin-panel-name">{pu.name}</span>
                    <span className="admin-panel-email">{pu.email}</span>
                  </div>
                  <div className="admin-panel-actions">
                    <button
                      type="button"
                      className="admin-approve-btn"
                      onClick={() => handleApproveUser(pu._id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="admin-reject-btn"
                      onClick={() => handleRejectUser(pu._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

                <div
                  className={`board-column-body ${dragOverColumn === column ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleColumnDragOver(e, column)}
                  onDragLeave={() => handleColumnDragLeave(column)}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  {columnTasks.length === 0 && (
                    <p className="empty-column">
                      {dragOverColumn === column && draggedTaskId ? 'Drop here' : 'No tasks yet'}
                    </p>
                  )}

                  {columnTasks.map((task) => (
                    <div
                      className={`task-card ${draggedTaskId === task._id ? 'dragging' : ''} ${isFiltering ? 'drag-disabled' : ''}`}
                      key={task._id}
                      draggable={!isFiltering}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-card-top">
                        <h4>{task.title}</h4>
                      </div>

                      {task.description && <p>{task.description}</p>}

                      {(task.dueDate || task.assignee || (task.comments && task.comments.length > 0)) && (
                        <div className="task-meta">
                          {task.dueDate && (
                            <span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}>
                              📅 {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.assignee && (
                            <span className="assignee-tag">👤 {task.assignee.name}</span>
                          )}
                          {task.comments && task.comments.length > 0 && (
                            <button
                              type="button"
                              className="comment-count-tag"
                              onClick={() => openCommentsPopup(task)}
                            >
                              💬 {task.comments.length}
                            </button>
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

            {editingTask && (
              <div className="comments-section">
                <label>Comments</label>
                <div className="comments-list">
                  {editingTask.comments && editingTask.comments.length > 0 ? (
                    editingTask.comments.map((c, idx) => (
                      <div className="comment-item" key={c._id || idx}>
                        <span className="comment-author">{c.commentedBy?.name || 'Unknown'}</span>
                        <span className="comment-text">{c.text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet.</p>
                  )}
                </div>
                <div className="comment-input-row">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(editingTask, false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="comment-post-btn"
                    onClick={() => handleAddComment(editingTask, false)}
                    disabled={commentSaving || !newComment.trim()}
                  >
                    {commentSaving ? '...' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {commentsTask && (
        <div className="modal-overlay" onClick={closeCommentsPopup}>
          <div className="modal-card comments-popup-card" onClick={(e) => e.stopPropagation()}>
            <h3>Comments</h3>
            <p className="comments-popup-task-title">{commentsTask.title}</p>

            <div className="comments-list">
              {commentsTask.comments && commentsTask.comments.length > 0 ? (
                commentsTask.comments.map((c, idx) => (
                  <div className="comment-item" key={c._id || idx}>
                    <span className="comment-author">{c.commentedBy?.name || 'Unknown'}</span>
                    <span className="comment-text">{c.text}</span>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet.</p>
              )}
            </div>

            <div className="comment-input-row">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment(commentsTask, true);
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="comment-post-btn"
                onClick={() => handleAddComment(commentsTask, true)}
                disabled={commentSaving || !newComment.trim()}
              >
                {commentSaving ? '...' : 'Post'}
              </button>
            </div>

            <button type="button" className="modal-cancel-btn comments-popup-close-btn" onClick={closeCommentsPopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}