const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with JSON", async () => {
    const response = await request(app)
      .post("/todos")
      .send({
        title: "Test Todo",
        dueDate: "2025-04-07",
        completed: false,
      })
      .set("Content-Type", "application/json"); // Ensure API request
  
    console.log("Response Body:", response.text); // Debugging
  
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toContain("application/json");
  });
  

  test("Marks a todo with the given ID as complete", async () => {
    const todo = await agent.post("/todos").send({
      title: "Test Todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });
  
    const todoID = todo.body.id;
  
    // **Send PUT request to mark as completed**
    const markCompleteResponse = await agent.put(`/todos/${todoID}/markASCompleted`).send();
  
    // **Log response before parsing**
    console.log("Response Status:", markCompleteResponse.status); // Log status code
    console.log("Response Headers:", markCompleteResponse.headers); // Log headers
    console.log("Response Body:", markCompleteResponse.text); // Log raw response
  
    expect(markCompleteResponse.status).toBe(200); // Ensure successful response
  
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  
  

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy tesla",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
  
    // Delete the existing todo
    const deleteTodoResponse = await agent.delete(`/todos/${todoID}`).send();
    const parsedDeleteResponse = JSON.parse(deleteTodoResponse.text);
    expect(parsedDeleteResponse.success).toBe(true);  // Ensure it returns true on successful deletion
  
    // Try deleting the non-existent todo
    const deleteNonExistentTodoResponse = await agent.delete(`/todos/9999`).send();
    
    // Check status code for non-existent todo
    expect(deleteNonExistentTodoResponse.status).toBe(404);
  
    const parsedDeleteNonExistentTodoResponse = JSON.parse(deleteNonExistentTodoResponse.text);
    expect(parsedDeleteNonExistentTodoResponse.error).toBe("Todo not found");
  });  
});
