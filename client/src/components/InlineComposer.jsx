import { useState } from 'react';
import getErrorMessage from '../utils/getErrorMessage';

function InlineComposer({
    variant = 'card',
    triggerLabel,
    placeholder,
    submitLabel,
    onSubmit,
}) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const close = () => {
        setOpen(false);
        setValue('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const title = value.trim();
        if (!title) return;

        setSubmitting(true);
        setError('');

        try {
            await onSubmit(title);
            setValue('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') close();
    };

    if (!open) {
        return (
            <button
                className={variant === 'list' ? 'add-list' : 'add-card'}
                onClick={() => setOpen(true)}
            >
                {triggerLabel}
            </button>
        );
    }

    return (
        <form className={`composer composer-${variant}`} onSubmit={handleSubmit}>
            <input
                className="composer-input"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={variant === 'list' ? 100 : 200}
            />

            {error && <p className="composer-error">{error}</p>}

            <div className="composer-actions">
                <button
                    type="submit"
                    className="primary-btn small"
                    disabled={submitting || !value.trim()}
                >
                    {submitLabel}
                </button>
                <button type="button" className="text-btn" onClick={close}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default InlineComposer;