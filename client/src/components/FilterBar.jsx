import './FilterBar.css';

function FilterBar({ filters, onChange, onClear, active, shown, total }) {
    const update = (name) => (e) => {
        onChange({ ...filters, [name]: e.target.value });
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape' && filters.search) {
            onChange({ ...filters, search: '' });
        }
    };

    return (
        <div className="filter-bar" role="search">
            <div className="search-box">
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <circle cx="7" cy="7" r="5" />
                    <path d="M11 11l3.5 3.5" />
                </svg>
                <input
                    type="search"
                    placeholder="Search cards…"
                    aria-label="Search cards"
                    value={filters.search}
                    onChange={update('search')}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>

            <label className="filter-select">
                <span>Priority</span>
                <select value={filters.priority} onChange={update('priority')}>
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </label>

            <label className="filter-select">
                <span>Status</span>
                <select value={filters.status} onChange={update('status')}>
                    <option value="all">All</option>
                    <option value="open">To do</option>
                    <option value="done">Done</option>
                    <option value="overdue">Overdue</option>
                </select>
            </label>

            {active && (
                <>
                    <span className="filter-count">
                        {shown} of {total} cards
                    </span>
                    <span className="filter-hint">
                        Card reordering is paused while filtering
                    </span>
                    <button className="text-btn" onClick={onClear}>
                        Clear
                    </button>
                </>
            )}
        </div>
    );
}

export default FilterBar;