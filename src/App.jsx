import { useEffect, useState } from 'react';
import axios from 'axios';
 
const API_BASE = 'http://localhost:3000/api'; // our Express server
 
export default function App() {
  // Counter state (pure frontend)
  const [count, setCount] = useState(0);
 
  // Tasks state (fetched from backend)
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
 
  // Fetch hello message (sanity check)
  useEffect(() => {
    axios.get(`${API_BASE}/hello`)
      .then(res => setApiMessage(res.data.message))
      .catch(() => setApiMessage('Could not reach API'));
  }, []);
 
  // Fetch tasks from backend
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tasks. Is the server running on port 3000?');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadTasks();
  }, []);
 
  // Add task via POST
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/tasks`, { title: newTitle.trim() });
      setTasks(prev => [...prev, res.data]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
      alert('Failed to add task');
    }
  };
 
  // Toggle done via PATCH
  const toggleTask = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/tasks/${id}/toggle`);
      setTasks(prev => prev.map(t => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle task');
    }
  };
 
  return (
    <div style={{ fontFamily: 'system-ui, Arial, sans-serif', padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1>React + Express Lab</h1>
      <p style={{ color: '#555' }}>{apiMessage || 'Checking API...'}</p>
 
      {/* Counter App */}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h2>Counter (Frontend Only)</h2>
        <p>Count: <strong>{count}</strong></p>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>{' '}
        <button onClick={() => setCount(0)}>Reset</button>
      </section>
 
      {/* Tasks App */}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h2>Tasks (Uses Backend API)</h2>
 
        <form onSubmit={addTask} style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="New task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ padding: 8, width: '70%' }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>Add</button>
        </form>
 
        <button onClick={loadTasks} disabled={loading}>
          {loading ? 'Loading...' : 'Reload Tasks'}
        </button>
 
        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ marginBottom: 6 }}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
              </label>
            </li>
          ))}
          {tasks.length === 0 && !loading && <li>No tasks yet. Add one!</li>}
        </ul>
      </section>
    </div>
  );
}
