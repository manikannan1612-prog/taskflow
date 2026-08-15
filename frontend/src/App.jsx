import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

function App() {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [editingTask, setEditingTask] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [columnId, setColumnId] = useState(1);

    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const loadBoard = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API}/api/boards/1`
            );

            setBoard(response.data);

            if (response.data.columns.length > 0) {
                setColumnId(response.data.columns[0].id);
            }

            setError("");
        } catch (error) {
            setError(
                "Could not connect to backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBoard();
    }, []);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setEditingTask(null);
        setShowForm(false);
    };

    const saveTask = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Title is required.");
            return;
        }

        try {
            if (editingTask) {
                await axios.put(
                    `${API}/api/tasks/${editingTask.id}`,
                    {
                        title,
                        description,
                        priority
                    }
                );
            } else {
                await axios.post(
                    `${API}/api/tasks`,
                    {
                        title,
                        description,
                        priority,
                        column_id: Number(columnId)
                    }
                );
            }

            resetForm();
            loadBoard();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong."
            );
        }
    };

    const editTask = (task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setShowForm(true);
    };

    const deleteTask = async (id) => {
        if (!window.confirm("Delete this task?")) {
            return;
        }

        try {
            await axios.delete(
                `${API}/api/tasks/${id}`
            );

            loadBoard();
        } catch (error) {
            setError("Could not delete task.");
        }
    };

    const moveTask = async (taskId, newColumn) => {
        try {
            await axios.patch(
                `${API}/api/tasks/${taskId}/move`,
                {
                    column_id: Number(newColumn)
                }
            );

            loadBoard();
        } catch (error) {
            setError("Could not move task.");
        }
    };

    const filteredTasks = (tasks) => {
        return tasks.filter(task => {
            const priorityMatch =
                filter === "All" ||
                task.priority === filter;

            const searchMatch =
                task.title
                    .toLowerCase()
                    .includes(search.toLowerCase());

            return priorityMatch && searchMatch;
        });
    };

    if (loading) {
        return <h2 className="center">Loading...</h2>;
    }

    if (!board) {
        return <h2 className="center">{error}</h2>;
    }

    return (
        <div>
            <header>
                <div>
                    <h1>TaskFlow</h1>
                    <p>Simple task management</p>
                </div>

                <button
                    onClick={() => {
                        setEditingTask(null);
                        setTitle("");
                        setDescription("");
                        setPriority("Medium");
                        setShowForm(true);
                    }}
                >
                    + Add Task
                </button>
            </header>

            {error && (
                <div className="error">
                    {error}
                    <button onClick={() => setError("")}>
                        X
                    </button>
                </div>
            )}

            <div className="filters">
                <input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={filter}
                    onChange={e =>
                        setFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All priorities
                    </option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            <main>
                {board.columns.map(column => {
                    const tasks = filteredTasks(
                        column.tasks
                    );

                    return (
                        <section
                            className="column"
                            key={column.id}
                        >
                            <div className="column-title">
                                <h2>{column.name}</h2>
                                <span>{tasks.length}</span>
                            </div>

                            {tasks.map(task => (
                                <div
                                    className="task"
                                    key={task.id}
                                >
                                    <h3>{task.title}</h3>

                                    {task.description && (
                                        <p>
                                            {task.description}
                                        </p>
                                    )}

                                    <span
                                        className={`priority ${task.priority.toLowerCase()}`}
                                    >
                                        {task.priority}
                                    </span>

                                    <div className="actions">
                                        <button
                                            onClick={() =>
                                                editTask(task)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteTask(task.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <select
                                        value={task.column_id}
                                        onChange={e =>
                                            moveTask(
                                                task.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        {board.columns.map(
                                            c => (
                                                <option
                                                    key={c.id}
                                                    value={c.id}
                                                >
                                                    Move to: {c.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            ))}
                        </section>
                    );
                })}
            </main>

            {showForm && (
                <div className="modal">
                    <div className="form">
                        <h2>
                            {editingTask
                                ? "Edit Task"
                                : "Create Task"}
                        </h2>

                        <form onSubmit={saveTask}>
                            <label>Title *</label>

                            <input
                                value={title}
                                onChange={e =>
                                    setTitle(e.target.value)
                                }
                                placeholder="Task title"
                            />

                            <label>Description</label>

                            <textarea
                                value={description}
                                onChange={e =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                            />

                            <label>Priority</label>

                            <select
                                value={priority}
                                onChange={e =>
                                    setPriority(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="Low">
                                    Low
                                </option>
                                <option value="Medium">
                                    Medium
                                </option>
                                <option value="High">
                                    High
                                </option>
                            </select>

                            {!editingTask && (
                                <>
                                    <label>Column</label>

                                    <select
                                        value={columnId}
                                        onChange={e =>
                                            setColumnId(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {board.columns.map(
                                            column => (
                                                <option
                                                    key={
                                                        column.id
                                                    }
                                                    value={
                                                        column.id
                                                    }
                                                >
                                                    {
                                                        column.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </>
                            )}

                            <div className="form-buttons">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;