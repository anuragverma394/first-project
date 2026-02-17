import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  let token = null;
  let user = null;

  try {
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!token || !user) {
      navigate("/");
      return;
    }

    fetchTasks();
  }, []);

  /* ✅ FETCH TASKS */
  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/student/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTasks(data);

    } catch {
      alert("Failed to load tasks");
    }
  };

  /* ✅ UPDATE PROGRESS */
  const updateProgress = async (id, progress) => {
    try {
      await fetch(`http://localhost:3000/api/student/progress/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress }),
      });

      fetchTasks();

    } catch {
      alert("Progress update failed ❌");
    }
  };

  /* ✅ MARK COMPLETED */
  const markCompleted = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/student/complete/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();

    } catch {
      alert("Failed to complete task ❌");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isOverdue = (task) => {
    if (!task.due_date) return false;
    return (
      new Date(task.due_date) < new Date() &&
      task.status !== "completed"
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#2e7d32";
    if (progress >= 40) return "#f9a825";
    return "#c62828";
  };

  const filteredTasks = tasks.filter(task =>
    activeTab === "pending"
      ? task.status !== "completed"
      : task.status === "completed"
  );

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
          width: 230px;
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
          padding: 14px 20px;
          border-bottom: 1px solid #ccc;
          display: flex;
          justify-content: space-between;
        }

        .main {
          padding: 20px;
          overflow-y: auto;
        }

        .tabs {
          margin-bottom: 15px;
        }

        .tab-btn {
          padding: 6px 12px;
          margin-right: 8px;
          border: 1px solid #00695c;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }

        .active-tab {
          background: #00695c;
          color: white;
        }

        .task-card {
          background: white;
          border: 1px solid #ccc;
          padding: 12px;
          margin-bottom: 10px;
          font-size: 13px;
          border-radius: 4px;
        }

        .overdue {
          border: 1px solid red;
          background: #ffe6e6;
        }

        .progress-bar {
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          margin-top: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
        }

        .logout-btn {
          background: #757575;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
        }

        .empty {
          color: gray;
        }

        .overdue-text {
          color: red;
          font-size: 11px;
          font-weight: bold;
        }

        input[type="range"] {
          width: 200px;
          margin-top: 6px;
        }

        .complete-btn {
          margin-top: 6px;
          background: #00695c;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 11px;
        }
      `}</style>

      <div className="layout">
        <div className="sidebar">
          <h2>Student Panel</h2>

          <div>Welcome 👋</div>
          <div style={{ fontSize: 13 }}>{user?.name}</div>

          <button onClick={fetchTasks}>Refresh Tasks</button>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="content">
          <div className="navbar">
            <strong>Student Dashboard</strong>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="main">
            <h3>Your Tasks</h3>

            <div className="tabs">
              <button
                className={`tab-btn ${
                  activeTab === "pending" ? "active-tab" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Tasks
              </button>

              <button
                className={`tab-btn ${
                  activeTab === "completed" ? "active-tab" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed Tasks
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="empty">No tasks found</div>
            ) : (
              filteredTasks.map(task => {
                const overdue = isOverdue(task);

                return (
                  <div
                    key={task.id}
                    className={`task-card ${overdue ? "overdue" : ""}`}
                  >
                    <b>{task.title}</b>

                    <div>Status: {task.status}</div>
                    <div>Due Date: {task.due_date || "N/A"}</div>

                    {overdue && (
                      <div className="overdue-text">
                        ⚠ Overdue Task
                      </div>
                    )}

                    <div>Progress: {task.progress || 0}%</div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${task.progress || 0}%`,
                          background: getProgressColor(task.progress || 0),
                        }}
                      />
                    </div>

                    {/* ✅ Progress Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress || 0}
                      onChange={(e) =>
                        updateProgress(task.id, e.target.value)
                      }
                    />

                    {/* ✅ Complete Button */}
                    {task.status !== "completed" && (
                      <button
                        className="complete-btn"
                        onClick={() => markCompleted(task.id)}
                      >
                        Mark Completed
                      </button>
                    )}

                    <div>Review: {task.review_status}</div>

                    {task.submission && (
                      <div style={{ color: "green" }}>
                        Submission Uploaded ✅
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}