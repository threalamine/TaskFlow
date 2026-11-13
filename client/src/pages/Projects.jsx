import { useAuth } from '../hooks/useAuth';

function Projects() {
    const { user, logout } = useAuth();

    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">
                    <span className="brand-mark" />
                    TaskFlow
                </div>
                <div className="topbar-actions">
                    <span className="user-name">{user.name}</span>
                    <button className="ghost-btn" onClick={logout}>
                        Log out
                    </button>
                </div>
            </header>

            <main className="page-content">
                <h1>Hello, {user.name}</h1>
                <p>Your projects will appear here in the next step.</p>
            </main>
        </div>
    );
}

export default Projects;