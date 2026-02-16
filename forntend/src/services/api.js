// const BASE_URL = "http://localhost:3000/api"; 
// // change this to your backend URL

// // ✅ Generic request handler
// const request = async (endpoint, method = "GET", body = null) => {
//   try {
//     const res = await fetch(`${BASE_URL}${endpoint}`, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: body ? JSON.stringify(body) : null,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Something went wrong");
//     }

//     return data;
//   } catch (error) {
//     console.error("API Error:", error.message);
//     throw error;
//   }
// };


// // ✅ LOGIN API
// export const loginUser = (payload) => {
//   return request("/login", "POST", payload);
// };


// // ✅ REGISTER API
// export const registerUser = (payload) => {
//   return request("/register", "POST", payload.role);
// };


// // ✅ Example Future APIs

// export const getAllUsers = () => {
//   return request("/users");
// };

// export const deleteUser = (id) => {
//   return request(`/users/${id}`, "DELETE");
// };
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
