const BASE_URL = "http://localhost:3000/api"; 
// change this to your backend URL

// ✅ Generic request handler
const request = async (endpoint, method = "GET", body = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};


// ✅ LOGIN API
export const loginUser = (payload) => {
  return request("/login", "POST", payload);
};


// ✅ REGISTER API
export const registerUser = (payload) => {
  return request("/register", "POST", payload);
};


// ✅ Example Future APIs

export const getAllUsers = () => {
  return request("/users");
};

export const deleteUser = (id) => {
  return request(`/users/${id}`, "DELETE");
};
