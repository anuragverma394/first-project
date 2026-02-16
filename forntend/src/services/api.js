
const BASE_URL = "http://localhost:3000/api";

const request = async (endpoint, method = "GET", body = null) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data;
};


export const loginUser = (payload) =>
  request("/login", "POST", payload);

export const registerUser = (payload) =>
  request("/register", "POST", payload);

export const getAllUsers = () =>
  request("/users");

export const deleteUser = (id) =>
  request(`/users/${id}`, "DELETE");
