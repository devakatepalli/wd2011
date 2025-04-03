async function toggleCompletion(todoId) {
    try {
        const response = await fetch(`/todos/${todoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Updated Todo:", result);
        location.reload();
    } catch (error) {
        console.error("Error toggling completion:", error);
    }
}
