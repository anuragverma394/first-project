
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentTasks,
  updateProgress as apiUpdateProgress,
  markCompleted as apiMarkCompleted,
  uploadSubmission,
} from "../services/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } 
  catch (err) { console.error("Failed to parse user from localStorage:", err);    }

  const [tasks, setTasks]               = useState([]);
  const [activeTab, setActiveTab]       = useState("pending");
  const [loading, setLoading]           = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [uploadingId, setUploadingId]   = useState(null);

  useEffect(() => {
    if (!token || !user) { navigate("/"); return; }
    fetchTasks();
  }, []);
useEffect(() => {
  if (!token || !user) return;   // do nothing

  fetchTasks();
}, [token]);

useEffect(() => {
  fetchTasks();
}, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getStudentTasks();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch {
      alert("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, progress: Number(progress) } : t))
      );
      await apiUpdateProgress(id, progress);
    } catch {
      alert("Progress update failed ❌");
      fetchTasks();
    }
  };

  const markCompleted = async (id) => {
    try {
      setCompletingId(id);
      setTasks((prev) =>
        prev.map((t) => t.id === id ? { ...t, status: "completed", progress: 100 } : t)
      );
      await apiMarkCompleted(id);
    } catch {
      alert("Failed to complete task ❌");
      fetchTasks();
    } finally {
      setCompletingId(null);
    }
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file) return;
    try {
      setUploadingId(taskId);
      const res = await uploadSubmission(taskId, file);
      alert(res.message || "Uploaded ✅");
      fetchTasks();
    } catch (err) {
      alert("Upload failed ❌: " + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  const isOverdue = (task) =>
    task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  const getProgressColor = (p) => {
    if (p >= 80) return "#1a7f64";
    if (p >= 40) return "#f59e0b";
    return "#e53e3e";
  };

  const filteredTasks = tasks.filter((t) =>
    activeTab === "pending" ? t.status !== "completed" : t.status === "completed"
  );

  const pendingCount   = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount   = tasks.filter((t) => isOverdue(t)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f4f8; }

        .layout  { display: flex; height: 100vh; }

        /* Sidebar */
        .sidebar {
          width: 240px; background: linear-gradient(180deg, #1a7f64 0%, #0f5f4a 100%);
          color: #fff; padding: 24px 16px; display: flex; flex-direction: column;
          flex-shrink: 0;
        }
        .sidebar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 18px; margin-bottom: 6px;
        }
        .sidebar-sub { font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 24px; }

        .user-card {
          background: rgba(255,255,255,0.12); border-radius: 12px;
          padding: 12px 14px; margin-bottom: 20px;
        }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; margin-bottom: 8px;
        }
        .user-name { font-weight: 600; font-size: 14px; }
        .user-role { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px; }

        .s-btn {
          width: 100%; text-align: left; padding: 9px 12px;
          border: none; border-radius: 8px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          margin-bottom: 5px; background: rgba(255,255,255,0.1); color: #fff;
          transition: background 0.15s; display: flex; align-items: center; gap: 8px;
        }
        .s-btn:hover { background: rgba(255,255,255,0.22); }
        .s-btn-logout { margin-top: auto; background: rgba(220,50,50,.2); }
        .s-btn-logout:hover { background: rgba(220,50,50,.4); }

        /* Content */
        .content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .navbar {
          background: white; padding: 14px 24px;
          border-bottom: 1px solid #e8edf4;
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .navbar strong { font-size: 15px; color: #1a2332; }
        .logout-btn {
          background: #f0f4f8; color: #6b7c93; border: 1.5px solid #e2eaf4;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
        }
        .logout-btn:hover { background: #e8edf4; }

        .main { padding: 24px; overflow-y: auto; flex: 1; }

        /* Stats */
        .stat-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-card {
          background: white; border-radius: 12px; padding: 16px 20px;
          flex: 1; min-width: 100px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-left: 3px solid transparent;
        }
        .stat-card.pending-card  { border-color: #f59e0b; }
        .stat-card.done-card     { border-color: #1a7f64; }
        .stat-card.overdue-card  { border-color: #e53e3e; }
        .stat-num { font-size: 28px; font-weight: 600; color: #1a2332; }
        .stat-lbl { font-size: 11px; color: #8494a7; margin-top: 2px; }

        /* Tabs */
        .tabs { display: flex; gap: 6px; margin-bottom: 20px; }
        .tab-btn {
          padding: 8px 20px; border: 1.5px solid #e2eaf4; background: white;
          border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
          color: #6b7c93; font-family: 'DM Sans', sans-serif; transition: all 0.18s;
        }
        .tab-btn:hover { border-color: #1a7f64; color: #1a7f64; }
        .tab-btn.active { background: #1a7f64; color: white; border-color: #1a7f64; }

        /* Task Cards */
        .task-card {
          background: white; border-radius: 14px; padding: 18px 20px;
          margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1.5px solid #e8edf4;
          transition: transform 0.18s, box-shadow 0.18s;
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .task-card.overdue-card { border-color: #f5a0a0; background: #fff8f8; }
        .task-card.done-card    { border-color: #a8ddd0; background: #f6fffe; }

        .task-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; }
        .task-title  { font-weight: 600; font-size: 14px; color: #1a2332; flex: 1; }
        .task-meta   { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

        .badge {
          display: inline-flex; align-items: center; padding: 3px 10px;
          border-radius: 20px; font-size: 10px; font-weight: 600;
        }
        .badge-pending   { background: #fff3cd; color: #856404; }
        .badge-completed { background: #d4f0e9; color: #1a7f64; }
        .badge-approved  { background: #cfe2ff; color: #084298; }
        .badge-rejected  { background: #f8d7da; color: #842029; }
        .badge-overdue   { background: #ffd5d5; color: #c0392b; }

        .task-due { font-size: 11px; color: #8494a7; margin-bottom: 10px; }
        .task-due.overdue-text { color: #e53e3e; font-weight: 600; }

        /* Progress */
        .prog-row   { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .prog-label { font-size: 11px; color: #6b7c93; white-space: nowrap; }
        .prog-bar   { flex: 1; height: 7px; background: #e8edf4; border-radius: 10px; overflow: hidden; }
        .prog-fill  { height: 100%; border-radius: 10px; transition: width 0.4s ease; }
        input[type="range"] {
          width: 100%; accent-color: #1a7f64; margin: 4px 0 10px; cursor: pointer;
        }

        /* Action buttons */
        .task-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; align-items: center; }
        .btn {
          padding: 7px 14px; border: none; border-radius: 8px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          transition: all 0.15s;
        }
        .btn-complete { background: #1a7f64; color: white; }
        .btn-complete:hover:not(:disabled) { background: #0f5f4a; }
        .btn-complete:disabled { opacity: 0.6; cursor: not-allowed; }

        .upload-label {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          font-size: 12px; font-weight: 500;
          background: #f0f4f8; color: #3b6fd4; border: 1.5px solid #c7d9ff;
          transition: all 0.15s;
        }
        .upload-label:hover { background: #dbe8ff; }
        input[type="file"] { display: none; }

        .submission-note { font-size: 11px; color: #1a7f64; display: flex; align-items: center; gap: 5px; }

        .empty-state {
          text-align: center; color: #8494a7; padding: 48px 20px;
          background: white; border-radius: 14px; border: 1.5px dashed #d0dae6;
        }
        .empty-icon { font-size: 40px; margin-bottom: 10px; }
        .loading-state { text-align: center; color: #8494a7; padding: 40px; font-size: 14px; }
      `}</style>

      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-logo">📚 Student Portal</div>
          <div className="sidebar-sub">Task Management System</div>

          <div className="user-card">
            <div className="user-avatar">👤</div>
            <div className="user-name">{user?.name || "Student"}</div>
            <div className="user-role">🎓 Student</div>
          </div>

          <button className="s-btn" onClick={fetchTasks}>↻ Refresh Tasks</button>
          <button className="s-btn s-btn-logout" onClick={logout}>⏻ Logout</button>
        </div>

        {/* Content */}
        <div className="content">
          <div className="navbar">
            <strong>Student Dashboard</strong>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>

          <div className="main">

            {/* Stats */}
            <div className="stat-row">
              <div className="stat-card pending-card">
                <div className="stat-num">{pendingCount}</div>
                <div className="stat-lbl">Pending Tasks</div>
              </div>
              <div className="stat-card done-card">
                <div className="stat-num">{completedCount}</div>
                <div className="stat-lbl">Completed</div>
              </div>
              <div className="stat-card overdue-card">
                <div className="stat-num">{overdueCount}</div>
                <div className="stat-lbl">Overdue</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{tasks.length}</div>
                <div className="stat-lbl">Total Tasks</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                📋 Pending ({pendingCount})
              </button>
              <button
                className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                ✅ Completed ({completedCount})
              </button>
            </div>

            {/* Task List */}
            {loading ? (
              <div className="loading-state">⏳ Loading your tasks…</div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{activeTab === "pending" ? "🎉" : "📭"}</div>
                <div>{activeTab === "pending" ? "No pending tasks — great job!" : "No completed tasks yet"}</div>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const overdue  = isOverdue(task);
                const progress = task.progress || 0;
                const done     = task.status === "completed";

                return (
                  <div
                    key={task.id}
                    className={`task-card ${overdue ? "overdue-card" : done ? "done-card" : ""}`}
                  >
                    {/* Header */}
                    <div className="task-header">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        {overdue && <span className="badge badge-overdue">⚠ Overdue</span>}
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                        {task.review_status && task.review_status !== "pending" && (
                          <span className={`badge badge-${task.review_status}`}>
                            {task.review_status === "approved" ? "✔ Approved" : "✘ Rejected"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className={`task-due ${overdue ? "overdue-text" : ""}`}>
                      📅 Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                      {overdue && " · ⚠ Past due date!"}
                    </div>

                    {/* Progress */}
                    <div className="prog-row">
                      <span className="prog-label">Progress: {progress}%</span>
                      <div className="prog-bar">
                        <div
                          className="prog-fill"
                          style={{ width: `${progress}%`, background: getProgressColor(progress) }}
                        />
                      </div>
                    </div>

                    {!done && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => updateProgress(task.id, e.target.value)}
                      />
                    )}

                    {/* Actions */}
                    <div className="task-actions">
                      {!done && (
                        <button
                          className="btn btn-complete"
                          disabled={completingId === task.id}
                          onClick={() => markCompleted(task.id)}
                        >
                          {completingId === task.id ? "⏳ Completing…" : "✔ Mark Completed"}
                        </button>
                      )}

                      {/* File Upload */}
                      {!task.submission && (
                        <label className="upload-label">
                          {uploadingId === task.id ? "⏳ Uploading…" : "📎 Upload Submission"}
                          <input
                            type="file"
                            disabled={uploadingId === task.id}
                            onChange={(e) => handleFileUpload(task.id, e.target.files[0])}
                          />
                        </label>
                      )}

                      {/* Submission status */}
                      {task.submission && (
                        <span className="submission-note">
                          ✅ Submitted
                          {task.review_status === "pending" && " · Awaiting review"}
                        </span>
                      )}
                    </div>
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