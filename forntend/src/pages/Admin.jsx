import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../services/api";

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const [taskForm, setTaskForm] = useState({
    email: "",
    title: "",
    due_date: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadUsers();
    loadTasks();
  }, []);

  /* ================= USERS ================= */

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= TASKS ================= */

  const loadTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTasks(data);
    } catch {
      alert("Failed to load tasks ❌");
    }
  };

  const handleAssignTask = async () => {
    if (!taskForm.email || !taskForm.title) {
      alert("Enter student email & task title");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/admin/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await res.json();
      alert(data.message);

      setTaskForm({ email: "", title: "", due_date: "" });
      loadTasks();
    } catch {
      alert("Task assignment failed ❌");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await fetch(`http://localhost:3000/api/admin/task/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadTasks();
  };

  /* ================= REVIEW ================= */

  const reviewSubmission = async (id, status) => {
    await fetch(`http://localhost:3000/api/admin/review/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    loadTasks();
  };

  /* ================= FILTER ================= */

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
        }

        .layout {
          display: flex;
          height: 100vh;
        }

        .sidebar {
          width: 220px;
          background: #00695c;
          color: white;
          padding: 20px;
        }

        .sidebar button {
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          border: none;
          cursor: pointer;
          background: white;
          color: #00695c;
          font-weight: bold;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background: white;
          padding: 12px 20px;
          border-bottom: 1px solid #ccc;
          display: flex;
          justify-content: space-between;
        }

        .main {
          padding: 20px;
          overflow: auto;
        }

        input {
          padding: 6px;
          font-size: 12px;
          margin-bottom: 8px;
          width: 250px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          margin-bottom: 20px;
        }

        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          font-size: 12px;
        }

        th {
          background: #e0f2f1;
        }

        .panel {
          background: white;
          border: 1px solid #ccc;
          padding: 15px;
          margin-bottom: 20px;
        }

        button.action {
          padding: 5px 10px;
          font-size: 11px;
          margin-right: 5px;
          cursor: pointer;
          border: none;
        }

        .assign-btn {
          background: #00695c;
          color: white;
        }

        .delete-btn {
          background: red;
          color: white;
        }

        .approve-btn {
          background: #2e7d32;
          color: white;
        }

        .reject-btn {
          background: #c62828;
          color: white;
        }

        .logout-btn {
          background: #757575;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
        }
      `}</style>

      <div className="layout">
        <div className="sidebar">
          <h2>Admin Panel</h2>

          <button onClick={loadUsers}>Refresh Users</button>
          <button onClick={loadTasks}>Refresh Tasks</button>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="content">
          <div className="navbar">
            <strong>Admin Dashboard</strong>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>

          <div className="main">

            {/* ✅ TASK CREATION */}
            <div className="panel">
              <h3>Assign Task</h3>

              <input
                placeholder="Student Email"
                value={taskForm.email}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, email: e.target.value })
                }
              />
              <br />

              <input
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
              <br />

              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, due_date: e.target.value })
                }
              />
              <br />

              <button className="action assign-btn" onClick={handleAssignTask}>
                Assign Task
              </button>
            </div>

            {/* ✅ TASK LIST */}
            <h3>All Tasks</h3>

            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan="5">No Tasks</td></tr>
                ) : (
                  tasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.title}</td>
                      <td>{t.due_date || "N/A"}</td>
                      <td>{t.status}</td>
                      <td>
                        <button
                          className="action delete-btn"
                          onClick={() => deleteTask(t.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ✅ SUBMISSIONS */}
            <h3>Student Submissions</h3>

            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task</th>
                  <th>File</th>
                  <th>Review Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tasks.filter(t => t.submission).length === 0 ? (
                  <tr><td colSpan="5">No Submissions</td></tr>
                ) : (
                  tasks.filter(t => t.submission).map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.title}</td>
                      <td>{t.submission}</td>
                      <td>{t.review_status}</td>
                      <td>
                        <button
                          className="action approve-btn"
                          onClick={() => reviewSubmission(t.id, "approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="action reject-btn"
                          onClick={() => reviewSubmission(t.id, "rejected")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ✅ USERS */}
            <h3>Registered Users</h3>

            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className="action delete-btn"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </>
  );
}