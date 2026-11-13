const createError = require('./createError');

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);

    return { page, limit, skip: (page - 1) * limit };
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDate = (value, name) => {
    const date = typeof value === 'string' ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
        throw createError(`${name} must be a valid date`, 400);
    }

    return date;
};

module.exports = { getPagination, escapeRegex, parseDate };