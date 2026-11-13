import { useState } from 'react';
import { createProject, updateProject } from '../api/projects';
import getErrorMessage from '../utils/getErrorMessage';

function ProjectForm({ project, onSaved, onCancel }) {
    const [form, setForm] = useState({
        title: project?.title ?? '',
        description: project?.description ?? '',
    });
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
            const saved = project
                ? await updateProject(project._id, form)
                : await createProject(form);

            onSaved(saved);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="field">
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Portfolio website"
                    maxLength={100}
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="field">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="What is this project about?"
                    maxLength={500}
                    value={form.description}
                    onChange={handleChange}
                />
            </div>

            <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

export default ProjectForm;