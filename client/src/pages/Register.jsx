import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';
import './Auth.css';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '' });
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
            await register(form.name, form.email, form.password);
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

                <h1>Create your account</h1>
                <p className="auth-subtitle">Organize your work, one card at a time.</p>

                {error && <div className="form-error">{error}</div>}

                <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        autoComplete="name"
                        minLength={2}
                        maxLength={50}
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

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
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button className="primary-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Create account'}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;