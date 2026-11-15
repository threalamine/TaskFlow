import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    closestCorners,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import Topbar from '../components/Topbar.jsx';
import Modal from '../components/Modal.jsx';
import ListColumn, { ListOverlay } from '../components/ListColumn.jsx';
import TaskCard from '../components/TaskCard.jsx';
import InlineComposer from '../components/InlineComposer.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { fetchProject } from '../api/projects';
import { fetchLists, createList, updateList, deleteList } from '../api/lists';
import {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../api/tasks';
import getErrorMessage from '../utils/getErrorMessage';
import './Board.css';
import './Dnd.css';

const collisionDetection = (args) => {
    if (args.active.data.current?.type === 'list') {
        return closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
                (container) => container.data.current?.type === 'list'
            ),
        });
    }

    return closestCorners(args);
};

function Board() {
    const { projectId } = useParams();

    const [project, setProject] = useState(null);
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');

    const [activeTaskId, setActiveTaskId] = useState(null);
    const [listToDelete, setListToDelete] = useState(null);
    const [deletingList, setDeletingList] = useState(false);
    const [deleteListError, setDeleteListError] = useState('');

    const [activeDrag, setActiveDrag] = useState(null);
    const snapshotRef = useRef(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        })
    );

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            try {
                const [projectData, listsData, tasksData] = await Promise.all([
                    fetchProject(projectId),
                    fetchLists(projectId),
                    fetchTasks(projectId),
                ]);

                if (ignore) return;

                setProject(projectData);
                setLists(listsData);
                setTasks(tasksData);
            } catch (err) {
                if (!ignore) setLoadError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        load();

        return () => {
            ignore = true;
        };
    }, [projectId]);

    const replaceTask = (updated) => {
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    };

    const addList = async (title) => {
        const list = await createList(projectId, { title });
        setLists((prev) => [...prev, list]);
    };

    const renameList = async (listId, title) => {
        try {
            setNotice('');
            const updated = await updateList(projectId, listId, { title });
            setLists((prev) => prev.map((l) => (l._id === listId ? updated : l)));
        } catch (err) {
            setNotice(getErrorMessage(err));
        }
    };

    const confirmDeleteList = async () => {
        setDeletingList(true);
        setDeleteListError('');

        try {
            await deleteList(projectId, listToDelete._id);
            setLists((prev) => prev.filter((l) => l._id !== listToDelete._id));
            setTasks((prev) => prev.filter((t) => t.list !== listToDelete._id));
            setListToDelete(null);
        } catch (err) {
            setDeleteListError(getErrorMessage(err));
        } finally {
            setDeletingList(false);
        }
    };

    const addTask = async (listId, title) => {
        const task = await createTask(projectId, { title, list: listId });
        setTasks((prev) => [...prev, task]);
    };

    const toggleTask = async (task) => {
        try {
            setNotice('');
            const updated = await updateTask(projectId, task._id, {
                completed: !task.completed,
            });
            replaceTask(updated);
        } catch (err) {
            setNotice(getErrorMessage(err));
        }
    };

    const saveTask = async (taskId, payload) => {
        const updated = await updateTask(projectId, taskId, payload);
        replaceTask(updated);
        setActiveTaskId(null);
    };

    const removeTask = async (taskId) => {
        await deleteTask(projectId, taskId);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setActiveTaskId(null);
    };

    const restoreSnapshot = () => {
        if (!snapshotRef.current) return;

        setLists(snapshotRef.current.lists);
        setTasks(snapshotRef.current.tasks);
    };

    const handleDragStart = ({ active }) => {
        snapshotRef.current = { lists, tasks };
        setNotice('');
        setActiveDrag({ type: active.data.current?.type, id: active.id });
    };

    const handleDragOver = ({ active, over }) => {
        if (!over || active.data.current?.type !== 'task') return;
        if (active.id === over.id) return;

        const overType = over.data.current?.type;

        setTasks((prev) => {
            const activeTask = prev.find((t) => t._id === active.id);
            if (!activeTask) return prev;

            const overTask =
                overType === 'task' ? prev.find((t) => t._id === over.id) : null;
            const targetListId = overType === 'list' ? over.id : overTask?.list;

            if (!targetListId || targetListId === activeTask.list) return prev;

            const others = prev.filter((t) => t._id !== active.id);
            const moved = { ...activeTask, list: targetListId };

            if (!overTask) return [...others, moved];

            const overIndex = others.findIndex((t) => t._id === overTask._id);
            const translated = active.rect.current.translated;
            const isBelow =
                translated && translated.top > over.rect.top + over.rect.height / 2;
            const insertAt = overIndex + (isBelow ? 1 : 0);

            return [...others.slice(0, insertAt), moved, ...others.slice(insertAt)];
        });
    };

    const handleDragEnd = async ({ active, over }) => {
        const snapshot = snapshotRef.current;
        setActiveDrag(null);

        if (!snapshot) return;

        if (!over) {
            restoreSnapshot();
            return;
        }

        if (active.data.current?.type === 'list') {
            if (active.id === over.id) return;

            const oldIndex = lists.findIndex((l) => l._id === active.id);
            const newIndex = lists.findIndex((l) => l._id === over.id);

            if (oldIndex < 0 || newIndex < 0) return;

            setLists(arrayMove(lists, oldIndex, newIndex));

            try {
                await updateList(projectId, active.id, { position: newIndex });
            } catch (err) {
                restoreSnapshot();
                setNotice(getErrorMessage(err));
            }

            return;
        }

        let nextTasks = tasks;

        if (over.data.current?.type === 'task' && active.id !== over.id) {
            const from = tasks.findIndex((t) => t._id === active.id);
            const to = tasks.findIndex((t) => t._id === over.id);

            if (from >= 0 && to >= 0 && tasks[from].list === tasks[to].list) {
                nextTasks = arrayMove(tasks, from, to);
                setTasks(nextTasks);
            }
        }

        const moved = nextTasks.find((t) => t._id === active.id);
        const original = snapshot.tasks.find((t) => t._id === active.id);

        if (!moved || !original) return;

        const newPosition = nextTasks
            .filter((t) => t.list === moved.list)
            .findIndex((t) => t._id === moved._id);
        const oldPosition = snapshot.tasks
            .filter((t) => t.list === original.list)
            .findIndex((t) => t._id === original._id);

        if (moved.list === original.list && newPosition === oldPosition) return;

        try {
            const updated = await updateTask(projectId, moved._id, {
                list: moved.list,
                position: newPosition,
            });
            replaceTask(updated);
        } catch (err) {
            restoreSnapshot();
            setNotice(getErrorMessage(err));
        }
    };

    const handleDragCancel = () => {
        setActiveDrag(null);
        restoreSnapshot();
    };

    if (loading) {
        return (
            <div className="app">
                <Topbar />
                <main className="page-content">
                    <p>Loading board…</p>
                </main>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="app">
                <Topbar />
                <main className="page-content">
                    <div className="form-error">{loadError}</div>
                    <Link to="/projects" className="back-link">
                        ← Back to projects
                    </Link>
                </main>
            </div>
        );
    }

    const activeTask = tasks.find((t) => t._id === activeTaskId);
    const dragTask =
        activeDrag?.type === 'task'
            ? tasks.find((t) => t._id === activeDrag.id)
            : null;
    const dragList =
        activeDrag?.type === 'list'
            ? lists.find((l) => l._id === activeDrag.id)
            : null;

    const deleteCount = listToDelete
        ? tasks.filter((t) => t.list === listToDelete._id).length
        : 0;
    const deleteSuffix =
        deleteCount === 0
            ? ''
            : ` and its ${deleteCount === 1 ? '1 card' : `${deleteCount} cards`}`;

    return (
        <div className="app">
            <Topbar />

            <div className="board-header">
                <Link to="/projects" className="back-link">
                    ← Projects
                </Link>
                <h1>{project.title}</h1>
                {project.description && <p>{project.description}</p>}
            </div>

            {notice && (
                <div className="form-error board-notice">
                    <span>{notice}</span>
                    <button className="text-btn" onClick={() => setNotice('')}>
                        Dismiss
                    </button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <main className="board">
                    <SortableContext
                        items={lists.map((l) => l._id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {lists.map((list) => (
                            <ListColumn
                                key={list._id}
                                list={list}
                                tasks={tasks.filter((t) => t.list === list._id)}
                                onRename={renameList}
                                onDelete={(l) => {
                                    setDeleteListError('');
                                    setListToDelete(l);
                                }}
                                onAddTask={addTask}
                                onOpenTask={setActiveTaskId}
                                onToggleTask={toggleTask}
                            />
                        ))}
                    </SortableContext>

                    <div className="list-add">
                        <InlineComposer
                            variant="list"
                            triggerLabel="+ Add a list"
                            placeholder="List title"
                            submitLabel="Add list"
                            onSubmit={addList}
                        />
                    </div>
                </main>

                <DragOverlay>
                    {dragTask && <TaskCard task={dragTask} overlay />}
                    {dragList && (
                        <ListOverlay
                            list={dragList}
                            tasks={tasks.filter((t) => t.list === dragList._id)}
                        />
                    )}
                </DragOverlay>
            </DndContext>

            <TaskModal
                task={activeTask}
                onClose={() => setActiveTaskId(null)}
                onSave={saveTask}
                onDelete={removeTask}
            />

            <Modal
                open={Boolean(listToDelete)}
                onClose={() => setListToDelete(null)}
                title="Delete list?"
            >
                {listToDelete && (
                    <>
                        <p className="modal-text">
                            “{listToDelete.title}”{deleteSuffix} will be permanently deleted.
                            This can’t be undone.
                        </p>

                        {deleteListError && (
                            <div className="form-error">{deleteListError}</div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="ghost-btn"
                                onClick={() => setListToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="danger-btn"
                                onClick={confirmDeleteList}
                                disabled={deletingList}
                            >
                                {deletingList ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default Board;