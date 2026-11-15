import { useState } from 'react';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard.jsx';
import SortableTask from './SortableTask.jsx';
import InlineComposer from './InlineComposer.jsx';

function ListColumn({
    list,
    tasks,
    totalCount,
    filtering,
    onRename,
    onDelete,
    onAddTask,
    onOpenTask,
    onToggleTask,
}) {
    const [editing, setEditing] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: list._id, data: { type: 'list' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const commitRename = (e) => {
        const value = e.target.value.trim();

        setEditing(false);

        if (value && value !== list.title) {
            onRename(list._id, value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }

        if (e.key === 'Escape') {
            e.currentTarget.value = list.title;
            e.currentTarget.blur();
        }
    };

    return (
        <section
            ref={setNodeRef}
            style={style}
            className={`list${isDragging ? ' is-dragging' : ''}`}
        >
            <div className="list-header">
                <button
                    ref={setActivatorNodeRef}
                    className="drag-handle"
                    aria-label="Drag to reorder list"
                    {...attributes}
                    {...listeners}
                >
                    <svg
                        width="10"
                        height="16"
                        viewBox="0 0 10 16"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <circle cx="2" cy="3" r="1.4" />
                        <circle cx="8" cy="3" r="1.4" />
                        <circle cx="2" cy="8" r="1.4" />
                        <circle cx="8" cy="8" r="1.4" />
                        <circle cx="2" cy="13" r="1.4" />
                        <circle cx="8" cy="13" r="1.4" />
                    </svg>
                </button>

                {editing ? (
                    <input
                        className="list-title-input"
                        defaultValue={list.title}
                        maxLength={100}
                        autoFocus
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    <h2 className="list-title">
                        <button onClick={() => setEditing(true)} title="Rename list">
                            {list.title}
                        </button>
                    </h2>
                )}

                <span className="count">
                    {filtering ? `${tasks.length}/${totalCount}` : tasks.length}
                </span>

                <button
                    className="icon-btn"
                    aria-label={`Delete list ${list.title}`}
                    onClick={() => onDelete(list)}
                >
                    ×
                </button>
            </div>

            <SortableContext
                items={tasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className={`list-cards${filtering ? ' is-filtering' : ''}`}>
                    {tasks.map((task) => (
                        <SortableTask
                            key={task._id}
                            task={task}
                            onOpen={onOpenTask}
                            onToggle={onToggleTask}
                            disabled={filtering}
                        />
                    ))}

                    {filtering && tasks.length === 0 && totalCount > 0 && (
                        <p className="list-empty">No matching cards</p>
                    )}
                </div>
            </SortableContext>

            <InlineComposer
                variant="card"
                triggerLabel="+ Add a card"
                placeholder="Card title"
                submitLabel="Add card"
                onSubmit={(title) => onAddTask(list._id, title)}
            />
        </section>
    );
}

export function ListOverlay({ list, tasks }) {
    return (
        <section className="list list-overlay">
            <div className="list-header">
                <h2 className="list-title">
                    <span>{list.title}</span>
                </h2>
                <span className="count">{tasks.length}</span>
            </div>

            <div className="list-cards">
                {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                ))}
            </div>
        </section>
    );
}

export default ListColumn;