import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dash-wrap">
      <div className="dash-card">
        <span className="auth-eyebrow">NightShift</span>
        <h2>Welcome, {user?.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>You're securely logged in.</p>
        <button onClick={handleLogout} className="logout-btn">Log out</button>
      </div>
    </div>
  );
}