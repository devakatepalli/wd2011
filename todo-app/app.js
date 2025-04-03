const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const moment = require("moment");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Root route to render index.ejs
app.get("/", async (req, res) => {
  try {
    const todos = await Todo.findAll();
    const today = moment().format("YYYY-MM-DD");

    const overdueTodos = todos.filter(todo => todo.dueDate < today); // FIXED
    const dueTodayTodos = todos.filter(todo => todo.dueDate === today);
    const dueLaterTodos = todos.filter(todo => todo.dueDate > today);

    res.render("index", {
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get a specific todo by ID
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    return res.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Create a new todo
app.post("/todos", async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title || !dueDate) {
      return res.status(400).send("Title and due date are required.");
    }
    await Todo.create({ title, dueDate, completed: false });
    res.redirect("/");
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).send("Error creating todo");
  }
});

// Mark a todo as completed
app.put("/todos/:id/markAsCompleted", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    if (todo.completed) { // FIXED
      return res.status(400).json({ error: "Todo is already completed" });
    }

    todo.completed = true;
    await todo.save();
    return res.json(todo);
  } catch (error) {
    console.error("Error marking todo as completed:", error);
    return res.status(500).json({ error: "Failed to mark todo as completed" });
  }
});

// Delete a todo by ID
app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy();
    res.redirect("/"); // FIXED: Redirect after deletion
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
