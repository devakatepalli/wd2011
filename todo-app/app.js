const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Update the root route to render index.ejs
app.get("/", async (req, res) => {
  try {
    const todos = await Todo.findAll();
    const today = moment().format("YYYY-MM-DD");

    const overdueTodos = todos.filter(todo => todo.dueDate < today && !todo.completed);
    const dueTodayTodos = todos.filter(todo => todo.dueDate === today);
    const dueLaterTodos = todos.filter(todo => todo.dueDate > today);

    res.render("index", {
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/todos", async function (_request, response) {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to fetch todos" });
  }
});


app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    await Todo.create({ title, dueDate, completed: false });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating todo");
  }
});


app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// DELETE /todos/:id
app.delete("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });  // Fix: return the expected error
    }
    await todo.destroy();
    return response.json(true);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to delete todo" });
  }
});



module.exports = app;
