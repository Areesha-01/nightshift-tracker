import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }, 1900);
    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="splash-wrap">
      <div className="splash-content">
        <span className="splash-dot"></span>
        <h1 className="splash-title">NightShift</h1>
        <p className="splash-tagline">Team Task &amp; Bug Tracker</p>
      </div>
    </div>
  );
}