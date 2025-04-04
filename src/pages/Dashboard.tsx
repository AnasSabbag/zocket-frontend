import React, { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";

const Dashboard: React.FC = () => {
  const taskContext = useContext(TaskContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!taskContext) return <p>Loading...</p>;

  const { tasks, addTask, updateTask, deleteTask } = taskContext;

  const handleAddTask = () => {
    addTask({ id: Date.now().toString(), title, description, status: "Pending" });
    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h2>Task Dashboard</h2>

      <div>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <button onClick={() => updateTask({ ...task, status: "Completed" })}>Complete</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
