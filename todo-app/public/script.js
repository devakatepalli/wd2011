document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".complete-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const todoId = event.target.dataset.id;
            try {
                const response = await fetch(`/todos/${todoId}/markAsCompleted`, { method: "PUT" });
                if (response.ok) {
                    location.reload(); // Reload the page to reflect changes
                }
            } catch (error) {
                console.error("Failed to mark as completed:", error);
            }
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const todoId = event.target.dataset.id;
            try {
                const response = await fetch(`/todos/${todoId}`, { method: "DELETE" });
                if (response.ok) {
                    location.reload();
                }
            } catch (error) {
                console.error("Failed to delete todo:", error);
            }
        });
    });
});
