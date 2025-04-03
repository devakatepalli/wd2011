const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const moment = require("moment");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const isTestEnv = process.env.NODE_ENV === "test"; // Check if running tests

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Disable CSRF for tests
if (!isTestEnv) {
  app.use(csrf({ cookie: true })); // CSRF protection only in production
}

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// 🏠 **Home Route: Render the Todo List**
app.get("/", async (req, res) => {
  try {
    const todos = await Todo.findAll();
    const today = moment().format("YYYY-MM-DD");

    const overdueTodos = todos.filter(todo => todo.dueDate < today && !todo.completed);
    const dueTodayTodos = todos.filter(todo => todo.dueDate === today && !todo.completed);
    const dueLaterTodos = todos.filter(todo => todo.dueDate > today && !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    res.render("index", {
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
      completedTodos,
      csrfToken: isTestEnv ? "" : req.csrfToken(), // Avoid CSRF token issue in tests
    });
  } catch (error) {
    console.error("❌ Error fetching todos:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 📌 **GET: Fetch all Todos**
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
  } catch (error) {
    console.error("❌ Error fetching todos:", error);
    return res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// 🔍 **GET: Fetch a Single Todo by ID**
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    return res.json(todo);
  } catch (error) {
    console.error("❌ Error fetching todo:", error);
    return res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// ✏️ **POST: Create a New Todo**
app.post("/todos", async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title.trim() || !dueDate) {
      return res.status(400).json({ error: "Title and due date are required" });
    }

    const todo = await Todo.create({ title, dueDate, completed: false });

    // Check if request is from a test (Jest) or an API client
    if (req.headers["content-type"] === "application/json") {
      return res.status(200).json(todo); // Send JSON response for tests
    }

    return res.redirect("/"); // Redirect for UI requests
  } catch (error) {
    console.error("Error creating todo:", error);
    return res.status(500).json({ error: "Failed to create todo" });
  }
});



// ✅ **PUT: Mark a Todo as Completed**
app.put("/todos/:id/markAsCompleted", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    await todo.update({ completed: true });
    return res.json(todo);
  } catch (error) {
    console.error("❌ Error marking todo as completed:", error);
    return res.status(500).json({ error: "Failed to mark todo as completed" });
  }
});

// 🔄 **PUT: Toggle Completion Status**
app.put("/todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    if (!todoId || isNaN(todoId)) {
      return res.status(400).json({ error: "Invalid todo ID" });
    }

    const todo = await Todo.findByPk(todoId);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    return res.json(todo);
  } catch (error) {
    console.error("❌ Error marking todo as completed:", error);
    return res.status(500).json({ error: "Failed to mark todo as completed" });
  }
});



// 🗑️ **DELETE: Remove a Todo**
app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    await todo.destroy();
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting todo:", error);
    return res.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
