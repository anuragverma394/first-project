import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const updated = { ...form, [field]: e.target.value };
    setForm(updated);
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      /* ⭐ HARDCODED ADMIN LOGIN */
      if (
        form.role === "admin" &&
        form.email === "admin@gmail.com" &&
        form.password === "admin"
      ) {
        navigate("/admin");
        return;
      }

      const res = await loginUser(form);

      if (res.success) {
        if (form.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/student");
        }
      } else {
        setError("Invalid email or password");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          background: #e8edf0;
          font-family: Arial, sans-serif;
        }

        .page {
          padding: 40px;
          display: flex;
          justify-content: center;
        }

        .form-container {
          background: white;
          border: 1px solid #4a8eaa;
          padding: 20px;
          width: 350px;
        }

        .header {
          font-size: 18px;
          border-bottom: 1px solid #33383a;
          padding-bottom: 6px;
          color: #00695c;
          margin-bottom: 20px;
        }

        input, select {
          width: 100%;
          padding: 6px;
          font-size: 12px;
          border: 1px solid #b0bec5;
          background: #e9eff3;
          margin-bottom: 10px;
        }

        button {
          font-size: 11px;
          padding: 6px 12px;
          cursor: pointer;
          margin-right: 10px;
        }

        .login-btn {
          background: #00695c;
          color: white;
          border: none;
        }

        .register-btn {
          background: #2da0ff;
          color: white;
          border: none;
        }

        .error-text {
          color: red;
          font-size: 12px;
          margin-top: 5px;
        }
      `}</style>

      <div className="page">
        <div className="form-container">
          <div className="header">User Login</div>

          <select value={form.role} onChange={handleChange("role")}>
            <option value="student">Student Login</option>
            <option value="admin">Admin Login</option>
          </select>

          <input
            placeholder="Email"
            value={form.email}
            onChange={handleChange("email")}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
          />

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

          {error && <div className="error-text">{error}</div>}
        </div>
      </div>
    </>
  );
}
