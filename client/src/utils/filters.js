import { getDueStatus } from './dates';

export const DEFAULT_FILTERS = { search: '', priority: 'all', status: 'all' };

export const hasActiveFilters = (filters) =>
    filters.search.trim() !== '' ||
    filters.priority !== 'all' ||
    filters.status !== 'all';

export const matchesFilters = (task, filters) => {
    const query = filters.search.trim().toLowerCase();

    if (query) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inDescription = (task.description ?? '')
            .toLowerCase()
            .includes(query);

        if (!inTitle && !inDescription) return false;
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
    }

    if (filters.status === 'open' && task.completed) return false;
    if (filters.status === 'done' && !task.completed) return false;
    if (filters.status === 'overdue' && getDueStatus(task) !== 'overdue') {
        return false;
    }

    return true;
};