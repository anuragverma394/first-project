import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const rawUser = localStorage.getItem("user");
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    user = null;

  localStorage.removeItem("user");
    user = null;
  }




  /*  Prevent false logout on refresh */
  if (token && !user) {
    return null;  // wait instead of redirecting
  }

  /* Not logged in */
  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  /* Wrong role */
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
