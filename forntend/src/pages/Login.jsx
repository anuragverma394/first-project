
import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleLogin = async () => {
  setError("");

  if (!form.email || !form.password) {
    setError("Please enter email and password");
    return;
  }

  setLoading(true);

  try {
    /* Static admin shortcut */
    if (
      form.role === "admin" &&
      form.email === "admin@gmail.com" &&
      form.password === "admin"
    ) {
      navigate("/admin");
      return;
    }

    const res = await loginUser(form);

    if (!res.success) {
      setError("Invalid credentials");
      return;
    }

    /* ✅ CRITICAL ROLE CHECK */
    if (res.user.role !== form.role) {
      setError(
        `This account is registered as ${res.user.role}. Please select the correct login option.`
      );
      return;
    }

    /* ✅ Save session */
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    navigate(res.user.role === "admin" ? "/admin" : "/student");
  } catch (err) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  const isAdmin = form.role === "admin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f4f8 0%, #e2eaf4 100%);
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
          animation: fadeUp 0.35s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Role Toggle */
        .role-toggle {
          display: flex;
          background: #f0f4f8;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 28px;
        }

        .role-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #6b7c93;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .role-btn.active.student {
          background: white;
          color: #1a7f64;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .role-btn.active.admin {
          background: white;
          color: #1e40af;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 14px;
          transition: background 0.3s;
        }

        .login-icon.student { background: linear-gradient(135deg, #d4f0e9, #a8ddd0); }
        .login-icon.admin   { background: linear-gradient(135deg, #dbe8ff, #b3ccf8); }

        .login-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          margin: 0 0 4px;
          color: #1a2332;
        }

        .login-header p {
          margin: 0;
          font-size: 12px;
          color: #8494a7;
        }

        /* Fields */
        .field-group {
          margin-bottom: 14px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #6b7c93;
          margin-bottom: 6px;
        }

        .field-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          border: 1.5px solid #e2eaf4;
          border-radius: 10px;
          background: #f8fafd;
          color: #1a2332;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
        }

        .field-input:focus {
          border-color: var(--accent, #1a7f64);
          box-shadow: 0 0 0 3px var(--accent-glow, rgba(26,127,100,0.12));
          background: white;
        }

        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #8494a7;
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        /* Error */
        .error-box {
          background: #fff0f0;
          border: 1.5px solid #f5a0a0;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          color: #c0392b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Buttons */
        .login-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, var(--accent, #1a7f64), var(--accent-dark, #25a882));
          color: white;
          box-shadow: 0 4px 14px var(--accent-glow, rgba(26,127,100,0.3));
          margin-bottom: 10px;
        }

        .login-btn:hover:not(:disabled) {
          filter: brightness(1.07);
          transform: translateY(-1px);
        }

        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .register-btn {
          width: 100%;
          padding: 11px;
          border: 1.5px solid #e2eaf4;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          color: #6b7c93;
          transition: all 0.18s;
        }

        .register-btn:hover {
          background: #f0f4f8;
          border-color: var(--accent, #1a7f64);
          color: var(--accent, #1a7f64);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
          color: #c0cad4;
          font-size: 11px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8edf4;
        }

        /* Theme vars */
        .student-theme {
          --accent: #1a7f64;
          --accent-dark: #25a882;
          --accent-glow: rgba(26,127,100,0.2);
        }
        .admin-theme {
          --accent: #1e40af;
          --accent-dark: #3b6fd4;
          --accent-glow: rgba(30,64,175,0.2);
        }
      `}</style>

      <div className="login-page">
        <div className={`login-card ${isAdmin ? "admin-theme" : "student-theme"}`}>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn student ${!isAdmin ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "student" })}
            >
              🎓 Student
            </button>
            <button
              className={`role-btn admin ${isAdmin ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "admin" })}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Header */}
          <div className="login-header">
            <div className={`login-icon ${isAdmin ? "admin" : "student"}`}>
              {isAdmin ? "🛡️" : "🎓"}
            </div>
            <h1>{isAdmin ? "Admin Login" : "Student Login"}</h1>
            <p>{isAdmin ? "Access the admin control panel" : "Sign in to view your tasks"}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">⚠ {error}</div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input
              className="field-input"
              placeholder={isAdmin ? "admin@gmail.com" : "your@email.com"}
              value={form.email}
              onChange={handleChange("email")}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <input
                className="field-input"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{ paddingRight: 38 }}
              />
              <button
                className="pass-toggle"
                type="button"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Signing in…" : `Sign in as ${isAdmin ? "Admin" : "Student"}`}
          </button>

          <div className="divider">or</div>

          {/* Register Button */}
          <button className="register-btn" onClick={() => navigate("/register")}>
            Create a new account
          </button>

        </div>
      </div>
    </>
  );
}