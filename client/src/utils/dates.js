export const toDateInputValue = (iso) => (iso ? iso.slice(0, 10) : '');

export const formatDueDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });

const localDateString = (date) => date.toLocaleDateString('en-CA');

export const getDueStatus = (task) => {
    if (!task.dueDate || task.completed) return '';

    const due = task.dueDate.slice(0, 10);
    const today = new Date();
    const soonLimit = new Date();
    soonLimit.setDate(soonLimit.getDate() + 2);

    if (due < localDateString(today)) return 'overdue';
    if (due <= localDateString(soonLimit)) return 'soon';

    return '';
};