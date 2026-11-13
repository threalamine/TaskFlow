import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Topbar.css';

function Topbar() {
    const { user, logout } = useAuth();

    return (
        <header className="topbar">
            <Link to="/projects" className="brand">
                <span className="brand-mark" />
                TaskFlow
            </Link>

            <div className="topbar-actions">
                <span className="user-name">{user.name}</span>
                <button className="ghost-btn" onClick={logout}>
                    Log out
                </button>
            </div>
        </header>
    );
}

export default Topbar;