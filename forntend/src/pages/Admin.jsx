import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../services/api";

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ✅ DELETE USER */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ✅ SAFE EXCEL DOWNLOAD */
  const downloadExcel = () => {
    if (users.length === 0) {
      alert("No data available");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Role"];

    const rows = users.map(u =>
      [
        `"${u.name || ""}"`,
        `"${u.email || ""}"`,
        `"${u.phone || ""}"`,
        `"${u.role || ""}"`
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "users-data.csv";
    a.click();
  };

  /* ✅ SEARCH FILTER */
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
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
          margin-bottom: 10px;
          width: 250px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          font-size: 12px;
        }

        th {
          background: #e0f2f1;
        }

        .excel-btn {
          background: #2da0ff;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          margin-right: 10px;
        }

        .logout-btn {
          background: #757575;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
        }

        .delete-btn {
          background: red;
          color: white;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
        }

        .empty {
          text-align: center;
          padding: 10px;
          color: gray;
        }
      `}</style>

      <div className="layout">

        {/* ✅ Sidebar */}
        <div className="sidebar">
          <h2>Admin Panel</h2>

          <button onClick={loadUsers}>Refresh Data</button>
          <button onClick={downloadExcel}>Download Excel</button>
        </div>

        {/* ✅ Content */}
        <div className="content">

          {/* ✅ Navbar */}
          <div className="navbar">
            <strong>Admin Dashboard</strong>

            {/* <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button> */}
              <button
            type="button"
            className="logout-btn"
            onClick={() => navigate("/")}>
            ← Logout
            </button>

          </div>

          {/* ✅ Main */}
          <div className="main">

            <button className="excel-btn" onClick={downloadExcel}>
              Download Excel
            </button>

            <br />

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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      No Users Found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.role}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
