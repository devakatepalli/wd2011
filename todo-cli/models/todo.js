const { Op } = require('sequelize'); // Import Sequelize Operators

module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define("Todo", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  // Function to add a task
  Todo.addTask = async function (task) {
    return await Todo.create(task);
  };

  // Function to fetch overdue tasks
  Todo.overdue = async function () {
    return await Todo.findAll({
      where: {
        dueDate: {
          [Op.lt]: new Date().toISOString().split('T')[0], // Use imported Op.lt
        },
      },
    });
  };

  // Function to fetch due today tasks
  Todo.dueToday = async function () {
    return await Todo.findAll({
      where: {
        dueDate: new Date().toISOString().split('T')[0],
      },
    });
  };

  // Function to fetch due later tasks
  Todo.dueLater = async function () {
    return await Todo.findAll({
      where: {
        dueDate: {
          [Op.gt]: new Date().toISOString().split('T')[0], // Use imported Op.gt
        },
      },
    });
  };

  // Function to mark task as complete
  Todo.markAsComplete = async function (id) {
    const todo = await Todo.findByPk(id);
    if (todo) {
      todo.completed = true;
      await todo.save();
      return todo; // Return the updated todo
    }
    return null; // Return null if not found
  };

  // Function to get displayable string
  Todo.prototype.displayableString = function () {
    const checkbox = this.completed ? '[x]' : '[ ]';
    const formattedDate =
      this.dueDate === new Date().toISOString().split('T')[0]
        ? ''
        : ` ${this.dueDate}`;
    return `${this.id}. ${checkbox} ${this.title}${formattedDate}`;
  };

  // Function to delete a task by ID
  Todo.deleteTask = async function (id) {
    const deletedCount = await Todo.destroy({ where: { id } });
    return deletedCount > 0; // Returns true if at least one row is deleted
  };

  return Todo;
};