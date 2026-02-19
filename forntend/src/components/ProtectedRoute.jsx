import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      let storedUser = null;

      try {
        const rawUser = localStorage.getItem("user");
        storedUser = rawUser ? JSON.parse(rawUser) : null;
      } catch (err) {
        console.error("Invalid user JSON:", err);
        localStorage.removeItem("user");
      }

      /* ✅ Case 1: Valid user already stored */
      if (storedUser) {
        setUser(storedUser);
        setLoading(false);
        return;
      }

      /* ✅ Case 2: Token exists but user missing → fetch */
      if (token) {
        try {
          const res = await fetch("/api/user/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          } else {
            /* ❌ Token invalid / expired */
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          console.error("User fetch failed:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  /* ✅ Proper loading behavior */
  if (loading) {
    return null; // or loader UI
  }

  /* ❌ Not authenticated */
  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  /* ❌ Wrong role */
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
