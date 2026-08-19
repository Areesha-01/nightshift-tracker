import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Pending() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pending-wrap">
      <div className="pending-card">
        <span className="auth-eyebrow">NightShift</span>
        <h2 className="auth-title">Account Pending Approval</h2>
        <p className="pending-text">
          Hi {user?.name}, your account has been created but is waiting for an
          administrator to approve it. You'll be able to access the task
          board as soon as your account is verified.
        </p>
        <button onClick={handleLogout} className="logout-btn">Log out</button>
      </div>
    </div>
  );
}