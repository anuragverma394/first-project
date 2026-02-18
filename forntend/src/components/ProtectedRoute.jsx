import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
  }

  /* Not logged in */
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  /* Wrong role */
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
