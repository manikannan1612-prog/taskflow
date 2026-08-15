const express = require("express");
const db = require("../db/database");

const router = express.Router();



router.get("/", (req, res) => {
    try {
        const { priority } = req.query;

        if (priority) {
            const tasks = db.prepare(`
                SELECT *
                FROM tasks
                WHERE priority = ?
                ORDER BY created_at DESC
            `).all(priority);

            return res.json(tasks);
        }

        const tasks = db.prepare(`
            SELECT *
            FROM tasks
            ORDER BY created_at DESC
        `).all();

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Failed to load tasks"
        });
    }
});



router.post("/", (req, res) => {
    try {
        const {
            column_id,
            title,
            description,
            priority
        } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        if (!column_id) {
            return res.status(400).json({
                message: "Column is required"
            });
        }

        const selectedPriority = priority || "Medium";

        if (
            !["Low", "Medium", "High"]
                .includes(selectedPriority)
        ) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        const column = db
            .prepare("SELECT * FROM columns WHERE id = ?")
            .get(column_id);

        if (!column) {
            return res.status(404).json({
                message: "Column not found"
            });
        }

        const result = db.prepare(`
            INSERT INTO tasks
            (column_id, title, description, priority)
            VALUES (?, ?, ?, ?)
        `).run(
            column_id,
            title.trim(),
            description || null,
            selectedPriority
        );

        const task = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(result.lastInsertRowid);

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task"
        });
    }
});



router.put("/:id", (req, res) => {
    try {
        const { title, description, priority } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        if (
            !["Low", "Medium", "High"]
                .includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        const task = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        db.prepare(`
            UPDATE tasks
            SET title = ?,
                description = ?,
                priority = ?
            WHERE id = ?
        `).run(
            title.trim(),
            description || null,
            priority,
            req.params.id
        );

        const updated = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(req.params.id);

        res.json(updated);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task"
        });
    }
});



router.delete("/:id", (req, res) => {
    try {
        const task = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        db.prepare(
            "DELETE FROM tasks WHERE id = ?"
        ).run(req.params.id);

        res.json({
            message: "Task deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});



router.patch("/:id/move", (req, res) => {
    try {
        const { column_id } = req.body;

        if (!column_id) {
            return res.status(400).json({
                message: "Column is required"
            });
        }

        const task = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const column = db
            .prepare("SELECT * FROM columns WHERE id = ?")
            .get(column_id);

        if (!column) {
            return res.status(404).json({
                message: "Column not found"
            });
        }

        db.prepare(`
            UPDATE tasks
            SET column_id = ?
            WHERE id = ?
        `).run(
            column_id,
            req.params.id
        );

        const updated = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(req.params.id);

        res.json(updated);

    } catch (error) {
        res.status(500).json({
            message: "Failed to move task"
        });
    }
});

module.exports = router;