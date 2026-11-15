import { formatDueDate, getDueStatus } from '../utils/dates';

const noop = () => { };

function TaskCard({
    task,
    onOpen = noop,
    onToggle = noop,
    dragHandleProps = {},
    overlay = false,
}) {
    const status = getDueStatus(task);
    const showMeta = task.dueDate || task.priority !== 'medium';

    return (
        <article
            className={`card${task.completed ? ' done' : ''}${overlay ? ' overlay' : ''
                }`}
            data-priority={task.priority}
        >
            <div className="card-top">
                <input
                    type="checkbox"
                    className="check"
                    checked={task.completed}
                    onChange={() => onToggle(task)}
                    aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                />
                <h3 className="card-title">
                    <button
                        className="card-open"
                        onClick={() => onOpen(task._id)}
                        {...dragHandleProps}
                    >
                        {task.title}
                    </button>
                </h3>
            </div>

            {showMeta && (
                <div className="card-meta">
                    {task.dueDate && (
                        <span className={`chip ${status}`}>
                            {formatDueDate(task.dueDate)}
                        </span>
                    )}
                    {task.priority !== 'medium' && (
                        <span className="chip">
                            {task.priority === 'high' ? 'High' : 'Low'}
                        </span>
                    )}
                </div>
            )}
        </article>
    );
}

export default TaskCard;