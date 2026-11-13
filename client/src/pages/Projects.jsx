import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Modal from '../components/Modal.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import { fetchProjects, deleteProject } from '../api/projects';
import getErrorMessage from '../utils/getErrorMessage';
import './Projects.css';

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formState, setFormState] = useState({ open: false, project: null });

    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setProjects(await fetchProjects());
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const openCreate = () => setFormState({ open: true, project: null });
    const openEdit = (project) => setFormState({ open: true, project });
    const closeForm = () => setFormState((state) => ({ ...state, open: false }));

    const handleSaved = (saved) => {
        setProjects((prev) =>
            prev.some((p) => p._id === saved._id)
                ? prev.map((p) => (p._id === saved._id ? saved : p))
                : [saved, ...prev]
        );
        closeForm();
    };

    const askDelete = (project) => {
        setDeleteError('');
        setToDelete(project);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        setDeleteError('');

        try {
            await deleteProject(toDelete._id);
            setProjects((prev) => prev.filter((p) => p._id !== toDelete._id));
            setToDelete(null);
        } catch (err) {
            setDeleteError(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    let content;

    if (loading) {
        content = <p>Loading projects…</p>;
    } else if (projects.length === 0) {
        content = (
            <div className="empty-state">
                <h2>No projects yet</h2>
                <p>Create your first project to start organizing your work.</p>
                <button className="primary-btn" onClick={openCreate}>
                    + New project
                </button>
            </div>
        );
    } else {
        content = (
            <div className="project-grid">
                {projects.map((project) => (
                    <article className="project-card" key={project._id}>
                        <span className="project-badge">
                            {project.title.charAt(0).toUpperCase()}
                        </span>

                        <div>
                            <h2 className="project-title">
                                <Link className="project-link" to={`/projects/${project._id}`}>
                                    {project.title}
                                </Link>
                            </h2>
                            {project.description && (
                                <p className="project-desc">{project.description}</p>
                            )}
                        </div>

                        <div className="project-footer">
                            <span className="project-date">
                                {formatDate(project.createdAt)}
                            </span>
                            <div className="project-actions">
                                <button className="text-btn" onClick={() => openEdit(project)}>
                                    Edit
                                </button>
                                <button
                                    className="text-btn danger"
                                    onClick={() => askDelete(project)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        );
    }

    return (
        <div className="app">
            <Topbar />

            <main className="page-content">
                <div className="projects-header">
                    <div>
                        <h1>Your projects</h1>
                        {!loading && (
                            <p>
                                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                            </p>
                        )}
                    </div>
                    <button className="primary-btn" onClick={openCreate}>
                        + New project
                    </button>
                </div>

                {error && <div className="form-error">{error}</div>}

                {content}
            </main>

            <Modal
                open={formState.open}
                onClose={closeForm}
                title={formState.project ? 'Edit project' : 'New project'}
            >
                <ProjectForm
                    project={formState.project}
                    onSaved={handleSaved}
                    onCancel={closeForm}
                />
            </Modal>

            <Modal
                open={Boolean(toDelete)}
                onClose={() => setToDelete(null)}
                title="Delete project?"
            >
                {toDelete && (
                    <>
                        <p className="modal-text">
                            “{toDelete.title}” and all its lists and tasks will be permanently
                            deleted. This can’t be undone.
                        </p>

                        {deleteError && <div className="form-error">{deleteError}</div>}

                        <div className="modal-actions">
                            <button className="ghost-btn" onClick={() => setToDelete(null)}>
                                Cancel
                            </button>
                            <button
                                className="danger-btn"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default Projects;