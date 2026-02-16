import { useState } from "react";
import { jsPDF } from "jspdf";
import { registerUser } from "../services/api";
import { validateRegister } from "../utils/validateRegister";   
import { useNavigate } from "react-router-dom";
export default function Register() {


    const navigate = useNavigate(); 

  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    collegeName: "",
    course: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    qualifications: [],
    declaration: false
  });

  const [errors, setErrors] = useState({});

  const [qualificationInput, setQualificationInput] = useState({
    collegeName: "",
    course: "",
    year: "",
    percentage: ""
  });

  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- INPUT HANDLER ---------------- */

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    const updatedForm = { ...form, [field]: value };

    setForm(updatedForm);

    // ✅ Real-time validation
    setErrors(validateRegister(updatedForm));
  };

  const handleQualificationInputChange = (field) => (e) =>
    setQualificationInput(prev => ({
      ...prev,
      [field]: e.target.value
    }));

  /* ---------------- QUALIFICATION ---------------- */

  const validateYear = (year) => {
    const y = Number(year);
    return y >= 1960 && y <= currentYear;
  };

  const addQualification = () => {
    const { collegeName, course, year, percentage } = qualificationInput;

    if (!collegeName || !course || !year || !percentage) {
      alert("Fill all qualification details");
      return;
    }

    if (!validateYear(year)) {
      alert(`Year must be between 1960 and ${currentYear}`);
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
    setErrors(validateRegister(updatedForm)); // ✅ Revalidate

    setQualificationInput({
      collegeName: "",
      course: "",
      year: "",
      percentage: ""
    });
  };

  const removeQualification = (index) => {
    const updatedForm = {
      ...form,
      qualifications: form.qualifications.filter((_, i) => i !== index)
    };

    setForm(updatedForm);
    setErrors(validateRegister(updatedForm));
  };

  const editQualification = (index) => {
    setQualificationInput(form.qualifications[index]);
    setEditIndex(index);
  };

  const updateQualification = () => {
      if (editIndex === null) return;

    if (!validateYear(qualificationInput.year)) {
      alert(`Year must be between 1960 and ${currentYear}`);
      return;
    }

    if (Number(qualificationInput.percentage) > 100) {
      alert("Percentage cannot exceed 100");
      return;
    }

    const updated = [...form.qualifications];
    updated[editIndex] = qualificationInput;

    const updatedForm = { ...form, qualifications: updated };

    setForm(updatedForm);
    setErrors(validateRegister(updatedForm));

    setQualificationInput({
      collegeName: "",
      course: "",
      year: "",
      percentage: ""
    });

    setEditIndex(null);
  };

  /* ---------------- PDF ---------------- */

  const exportPDF = () => {

    const formErrors = validateRegister(form);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      alert("Please fix form errors before downloading PDF");
      return;
    }

    if (!form.declaration) {
      alert("Please accept declaration before downloading PDF");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Application Form", 20, 20);

    doc.setFontSize(11);
    doc.text(`Name: ${form.name}`, 20, 35);
    doc.text(`Email: ${form.email}`, 20, 45);
    doc.text(`Phone: ${form.phone}`, 20, 55);
    doc.text(`DOB: ${form.dob}`, 20, 65);
    doc.text(`Gender: ${form.gender}`, 20, 75);

    doc.text("Address:", 20, 90);
    doc.text(`${form.address}`, 20, 100);
    doc.text(`${form.city}, ${form.state} - ${form.pincode}`, 20, 110);

    doc.text("Qualifications:", 20, 130);

    let y = 140;

    form.qualifications.forEach((q, i) => {
      if (y > 280) {     // ✅ ADDED
    doc.addPage();    // ✅ ADDED
    y = 20;           
  }
      doc.text(
        `[${i + 1}] ${q.collegeName} - ${q.course} - ${q.year} - ${q.percentage}%`,
        20,
        y
      );
      y += 10;
    });

    doc.save("application-form.pdf");
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateRegister(form);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      alert("Please fix errors before submit");
      return;
    }

    if (!form.declaration) {
      alert("Please accept declaration");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser(form);
      alert(data.message);
    } catch (err) {
      alert(err.message);
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
          .error-text {
          color: red;
          font-size: 12px;
          margin-top: 2px;
          }

        .page {
          padding: 20px 40px;
        }

        .form-container {
          background: white;
          border: 1px solid #4a8eaa;
          padding: 20px;
        }

        .header {
          font-size: 18px;
          border-bottom: 1px solid #33383a;
          padding-bottom: 6px;
          color: #00695c;
        }

        .section-title {
          font-size: 13px;
          margin: 15px 0 8px;
          border-bottom: 1px solid #d0d7dc;
          color: #00695c;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px 12px;
        }

        input, select, textarea {
          padding: 6px;
          font-size: 12px;
          border: 1px solid #b0bec5;
          background: #e9eff3;
        }

        button {
          font-size: 11px;
          padding: 6px 12px;
          margin-top: 10px;
          cursor: pointer;
        }

        .qual-box {
          border: 1px solid #8da6b1;
          padding: 6px;
          font-size: 11px;
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
        }

        .gender-row {
          display: flex;
          gap: 20px;
          font-size: 12px;
          margin-top: 8px;
        }

        .declaration {
          display: flex;
          align-items: center;
          margin-top: 14px;
          font-size: 12px;
        }

        .checkbox-box {
          width: 16px;
          height: 16px;
          border: 1px solid black;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .submit-btn {
          background: #00695c;
          color: white;
          border: none;
        }

        .pdf-btn {
          background: #2da0ff;
          color: white;
          border: none;
          margin-left: 10px;
        }
         
            .back-btn {
            background: #757575;
            color: white;
            border: none;
            margin-bottom: 25px;
            }


      `}</style>

      <div className="page">
        <div className="form-container">
          <div className="header">Application / Registration Form</div>

          <form onSubmit={handleSubmit}>

            <div className="section-title">Personal Details</div>
            <div className="grid">
              <input placeholder="Full Name" value={form.name} onChange={handleChange("name")} />
              {errors.name && <div className="error-text">{errors.name}</div>}


              <input placeholder="Email (Gmail)" value={form.email} onChange={handleChange("email")} />
              {errors.email && <div className="error-text">{errors.email}</div>}


              <input placeholder="Phone Number" value={form.phone} onChange={handleChange("phone")} />
              {errors.phone && <div className="error-text">{errors.phone}</div>}

              <input type="date" value={form.dob} onChange={handleChange("dob")} />
              {errors.dob && <div className="error-text">{errors.dob}</div>}
            </div>

            <div className="section-title">Gender</div>
            <div className="gender-row">
              {["Male", "Female", "Other"].map(g => (
                <label key={g}>
                  <input type="radio" name="gender" value={g}
                    checked={form.gender === g}
                    onChange={handleChange("gender")}
                  />
                  {g}
                </label>
              ))}
            </div>
            {errors.gender && <div className="error-text">{errors.gender}</div>}

            <div className="section-title">Address</div>
            <div className="grid">
              <textarea placeholder="Address" value={form.address} onChange={handleChange("address")} />
              {errors.address && <div className="error-text">{errors.address}</div>}

              <input placeholder="City" value={form.city} onChange={handleChange("city")} />
              {errors.city && <div className="error-text">{errors.city}</div>}

              <input placeholder="State" value={form.state} onChange={handleChange("state")} />
              {errors.state && <div className="error-text">{errors.state}</div>}

              <input placeholder="Pincode" value={form.pincode} onChange={handleChange("pincode")} />
              {errors.pincode && <div className="error-text">{errors.pincode}</div>}
            </div>

            <div className="section-title">Qualifications</div>
            {errors.qualifications && <div className="error-text">{errors.qualifications}</div>}

            <div className="grid">
              <input placeholder="College Name" value={qualificationInput.collegeName} onChange={handleQualificationInputChange("collegeName")} />
              <select value={qualificationInput.course} onChange={handleQualificationInputChange("course")}>
                <option value="">Select Course</option>
                <option value="BSc">BSc</option>
                <option value="BCom">BCom</option>
                <option value="BTech">BTech</option>
              </select>
              <input placeholder="Year" value={qualificationInput.year} onChange={handleQualificationInputChange("year")} />
              <input placeholder="Percentage" value={qualificationInput.percentage} onChange={handleQualificationInputChange("percentage")} />
            </div>

            <button type="button" onClick={editIndex !== null ? updateQualification : addQualification}>
              {editIndex !== null ? "Update" : "Add"}
            </button>

            {form.qualifications.map((q, i) => (
              <div key={i} className="qual-box">
                <span>[{i + 1}] {q.collegeName} – {q.course} – {q.year} – {q.percentage}%</span>
                <span>
                  <button type="button" onClick={() => editQualification(i)}>Edit</button>
                  <button type="button" onClick={() => removeQualification(i)}>Remove</button>
                </span>
              </div>
            ))}

            <div className="section-title">Security</div>
            <div className="grid">
              <input type="password" placeholder="Password" value={form.password} onChange={handleChange("password")} />
              {errors.password && <div className="error-text">{errors.password}</div>}

              <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} />
              {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
            </div>

            <div className="declaration">
              <div className="checkbox-box" onClick={() =>
                setForm(prev => ({ ...prev, declaration: !prev.declaration }))
              }>
                {form.declaration && "✓"}
              </div>
              <span>I hereby declare that the information provided is true.</span>
            </div>

            <button className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>

            <button type="button" className="pdf-btn" onClick={exportPDF}>
              Download PDF
            </button>
            
            <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}>
            ← Back to Login
            </button>


          </form>
        </div>
      </div>
    </>
  );
}
