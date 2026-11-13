import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';
import './Auth.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(form.email, form.password);
            navigate('/projects');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <div className="brand">
                    <span className="brand-mark" />
                    TaskFlow
                </div>

                <h1>Welcome back</h1>
                <p className="auth-subtitle">Log in to pick up where you left off.</p>

                {error && <div className="form-error">{error}</div>}

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Your password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button className="primary-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Logging in…' : 'Log in'}
                </button>

                <p className="auth-switch">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;