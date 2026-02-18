
  import { useState } from "react";
import { jsPDF } from "jspdf";
import { registerUser } from "../services/api";
import { validateRegister } from "../utils/validateRegister";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "", gender: "",
    address: "", city: "", state: "", pincode: "",
    password: "", confirmPassword: "",
    qualifications: [], declaration: false, role: "student",
  });

  const [errors, setErrors]           = useState({});
  const [qualificationInput, setQualificationInput] = useState({
    collegeName: "", course: "", year: "", percentage: "",
  });
  const [editIndex, setEditIndex]     = useState(null);
  const [loading, setLoading]         = useState(false);

  /* ---------------- HELPERS ---------------- */
  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    setErrors(validateRegister(updatedForm));
  };

  const handleRoleSwitch = (role) => {
  const updatedForm = {
    ...form,
    role,
    qualifications:
      role === "admin"
        ? []   // safest & correct
        : form.qualifications,
  };

  setForm(updatedForm);
  setErrors({});
};


  const handleQualificationInputChange = (field) => (e) =>
      setQualificationInput(prev => ({
        ...prev,
        [field]: e.target.value
      }));

    /* ---------------- QUALIFICATION ---------------- */

    const validateYear = (year) => {
      const y = Number(year);
      return y >= 1750 && y <= currentYear;
    };

    const addQualification = () => {
      const { collegeName, course, year, percentage } = qualificationInput;

      if (!collegeName || !course || !year || !percentage) {
        alert("Fill all qualification details");
        return;
      }

      if (!validateYear(year)) {
        alert(`Year must be between 1750 and ${currentYear}`);
        return;
      }

      if (Number(percentage) > 100) {
        alert("Percentage cannot exceed 100");
        return;
      }

      const updatedForm = {
        ...form,
        qualifications: [...form.qualifications, qualificationInput]
      };

      setForm(updatedForm);
      setErrors(validateRegister(updatedForm)); 

      setQualificationInput({
        collegeName: "",
        course: "",
        year: "",
        percentage: ""
      });
    };


  const removeQualification = (index) => {
    const updatedForm = { ...form, qualifications: form.qualifications.filter((_, i) => i !== index) };
    setForm(updatedForm);
    setErrors(validateRegister(updatedForm));
  };

  const editQualification = (index) => {
  setQualificationInput({ ...form.qualifications[index] });
  setEditIndex(index);
};


  const updateQualification = () => {
    if (editIndex === null) return;
    if (!validateYear(qualificationInput.year)) { alert(`Year must be between 1750 and ${currentYear}`); return; }
    if (Number(qualificationInput.percentage) > 100) { alert("Percentage cannot exceed 100"); return; }
    const updated = [...form.qualifications];
    updated[editIndex] = qualificationInput;
    const updatedForm = { ...form, qualifications: updated };
    setForm(updatedForm);
    setErrors(validateRegister(updatedForm));
    setQualificationInput({ collegeName: "", course: "", year: "", percentage: "" });
    setEditIndex(null);
  };

  /* ---------------- PDF ---------------- */
  const exportPDF = () => {
    const formErrors = validateRegister(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) { alert("Please fix form errors before downloading PDF"); return; }
    if (!form.declaration) { alert("Please accept declaration before downloading PDF"); return; }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Application Form", 20, 20);
    doc.setFontSize(11);
    doc.text(`Role: ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`, 20, 30);
    doc.text(`Name: ${form.name}`, 20, 40);
    doc.text(`Email: ${form.email}`, 20, 50);
    doc.text(`Phone: ${form.phone}`, 20, 60);
    doc.text(`DOB: ${form.dob}`, 20, 70);
    doc.text(`Gender: ${form.gender}`, 20, 80);
    doc.text("Address:", 20, 95);
    doc.text(`${form.address}`, 20, 105);
    doc.text(`${form.city}, ${form.state} - ${form.pincode}`, 20, 115);
    if (form.role === "student") {
      doc.text("Qualifications:", 20, 130);
      let y = 140;
      form.qualifications.forEach((q, i) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`[${i + 1}] ${q.collegeName} - ${q.course} - ${q.year} - ${q.percentage}%`, 20, y);
        y += 10;
      });
    }
    doc.save("application-form.pdf");
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateRegister(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) { alert("Please fix errors before submit"); return; }
    if (!form.declaration) { alert("Please accept declaration"); return; }
    try {
      setLoading(true);
      const data = await registerUser(form);
      alert(data.message);
      navigate("/");
    } catch (err) {
      alert(err.message);
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
        body { margin: 0; background: #f0f4f8; font-family: 'DM Sans', sans-serif; color: #1a2332; }

        .page {
          min-height: 100vh;
          padding: 32px 20px;
          background: linear-gradient(135deg, #f0f4f8 0%, #e2eaf4 100%);
        }

        .form-wrapper { max-width: 800px; margin: 0 auto; }

        /* Role Toggle */
        .role-toggle-card {
          background: white; border-radius: 16px; padding: 6px;
          display: inline-flex; gap: 4px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px;
        }
        .role-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 28px; border-radius: 11px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.22s ease;
          background: transparent; color: #6b7c93; margin-top: 0 !important;
        }
        .role-btn.active.student {
          background: linear-gradient(135deg, #1a7f64, #25a882);
          color: white; box-shadow: 0 4px 14px rgba(26,127,100,0.35);
        }
        .role-btn.active.admin {
          background: linear-gradient(135deg, #1e40af, #3b6fd4);
          color: white; box-shadow: 0 4px 14px rgba(30,64,175,0.35);
        }
        .role-btn:not(.active):hover { background: #f3f6fa; color: #1a2332; }

        /* Form Card */
        .form-container {
          background: white; border-radius: 20px; padding: 32px 36px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.07);
          animation: fadeSlide 0.35s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px; padding-bottom: 20px;
          border-bottom: 2px solid #f0f4f8;
        }
        .form-header-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .form-header-icon.student { background: linear-gradient(135deg, #d4f0e9, #a8ddd0); }
        .form-header-icon.admin   { background: linear-gradient(135deg, #dbe8ff, #b3ccf8); }
        .form-header h1 { font-family: 'Playfair Display', serif; font-size: 22px; margin: 0 0 2px; color: #1a2332; }
        .form-header p  { margin: 0; font-size: 12px; color: #8494a7; }
        .role-badge { margin-left: auto; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
        .role-badge.student { background: #d4f0e9; color: #1a7f64; }
        .role-badge.admin   { background: #dbe8ff; color: #1e40af; }

        /* Section Title */
        .section-title {
          font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          color: #8494a7; margin: 24px 0 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #e8edf4; }

        /* Grid */
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }

        /* Field */
        .field-group { display: flex; flex-direction: column; gap: 4px; }
        .field-group.full { grid-column: 1 / -1; }

        input, select, textarea {
          padding: 9px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          border: 1.5px solid #e2eaf4; border-radius: 10px;
          background: #f8fafd; color: #1a2332;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none; width: 100%;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent, #1a7f64);
          box-shadow: 0 0 0 3px var(--accent-glow, rgba(26,127,100,0.12));
          background: white;
        }
        textarea { resize: vertical; min-height: 72px; }

        .error-text { color: #e53e3e; font-size: 11px; margin-top: 1px; }

        /* Gender */
        .gender-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .gender-option {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px; border: 1.5px solid #e2eaf4;
          border-radius: 30px; cursor: pointer; font-size: 13px;
          transition: all 0.18s; background: #f8fafd;
        }
        .gender-option input[type="radio"] { width: auto; accent-color: var(--accent, #1a7f64); }
        .gender-option:has(input:checked) {
          border-color: var(--accent, #1a7f64);
          background: var(--accent-light, #d4f0e9);
          color: var(--accent, #1a7f64); font-weight: 500;
        }

        /* Qual Box */
        .qual-box {
          display: flex; justify-content: space-between; align-items: center;
          border: 1.5px solid #e2eaf4; border-radius: 10px; padding: 10px 14px;
          font-size: 12px; margin-top: 8px; background: #f8fafd;
          gap: 8px; animation: fadeSlide 0.2s ease;
        }
        .qual-index {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--accent-light, #d4f0e9); color: var(--accent, #1a7f64);
          font-size: 10px; font-weight: 700; margin-right: 8px; flex-shrink: 0;
        }
        .qual-text { flex: 1; color: #3a4a5c; }
        .qual-actions { display: flex; gap: 6px; }

        /* Buttons */
        button { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; transition: all 0.18s; margin-top: 10px; }
        .btn-add { background: var(--accent-light, #d4f0e9); color: var(--accent, #1a7f64); border: 1.5px solid var(--accent, #1a7f64); margin-top: 12px; }
        .btn-add:hover { background: var(--accent, #1a7f64); color: white; }
        .btn-edit   { background: #fff8e6; color: #c07a00; border: 1.5px solid #f0c040; margin-top: 0; padding: 5px 10px; }
        .btn-edit:hover { background: #f0c040; color: white; }
        .btn-remove { background: #fff0f0; color: #c0392b; border: 1.5px solid #f5a0a0; margin-top: 0; padding: 5px 10px; }
        .btn-remove:hover { background: #e74c3c; color: white; }

        /* Declaration */
        .declaration {
          display: flex; align-items: center; gap: 10px; margin-top: 20px;
          padding: 14px 16px; background: #f8fafd; border: 1.5px solid #e2eaf4;
          border-radius: 10px; cursor: pointer; transition: border-color 0.18s;
        }
        .declaration:hover { border-color: var(--accent, #1a7f64); }
        .declaration.checked { border-color: var(--accent, #1a7f64); background: var(--accent-light, #d4f0e9); }
        .checkbox-box {
          width: 20px; height: 20px; border: 2px solid var(--accent, #1a7f64);
          border-radius: 5px; display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: var(--accent, #1a7f64); flex-shrink: 0;
          background: white; font-weight: 700;
        }
        .declaration span { font-size: 12px; color: #3a4a5c; }

        /* Action Row */
        .action-row { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; align-items: center; }
        .submit-btn {
          background: linear-gradient(135deg, var(--accent, #1a7f64), var(--accent-dark, #25a882));
          color: white; padding: 11px 28px; border-radius: 10px; font-size: 13px; font-weight: 600;
          box-shadow: 0 4px 14px var(--accent-glow, rgba(26,127,100,0.35)); margin-top: 0;
        }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .pdf-btn {
          background: linear-gradient(135deg, #2563eb, #3b82f6); color: white;
          padding: 11px 22px; border-radius: 10px; font-size: 13px; font-weight: 600;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3); margin-top: 0;
        }
        .pdf-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .back-btn {
          background: transparent; color: #6b7c93; border: 1.5px solid #d0dae6;
          padding: 11px 20px; border-radius: 10px; font-size: 13px; margin-top: 0; margin-left: auto;
        }
        .back-btn:hover { background: #f0f4f8; color: #1a2332; }

        /* Admin note */
        .admin-note {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          background: #eef3ff; border: 1.5px solid #c7d9ff; border-radius: 10px;
          font-size: 12px; color: #1e40af; margin-bottom: 6px;
        }

        /* Themes */
        .student-theme { --accent: #1a7f64; --accent-dark: #25a882; --accent-light: #d4f0e9; --accent-glow: rgba(26,127,100,0.2); }
        .admin-theme   { --accent: #1e40af; --accent-dark: #3b6fd4; --accent-light: #dbe8ff; --accent-glow: rgba(30,64,175,0.25); }

        @media (max-width: 500px) {
          .form-container { padding: 20px 16px; }
          .action-row { flex-direction: column; }
          .back-btn { margin-left: 0; }
        }
      `}</style>

      <div className="page">
        <div className="form-wrapper">

          {/* Role Toggle */}
          <div className="role-toggle-card">
            <button
              type="button"
              className={`role-btn student ${form.role === "student" ? "active" : ""}`}
              onClick={() => handleRoleSwitch("student")}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={`role-btn admin ${form.role === "admin" ? "active" : ""}`}
              onClick={() => handleRoleSwitch("admin")}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Form Card */}
          <div className={`form-container ${isAdmin ? "admin-theme" : "student-theme"}`} key={form.role}>
            <div className="form-header">
              <div className={`form-header-icon ${isAdmin ? "admin" : "student"}`}>
                {isAdmin ? "🛡️" : "🎓"}
              </div>
              <div>
                <h1>{isAdmin ? "Admin Registration" : "Student Application"}</h1>
                <p>{isAdmin ? "Create an administrator account" : "Fill in your details to register"}</p>
              </div>
              <span className={`role-badge ${isAdmin ? "admin" : "student"}`}>
                {isAdmin ? "Admin" : "Student"}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {isAdmin && (
                <div className="admin-note">
                  ℹ️ Admin accounts have elevated permissions. All details are subject to verification.
                </div>
              )}

              {/* Personal Details */}
              <div className="section-title">Personal Details</div>
              <div className="grid">
                <div className="field-group">
                  <input placeholder="Full Name" value={form.name} onChange={handleChange("name")} />
                  {errors.name && <div className="error-text">{errors.name}</div>}
                </div>
                <div className="field-group">
                  <input placeholder="Email" value={form.email} onChange={handleChange("email")} />
                  {errors.email && <div className="error-text">{errors.email}</div>}
                </div>
                <div className="field-group">
                  <input placeholder="Phone Number" value={form.phone} onChange={handleChange("phone")} />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>
                <div className="field-group">
                  <input type="date" value={form.dob} onChange={handleChange("dob")} />
                  {errors.dob && <div className="error-text">{errors.dob}</div>}
                </div>
              </div>

              {/* Gender */}
              <div className="section-title">Gender</div>
              <div className="gender-row">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="gender-option">
                    <input type="radio" name="gender" value={g}
                      checked={form.gender === g} onChange={handleChange("gender")} />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && <div className="error-text" style={{ marginTop: 6 }}>{errors.gender}</div>}

              {/* Address */}
              <div className="section-title">Address</div>
              <div className="grid">
                <div className="field-group full">
                  <textarea placeholder="Street Address" value={form.address} onChange={handleChange("address")} />
                  {errors.address && <div className="error-text">{errors.address}</div>}
                </div>
                <div className="field-group">
                  <input placeholder="City" value={form.city} onChange={handleChange("city")} />
                  {errors.city && <div className="error-text">{errors.city}</div>}
                </div>
                <div className="field-group">
                  <input placeholder="State" value={form.state} onChange={handleChange("state")} />
                  {errors.state && <div className="error-text">{errors.state}</div>}
                </div>
                <div className="field-group">
                  <input placeholder="Pincode" value={form.pincode} onChange={handleChange("pincode")} />
                  {errors.pincode && <div className="error-text">{errors.pincode}</div>}
                </div>
              </div>

              {/* Qualifications — students only */}
              {!isAdmin && (
                <>
                  <div className="section-title">Qualifications</div>
                  {errors.qualifications && <div className="error-text" style={{ marginBottom: 8 }}>{errors.qualifications}</div>}
                  <div className="grid">
                    <input placeholder="College Name" value={qualificationInput.collegeName} onChange={handleQualificationInputChange("collegeName")} />
                    <select value={qualificationInput.course} onChange={handleQualificationInputChange("course")}>
                      <option value="">Select Course</option>
                      <option value="BSc">BSc</option>
                      <option value="BCom">BCom</option>
                      <option value="BTech">BTech</option>
                      <option value="BA">BA</option>
                      <option value="MBA">MBA</option>
                      <option value="MCA">MCA</option>
                    </select>
                    <input placeholder="Year of Completion" value={qualificationInput.year} onChange={handleQualificationInputChange("year")} />
                    <input placeholder="Percentage / CGPA" value={qualificationInput.percentage} onChange={handleQualificationInputChange("percentage")} />
                  </div>
                  <button type="button" className="btn-add" onClick={editIndex !== null ? updateQualification : addQualification}>
                    {editIndex !== null ? "✔ Update Qualification" : "+ Add Qualification"}
                  </button>
                  {form.qualifications.map((q, i) => (
                    <div key={i} className="qual-box">
                      <span className="qual-index">{i + 1}</span>
                      <span className="qual-text">{q.collegeName} — {q.course} — {q.year} — {q.percentage}%</span>
                      <div className="qual-actions">
                        <button type="button" className="btn-edit" onClick={() => editQualification(i)}>Edit</button>
                        <button type="button" className="btn-remove" onClick={() => removeQualification(i)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Security */}
              <div className="section-title">Security</div>
              <div className="grid">
                <div className="field-group">
                  <input type="password" placeholder="Password" value={form.password} onChange={handleChange("password")} />
                  {errors.password && <div className="error-text">{errors.password}</div>}
                </div>
                <div className="field-group">
                  <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} />
                  {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
                </div>
              </div>

              {/* Declaration */}
              <div className={`declaration ${form.declaration ? "checked" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, declaration: !prev.declaration }))}
              >
                <div className="checkbox-box">{form.declaration && "✓"}</div>
                <span>I hereby declare that the information provided is true and accurate to the best of my knowledge.</span>
              </div>

              {/* Actions */}
              <div className="action-row">
                <button className="submit-btn" disabled={loading}>
                  {loading ? "Submitting…" : isAdmin ? "Register as Admin" : "Submit Application"}
                </button>
                <button type="button" className="pdf-btn" onClick={exportPDF}>
                  ⬇ Download PDF
                </button>
                <button type="button" className="back-btn" onClick={() => navigate("/")}>
                  ← Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}