const express = require("express");
const cors = require("cors");

require("./db/database");

const boardRoutes = require("./routes/boardRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TaskFlow API is running"
    });
});

app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);

module.exports = app;