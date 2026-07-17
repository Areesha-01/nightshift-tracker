import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password rules
  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Strength score: count of passed checks (0-4)
  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (formData.password.length === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore <= 3) return 'Medium';
    return 'Strong';
  };

  const getStrengthClass = () => {
    if (formData.password.length === 0) return '';
    if (strengthScore <= 1) return 'weak';
    if (strengthScore <= 3) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet the required conditions');
      return;
    }

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="auth-eyebrow">NightShift</span>
        <h2 className="auth-title">Create your account</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {formData.password.length > 0 && (
              <>
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <span className={`segment ${strengthScore >= 1 ? `filled ${getStrengthClass()}` : ''}`}></span>
                    <span className={`segment ${strengthScore >= 2 ? `filled ${getStrengthClass()}` : ''}`}></span>
                    <span className={`segment ${strengthScore >= 3 ? `filled ${getStrengthClass()}` : ''}`}></span>
                    <span className={`segment ${strengthScore >= 4 ? `filled ${getStrengthClass()}` : ''}`}></span>
                  </div>
                  <span className={`password-strength-label ${getStrengthClass()}`}>
                    {getStrengthLabel()}
                  </span>
                </div>

                <ul className="password-checklist">
                  <li className={passwordChecks.length ? 'valid' : 'invalid'}>
                    {passwordChecks.length ? '✅' : '⬜'} At least 8 characters
                  </li>
                  <li className={passwordChecks.upper ? 'valid' : 'invalid'}>
                    {passwordChecks.upper ? '✅' : '⬜'} One uppercase letter (A-Z)
                  </li>
                  <li className={passwordChecks.lower ? 'valid' : 'invalid'}>
                    {passwordChecks.lower ? '✅' : '⬜'} One lowercase letter (a-z)
                  </li>
                  <li className={passwordChecks.number ? 'valid' : 'invalid'}>
                    {passwordChecks.number ? '✅' : '⬜'} One number (0-9)
                  </li>
                </ul>
              </>
            )}
          </div>

          <button type="submit" className="auth-submit">Register</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}