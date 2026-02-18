
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  deleteUser,
  getStudentDetails,
  getAdminTasks,
  assignTask,
  deleteTask,
  reviewSubmission,
} from "../services/api";

/* ─── Colored status pill ─── */
function Badge({ value }) {
  const map = {
    completed : { bg: "#c8e6c9", fg: "#1b5e20" },
    pending   : { bg: "#fff9c4", fg: "#f57f17" },
    approved  : { bg: "#bbdefb", fg: "#0d47a1" },
    rejected  : { bg: "#ffcdd2", fg: "#b71c1c" },
    admin     : { bg: "#e1bee7", fg: "#4a148c" },
    student   : { bg: "#e0f2f1", fg: "#004d40" },
    male      : { bg: "#e3f2fd", fg: "#1565c0" },
    female    : { bg: "#fce4ec", fg: "#880e4f" },
  };
  const s = map[value?.toLowerCase()] || { bg: "#f0f0f0", fg: "#444" };
  return (
    <span style={{
      background: s.bg, color: s.fg,
      padding: "2px 9px", borderRadius: 10,
      fontSize: 10, fontWeight: "bold", display: "inline-block",
    }}>
      {value || "—"}
    </span>
  );
}

/* ─── Simple modal overlay ─── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, padding: 28,
        minWidth: 480, maxWidth: 680, width: "90%", maxHeight: "85vh",
        overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <strong style={{ fontSize: 16, color: "#00695c" }}>{title}</strong>
          <button onClick={onClose} style={{
            border: "none", background: "#eee", borderRadius: "50%",
            width: 28, height: 28, cursor: "pointer", fontSize: 16, lineHeight: "28px",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Admin() {
  const navigate = useNavigate();
//   const token = localStorage.getItem("token");

// let user = null;
// try {
//   user = JSON.parse(localStorage.getItem("user"));
// } catch {}


  /* state */
  const [activeTab, setActiveTab]         = useState("tasks");
  const [users, setUsers]                 = useState([]);
  const [students, setStudents]           = useState([]);
  const [tasks, setTasks]                 = useState([]);
  const [userSearch, setUserSearch]       = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [taskSearch, setTaskSearch]       = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [lastRefresh, setLastRefresh]     = useState(null);
  const [taskForm, setTaskForm]           = useState({ email: "", title: "", due_date: "" });
  const [selectedStudent, setSelectedStudent] = useState(null); // for modal

//   useEffect(() => {
//   if (!token || !user) {
//     navigate("/", { replace: true });
//     return;
//   }

