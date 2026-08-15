const express = require("express");
const db = require("../db/database");

const router = express.Router();

router.get("/:id", (req, res) => {
    try {
        const board = db
            .prepare("SELECT * FROM boards WHERE id = ?")
            .get(req.params.id);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const columns = db.prepare(`
            SELECT *
            FROM columns
            WHERE board_id = ?
            ORDER BY id
        `).all(req.params.id);

        const getTasks = db.prepare(`
            SELECT *
            FROM tasks
            WHERE column_id = ?
            ORDER BY created_at DESC
        `);

        const result = columns.map(column => ({
            ...column,
            tasks: getTasks.all(column.id)
        }));

        res.json({
            ...board,
            columns: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to load board"
        });
    }
});

module.exports = router;