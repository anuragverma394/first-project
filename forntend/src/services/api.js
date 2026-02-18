const BASE_URL = "http://localhost:3000/api";

/* ✅ Generic request helper — SAFE JSON handling */
const request = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  /* ✅ Prevent "Unexpected token <" crash */
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("NON-JSON RESPONSE:", text);
    throw new Error("Server error — response was not JSON");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

/* ================= AUTH ================= */

export const loginUser = (payload) =>
  request("/login", "POST", payload);

/* ✅ CRITICAL FIX — sanitize qualifications */
export const registerUser = (payload) => {
  const safePayload = {
    ...payload,

    /* ✅ Prevent PostgreSQL JSONB crash */
    qualifications: Array.isArray(payload.qualifications)
      ? payload.qualifications
      : [],
  };

  return request("/register", "POST", safePayload);
};

/* ================= USERS (admin) ================= */

export const getAllUsers = () =>
  request("/users");

export const deleteUser = (id) =>
  request(`/users/${id}`, "DELETE");

export const updateUser = (id, data) =>
  request(`/users/${id}`, "PUT", data);

/* ================= FULL STUDENT DETAILS ================= */

export const getStudentDetails = () =>
  request("/students");

/* ================= ADMIN TASKS ================= */

export const getAdminTasks = () =>
  request("/admin/tasks");

export const assignTask = (payload) =>
  request("/admin/task", "POST", payload);

export const deleteTask = (id) =>
  request(`/admin/task/${id}`, "DELETE");

export const reviewSubmission = (id, status) =>
  request(`/admin/review/${id}`, "PUT", { status });

export const getSubmissions = () =>
  request("/admin/submissions");

/* ================= STUDENT TASKS ================= */

export const getStudentTasks = () =>
  request("/student/tasks");

export const updateProgress = (id, progress) =>
  request(`/student/progress/${id}`, "PUT", { progress });

export const markCompleted = (id) =>
  request(`/student/complete/${id}`, "PUT");

/* ================= FILE UPLOAD (multipart) ================= */

export const uploadSubmission = async (taskId, file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/student/upload/${taskId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("UPLOAD NON-JSON RESPONSE:", text);
    throw new Error("Upload failed — response not JSON");
  }

  if (!res.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
};
