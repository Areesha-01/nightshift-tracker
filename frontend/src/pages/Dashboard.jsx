import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Comments
  const [newComment, setNewComment] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentsTask, setCommentsTask] = useState(null);

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
      setUsers(res.data);
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

  const openCommentsPopup = (task) => {
    setNewComment('');
    setCommentsTask(task);
  };

  const closeCommentsPopup = () => {
    setCommentsTask(null);
    setNewComment('');
  };

  const handleAddComment = async (targetTask) => {
    if (!newComment.trim() || !targetTask) return;
    setCommentSaving(true);
    try {
      const res = await api.post(`/tasks/${targetTask._id}/comments`, { text: newComment });
      setTasks((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
      setCommentsTask(res.data);
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
    setFilterAssignee('All');
  };

  const activeFilterCount = [filterStatus, filterAssignee].filter((v) => v !== 'All').length;
  const isFiltering = searchQuery.trim() !== '' || activeFilterCount > 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesAssignee =
      filterAssignee === 'All' ||
      (filterAssignee === 'Unassigned' && !task.assignee) ||
      task.assignee?._id === filterAssignee;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  return (
    <div className="board-page">
      <header className="board-header">
        <div>
          <span className="auth-eyebrow">NightShift</span>
          <h2 className="board-title">Welcome, {user?.name}</h2>
        </div>
        <div className="board-header-actions">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
                    handleAddComment(commentsTask);
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="comment-post-btn"
                onClick={() => handleAddComment(commentsTask)}
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