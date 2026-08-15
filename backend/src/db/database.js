const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(
    path.join(__dirname, "taskflow.db")
);

db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
);

db.exec(schema);

module.exports = db;