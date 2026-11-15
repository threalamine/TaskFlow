import { useState } from 'react';
import Modal from './Modal.jsx';
import getErrorMessage from '../utils/getErrorMessage';
import { toDateInputValue } from '../utils/dates';

function TaskForm({ task, onSave, onDelete, onCancel }) {
    const [form, setForm] = useState({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: toDateInputValue(task.dueDate),
        completed: task.completed,
    });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);

        try {
            await onSave(task._id, { ...form, dueDate: form.dueDate || null });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setError('');
        setBusy(true);

        try {
            await onDelete(task._id);
        } catch (err) {
            setError(getErrorMessage(err));
            setConfirming(false);
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="field">
                <label htmlFor="task-title">Title</label>
                <input
                    id="task-title"
                    name="title"
                    type="text"
                    maxLength={200}
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="field">
                <label htmlFor="task-description">Description</label>
                <textarea
                    id="task-description"
                    name="description"
                    placeholder="Add more details…"
                    maxLength={2000}
                    value={form.description}
                    onChange={handleChange}
                />
            </div>

            <div className="field-row">
                <div className="field">
                    <label htmlFor="task-priority">Priority</label>
                    <select
                        id="task-priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="field">
                    <label htmlFor="task-due">Due date</label>
                    <input
                        id="task-due"
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <label className="check-row">
                <input
                    type="checkbox"
                    className="check"
                    name="completed"
                    checked={form.completed}
                    onChange={handleChange}
                />
                Mark as done
            </label>

            <div className="modal-actions split">
                {confirming ? (
                    <>
                        <span className="confirm-text">Delete this card?</span>
                        <div className="modal-actions-right">
                            <button
                                type="button"
                                className="ghost-btn"
                                onClick={() => setConfirming(false)}
                            >
                                Keep
                            </button>
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={handleDelete}
                                disabled={busy}
                            >
                                {busy ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="text-btn danger"
                            onClick={() => setConfirming(true)}
                        >
                            Delete
                        </button>
                        <div className="modal-actions-right">
                            <button type="button" className="ghost-btn" onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn" disabled={busy}>
                                {busy ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
}

function TaskModal({ task, onClose, onSave, onDelete }) {
    return (
        <Modal open={Boolean(task)} onClose={onClose} title="Edit card">
            {task && (
                <TaskForm
                    task={task}
                    onSave={onSave}
                    onDelete={onDelete}
                    onCancel={onClose}
                />
            )}
        </Modal>
    );
}

export default TaskModal;