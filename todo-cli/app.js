const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// A simple route to check if the app is working
app.get("/", function (request, response) {
  response.send("Hello World");
});

// Fetch all todos
app.get("/todos", async function (_request, response) {
  try {
    console.log("Processing list of all Todos ...");
    // Query the database for all todos
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Fetch a single todo by its ID
app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (todo) {
      return response.json(todo);
    } else {
      return response.status(404).json({ error: "Todo not found" });
    }
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Create a new todo
app.post("/todos", async function (request, response) {
  try {
    const { title, dueDate, completed } = request.body;
    if (!title || !dueDate) {
      return response.status(400).json({ error: "Title and due date are required." });
    }
    const todo = await Todo.create({ title, dueDate, completed });
    return response.status(201).json(todo);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to create todo" });
  }
});

// Mark a todo as completed
app.put("/todos/:id/markAsCompleted", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    todo.completed = true;
    await todo.save(); // Save the updated todo
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: "Failed to mark todo as completed" });
  }
});

// Delete a todo by its ID
app.delete("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy(); // Delete the todo from the database
    return response.json(true); // Respond with true to indicate successful deletion
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;