const db = require("./database");

db.prepare("DELETE FROM tasks").run();
db.prepare("DELETE FROM columns").run();
db.prepare("DELETE FROM boards").run();

db.prepare("DELETE FROM sqlite_sequence WHERE name = 'tasks'").run();
db.prepare("DELETE FROM sqlite_sequence WHERE name = 'columns'").run();
db.prepare("DELETE FROM sqlite_sequence WHERE name = 'boards'").run();

const board = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run("My Task Board");

const boardId = board.lastInsertRowid;

const column = db.prepare(
    "INSERT INTO columns (board_id, name) VALUES (?, ?)"
);

const todo = column.run(boardId, "To Do");
const progress = column.run(boardId, "In Progress");
const done = column.run(boardId, "Done");

const task = db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority)
    VALUES (?, ?, ?, ?)
`);

task.run(
    todo.lastInsertRowid,
    "Learn React",
    "Practice React",
    "High"
);

task.run(
    todo.lastInsertRowid,
    "Build UI",
    "Create TaskFlow interface",
    "Medium"
);

task.run(
    progress.lastInsertRowid,
    "Build API",
    "Create Express API",
    "High"
);

task.run(
    done.lastInsertRowid,
    "Create database",
    "Create SQLite database",
    "Low"
);

console.log("Seed completed.");
console.log("Board ID:", boardId);