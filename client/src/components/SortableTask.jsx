import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard.jsx';

function SortableTask({ task, onOpen, onToggle }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id, data: { type: 'task' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`sortable-item${isDragging ? ' is-dragging' : ''}`}
        >
            <TaskCard
                task={task}
                onOpen={onOpen}
                onToggle={onToggle}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

export default SortableTask;