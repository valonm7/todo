import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null); // New state for tracking edited todo
  const [editingText, setEditingText] = useState("");     // New state for storing edited text

  const fetchTodos = () => {
    axios.get("http://localhost:8080/api/todos")
      .then(res => setTodos(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    axios.post("http://localhost:8080/api/todos", {
      title: title,
      completed: false
    }).then(() => {
      setTitle("");
      fetchTodos();
    }).catch(err => console.error(err));
  };

  const toggleCompleted = (todo) => {
    axios.put(`http://localhost:8080/api/todos/${todo.id}`, {
      title: todo.title,
      completed: !todo.completed
    }).then(() => {
      fetchTodos();
    }).catch(err => console.error(err));
  };

  const handleDeleteTodo = (id) => {
    axios.delete(`http://localhost:8080/api/todos/${id}`)
      .then(() => fetchTodos())
      .catch(err => console.error(err));
  };

  // ✅ New: Handle double-click to start editing
  const handleDoubleClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.title);
  };

  // ✅ New: Handle changes in the edit input field
  const handleEditChange = (e) => {
    setEditingText(e.target.value);
  };

  // ✅ New: Handle saving the edited todo
  const handleSaveEdit = (todoId) => {
    if (!editingText.trim()) return; // Prevent saving empty text

    axios.put(`http://localhost:8080/api/todos/${todoId}`, {
      title: editingText,
      // You might want to keep the completed status as is, or update it if needed
      completed: todos.find(t => t.id === todoId).completed
    }).then(() => {
      setEditingTodoId(null); // Exit edit mode
      setEditingText("");    // Clear editing text
      fetchTodos();          // Refresh the list
    }).catch(err => console.error(err));
  };

  // ✅ New: Handle pressing Enter to save the edit
  const handleKeyDown = (e, todoId) => {
    if (e.key === "Enter") {
      handleSaveEdit(todoId);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>To-Do List</h1>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={title}
          placeholder="Enter a new task"
          onChange={e => setTitle(e.target.value)}
          style={{ padding: "10px", width: "70%", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "10px" }}>Add</button>
      </form>

      <ul style={{ marginTop: "20px", padding: 0, listStyle: "none" }}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleCompleted(todo)}
                style={{ marginRight: "10px" }}
              />
              {/* Conditional rendering for editing */}
              {editingTodoId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={handleEditChange}
                  onBlur={() => handleSaveEdit(todo.id)} // Save on blur
                  onKeyDown={(e) => handleKeyDown(e, todo.id)} // Save on Enter
                  style={{ padding: "5px", flexGrow: 1 }}
                  autoFocus // Automatically focus the input when it appears
                />
              ) : (
                <span
                  onDoubleClick={() => handleDoubleClick(todo)}
                  style={{ textDecoration: todo.completed ? "line-through" : "none", flexGrow: 1, cursor: "pointer" }}
                >
                  {todo.title}
                </span>
              )}
            </div>
            <button onClick={() => handleDeleteTodo(todo.id)} style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "red",
              fontSize: "16px",
              cursor: "pointer"
            }}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;