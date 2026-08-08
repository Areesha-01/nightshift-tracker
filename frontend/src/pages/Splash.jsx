import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Ping the backend as soon as the app opens, so it's already
    // "awake" (Render free tier) by the time the user reaches Register/Login
    api.get('/').catch(() => {});

    const timer = setTimeout(() => {
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }, 7500);
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