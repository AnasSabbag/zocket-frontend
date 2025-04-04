import React, { createContext, useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const getALLTasks = async()=>{
    axios
      .get("http://localhost:5000/tasks", getAuthHeaders())
      .then((res) => setTasks(res.data))
      .catch((err) => console.log("Error fetching tasks:", err));

  }
  useEffect(() => {
    if (!authContext) {
      console.log("AuthContext is not available");
      return;
    }

    // Fetch tasks from backend
    axios
      .get("http://localhost:5000/tasks", getAuthHeaders())
      .then((res) => setTasks(res.data))
      .catch((err) => console.log("Error fetching tasks:", err));

    

    // Initialize WebSocket connection
    const socket = new WebSocket("ws://localhost:5000/ws");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "taskAdded") {
          setTasks((prev) => [...prev, data.task]);
        } else if (data.type === "taskUpdated") {
          setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
        } else if (data.type === "taskDeleted") {
          setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
        }
      } catch (error) {
        console.log("Error processing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => console.log("WebSocket Error:", error);
    socket.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socket.close();
    };
  }, [authContext]);



  if (!authContext) return null;

  const { user } = authContext;

  const addTask = async (task: Task) => {
    if (!user) {
      console.log("User not authenticated");
      return;
    }
    try {
      await axios.post("http://localhost:5000/tasks", task, getAuthHeaders());
      //get all tasks
      getALLTasks();
    } catch (error) {
      console.log("Error adding task:", error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const resp=await axios.put(`http://localhost:5000/tasks/${task.id}`, task, getAuthHeaders());
      //need to reset tasks data
      getALLTasks(); 
      console.log("resp:",resp);
    } catch (error) {
      console.log("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const resp=await axios.delete(`http://localhost:5000/tasks/${taskId}`, getAuthHeaders());
      console.log("resp:",resp);
      getALLTasks();
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