//   if (user.role !== "admin") {
//     navigate("/", { replace: true });
//     return;
//   }
// }, []);

 useEffect(() => {
  loadAll();
 // const interval = setInterval(loadTasks, 10000);
  //return () => clearInterval(interval);
}, []);


  /* ── loaders ── */
  const loadAll = () => { loadUsers(); loadStudents(); loadTasks(); };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) { console.error(err.message); }
  };

  const loadStudents = async () => {
    try {
      const data = await getStudentDetails();
      setStudents(data.students || []);
    } catch (err) { console.error(err.message); }
  };

  const loadTasks = async () => {
    try {
      const data = await getAdminTasks();
      setTasks(data.tasks || []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) { console.error(err.message); }
  };

  /* ── actions ── */
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user? This will also remove their tasks.")) return;
    try { await deleteUser(id); loadUsers(); loadStudents(); loadTasks(); }
    catch (err) { alert(err.message); }
  };

  const handleAssignTask = async () => {
    if (!taskForm.email || !taskForm.title) { alert("Fill in student email & task title"); return; }
    try {
      const data = await assignTask(taskForm);
      alert(data.message);
      setTaskForm({ email: "", title: "", due_date: "" });
      loadTasks();
    } catch (err) { alert("Task assignment failed ❌: " + err.message); }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try { await deleteTask(id); loadTasks(); }
    catch (err) { alert(err.message); }
  };

  const handleReview = async (id, status) => {
    try { await reviewSubmission(id, status); loadTasks(); }
    catch (err) { alert(err.message); }
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  /* ── filtered data ── */
  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.name?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.email?.toLowerCase().includes(taskSearch.toLowerCase());
    const matchStatus =
      taskStatusFilter === "all" || t.status === taskStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.city?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.state?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ── counts ── */
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount   = tasks.filter((t) => t.status !== "completed").length;
  const submittedCount = tasks.filter((t) => t.submission).length;

  /* ── tab list ── */
  const TABS = [
    { key: "tasks",       label: "📋 All Tasks" },
    { key: "submissions", label: "📎 Submissions" },
    { key: "students",    label: "🎓 Student Details" },
    { key: "users",       label: "👥 Users" },
  ];

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f0f2f5; }

        /* Layout */
        .layout  { display: flex; height: 100vh; }
        .sidebar { width: 230px; background: #00695c; color: #fff; padding: 20px 16px; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar h2 { font-size: 17px; margin-bottom: 18px; }
        .s-btn { width: 100%; text-align: left; padding: 9px 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; margin-bottom: 6px; background: rgba(255,255,255,0.12); color: #fff; transition: background .15s; }
        .s-btn:hover, .s-btn.active { background: rgba(255,255,255,0.25); }
        .s-btn-logout { margin-top: auto; background: rgba(220,50,50,.25); }
        .s-btn-logout:hover { background: rgba(220,50,50,.4); }

        /* Content */
        .content  { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .navbar   { background: #fff; padding: 12px 22px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .navbar strong { font-size: 15px; color: #333; }
        .main     { padding: 22px; overflow: auto; flex: 1; }

        /* Stats row */
        .stat-row { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
        .stat-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 14px 18px; flex: 1; min-width: 110px; text-align: center; }
        .stat-num  { font-size: 26px; font-weight: bold; }
        .stat-lbl  { font-size: 11px; color: #888; margin-top: 4px; }

        /* Tabs */
        .tabs     { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn  { padding: 8px 16px; border: 1px solid #ccc; background: #fff; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: bold; color: #555; }
        .tab-btn:hover { border-color: #00695c; color: #00695c; }
        .tab-btn.active { background: #00695c; color: #fff; border-color: #00695c; }

        /* Section title */
        .sec-title { font-size: 14px; font-weight: bold; color: #333; border-left: 3px solid #00695c; padding-left: 9px; margin-bottom: 12px; }

        /* Panel (assign task form) */
        .panel { background: #fff; border: 1px solid #e0e0e0; border-radius: 7px; padding: 18px; margin-bottom: 22px; }
        .panel label { display: block; font-size: 11px; font-weight: bold; color: #555; margin-bottom: 3px; margin-top: 10px; }
        .panel label:first-of-type { margin-top: 0; }
        .panel input { padding: 7px 10px; font-size: 12px; width: 280px; border: 1px solid #ccc; border-radius: 4px; display: block; }
        .panel input:focus { outline: 2px solid #00695c; border-color: #00695c; }

        /* Tables */
        .tbl-wrap { overflow-x: auto; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; }
        th, td { border-bottom: 1px solid #efefef; padding: 9px 11px; font-size: 12px; white-space: nowrap; }
        th { background: #e8f5e9; font-weight: bold; text-align: left; color: #333; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f5fffe; }
        td.wrap { white-space: normal; max-width: 220px; word-break: break-word; }
        .no-data { text-align: center; color: #bbb; padding: 18px !important; }

        /* Search & filter bar */
        .bar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
        .search-box { padding: 7px 11px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; width: 260px; }
        .search-box:focus { outline: 2px solid #00695c; }
        .filter-select { padding: 7px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; }

        /* Buttons */
        .btn { padding: 7px 14px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn-green  { background: #00695c; color: #fff; }
        .btn-green:hover { background: #004d40; }
        .btn-red    { background: #e53935; color: #fff; }
        .btn-red:hover { background: #c62828; }
        .btn-approve { background: #2e7d32; color: #fff; margin-right: 5px; }
        .btn-reject  { background: #c62828; color: #fff; }
        .btn-view    { background: #1565c0; color: #fff; }
        .btn-logout  { background: #757575; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; }

        /* Progress bar */
        .prog-wrap { display: flex; align-items: center; gap: 6px; }
        .prog-bar  { background: #e0e0e0; border-radius: 4px; height: 6px; width: 65px; overflow: hidden; flex-shrink: 0; }
        .prog-fill { height: 100%; background: #00695c; border-radius: 4px; }

        /* Refresh note */
        .refresh-note { font-size: 11px; color: #aaa; margin-bottom: 8px; }

        /* Modal detail grid */
        .detail-grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px 14px; font-size: 13px; }
        .detail-grid .lbl { color: #888; font-weight: bold; }
        .detail-grid .val { color: #222; }
      `}</style>

      {/* ── STUDENT DETAIL MODAL ── */}
      {selectedStudent && (
        <Modal
          title={`Student: ${selectedStudent.name}`}
          onClose={() => setSelectedStudent(null)}
        >
          <div className="detail-grid">
            <span className="lbl">ID</span>           <span className="val">{selectedStudent.id}</span>
            <span className="lbl">Name</span>         <span className="val">{selectedStudent.name || "—"}</span>
            <span className="lbl">Email</span>        <span className="val">{selectedStudent.email}</span>
            <span className="lbl">Phone</span>        <span className="val">{selectedStudent.phone || "—"}</span>
            <span className="lbl">Date of Birth</span><span className="val">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "—"}</span>
            <span className="lbl">Gender</span>       <span className="val"><Badge value={selectedStudent.gender} /></span>
            <span className="lbl">Address</span>      <span className="val">{selectedStudent.address || "—"}</span>
            <span className="lbl">City</span>         <span className="val">{selectedStudent.city || "—"}</span>
            <span className="lbl">State</span>        <span className="val">{selectedStudent.state || "—"}</span>
            <span className="lbl">Pincode</span>      <span className="val">{selectedStudent.pincode || "—"}</span>
            <span className="lbl">Qualifications</span><span className="val">{selectedStudent.qualifications_display || selectedStudent.qualifications || "—"}</span>
            <span className="lbl">Role</span>         <span className="val"><Badge value={selectedStudent.role} /></span>
            <span className="lbl">Tasks</span>        <span className="val">{tasks.filter(t => t.email === selectedStudent.email).length} assigned</span>
            <span className="lbl">Completed</span>    <span className="val">{tasks.filter(t => t.email === selectedStudent.email && t.status === "completed").length} tasks</span>
          </div>
        </Modal>
      )}

      <div className="layout">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <h2>🛡 Admin Panel</h2>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`s-btn ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
          <button className="s-btn" style={{ marginTop: 10 }} onClick={loadAll}>↻ Refresh All</button>
          <button className="s-btn s-btn-logout" onClick={logout}>⏻ Logout</button>
        </div>

        <div className="content">

          {/* ── NAVBAR ── */}
          <div className="navbar">
            <strong>Admin Dashboard</strong>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>

          <div className="main">

            {/* ── SUMMARY STATS ── */}
            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#00695c" }}>{tasks.length}</div>
                <div className="stat-lbl">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#f57f17" }}>{pendingCount}</div>
                <div className="stat-lbl">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#2e7d32" }}>{completedCount}</div>
                <div className="stat-lbl">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#1565c0" }}>{submittedCount}</div>
                <div className="stat-lbl">Submissions</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#6a1b9a" }}>{students.length}</div>
                <div className="stat-lbl">Students</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{users.length}</div>
                <div className="stat-lbl">Total Users</div>
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ════════════ TAB: ALL TASKS ════════════ */}
            {activeTab === "tasks" && (
              <>
                {/* Assign Task Form */}
                <div className="panel">
                  <p className="sec-title">Assign Task to Student</p>
                  <label>Student Email</label>
                  <input
                    placeholder="student@example.com"
                    value={taskForm.email}
                    onChange={(e) => setTaskForm({ ...taskForm, email: e.target.value })}
                  />
                  <label>Task Title</label>
                  <input
                    placeholder="e.g. Complete Module 3"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                  <button className="btn btn-green" style={{ marginTop: 14 }} onClick={handleAssignTask}>
                    ＋ Assign Task
                  </button>
                </div>

                {/* Task Table */}
                <p className="sec-title">All Tasks</p>
                {lastRefresh && (
                  <div className="refresh-note">Last updated: {lastRefresh} · auto-refreshes every 10 s</div>
                )}
                <div className="bar">
                  <input
                    className="search-box"
                    placeholder="Search by student, email or task title…"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                  <select
                    className="filter-select"
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Task Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Review</th>
                        <th>Submission</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length === 0 ? (
                        <tr><td colSpan="10" className="no-data">No tasks found</td></tr>
                      ) : (
                        filteredTasks.map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#aaa" }}>{t.id}</td>
                            <td><b>{t.name}</b></td>
                            <td style={{ color: "#555" }}>{t.email}</td>
                            <td>{t.title}</td>
                            <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A"}</td>
                            <td><Badge value={t.status} /></td>
                            <td>
                              <div className="prog-wrap">
                                <div className="prog-bar">
                                  <div className="prog-fill" style={{ width: `${t.progress ?? 0}%` }} />
                                </div>
                                <span>{t.progress ?? 0}%</span>
                              </div>
                            </td>
                            {/* <td><Badge value={t.review_status} /></td> */}
                            <td>
  {t.submission ? (
    t.review_status === "pending" ? (
      <>
        <button
          className="btn btn-approve"
          onClick={() => handleReview(t.id, "approved")}
        >
          Approve
        </button>

        <button
          className="btn btn-reject"
          onClick={() => handleReview(t.id, "rejected")}
        >
          Reject
        </button>
      </>
    ) : (
      <Badge value={t.review_status} />
    )
  ) : (
    <span style={{ color: "#bbb" }}>—</span>
  )}
</td>

                            <td>
                              {t.submission
                                ? <a href={`http://localhost:3000/uploads/${t.submission}`} target="_blank" rel="noreferrer" style={{ color: "#1565c0" }}>📎 View</a>
                                : <span style={{ color: "#bbb" }}>—</span>
                              }
                            </td>
                            <td>
                              <button className="btn btn-red" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ════════════ TAB: SUBMISSIONS ════════════ */}
            {activeTab === "submissions" && (
              <>
                <p className="sec-title">Student Submissions</p>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Task Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>File</th>
                        <th>Review Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.filter((t) => t.submission).length === 0 ? (
                        <tr><td colSpan="9" className="no-data">No submissions yet</td></tr>
                      ) : (
                        tasks.filter((t) => t.submission).map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#aaa" }}>{t.id}</td>
                            <td><b>{t.name}</b></td>
                            <td>{t.email}</td>
                            <td>{t.title}</td>
                            <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A"}</td>
                            <td><Badge value={t.status} /></td>
                            <td>
                              <a
                                href={`http://localhost:3000/uploads/${t.submission}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#1565c0" }}
                              >
                                📎 {t.submission}
                              </a>
                            </td>
                            <td><Badge value={t.review_status} /></td>
                            <td>
                              <button className="btn btn-approve" onClick={() => handleReview(t.id, "approved")}>Approve</button>
                              <button className="btn btn-reject"  onClick={() => handleReview(t.id, "rejected")}>Reject</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ════════════ TAB: STUDENT DETAILS ════════════ */}
            {activeTab === "students" && (
              <>
                <p className="sec-title">All Student Details</p>
                <div className="bar">
                  <input
                    className="search-box"
                    placeholder="Search by name, email, city or state…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date of Birth</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Pincode</th>
                        <th>Qualifications</th>
                        <th>Tasks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan="13" className="no-data">No students found</td></tr>
                      ) : (
                        filteredStudents.map((s) => {
                          const studentTasks = tasks.filter((t) => t.email === s.email);
                          const done = studentTasks.filter((t) => t.status === "completed").length;
                          return (
                            <tr key={s.id}>
                              <td style={{ color: "#aaa" }}>{s.id}</td>
                              <td><b>{s.name || "—"}</b></td>
                              <td>{s.email}</td>
                              <td>{s.phone || "—"}</td>
                              <td>{s.dob ? new Date(s.dob).toLocaleDateString() : "—"}</td>
                              <td><Badge value={s.gender} /></td>
                              <td className="wrap">{s.address || "—"}</td>
                              <td>{s.city || "—"}</td>
                              <td>{s.state || "—"}</td>
                              <td>{s.pincode || "—"}</td>
                              <td className="wrap">{s.qualifications_display || s.qualifications || "—"}</td>
                              <td>
                                <span style={{ color: "#2e7d32", fontWeight: "bold" }}>{done}</span>
                                <span style={{ color: "#aaa" }}>/{studentTasks.length}</span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-view"
                                  style={{ marginRight: 5 }}
                                  onClick={() => setSelectedStudent(s)}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-red"
                                  onClick={() => handleDeleteUser(s.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ════════════ TAB: USERS ════════════ */}
            {activeTab === "users" && (
              <>
                <p className="sec-title">All Registered Users</p>
                <div className="bar">
                  <input
                    className="search-box"
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" className="no-data">No users found</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td style={{ color: "#aaa" }}>{u.id}</td>
                            <td><b>{u.name}</b></td>
                            <td>{u.email}</td>
                            <td>{u.phone || "—"}</td>
                            <td><Badge value={u.role} /></td>
                            <td>
                              <button className="btn btn-red" onClick={() => handleDeleteUser(u.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>{/* /main */}
        </div>{/* /content */}
      </div>{/* /layout */}
    </>
  );
}