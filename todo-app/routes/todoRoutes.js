const express = require("express");
const router = express.Router();
const { Todo } = require("../models"); // Adjust path if needed

// ✅ Toggle completion route
router.put("/todos/:id", async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }
        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo); // Ensure JSON response
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Delete todo route
router.delete("/todos/:id", async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }
        await todo.destroy();
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
