// This service keeps HTTP requests separate from React page components.
// Keeping API logic here makes the frontend easier to understand and maintain.
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const API = axios.create({
  baseURL:
    API_URL,
});

// Adds the saved JWT to requests that need authentication.
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API groups mirror the generated Express route modules on the backend.
// CoreCraft's AI-assisted blueprint decided these modules; this file only wraps HTTP calls.
export const ProjectApi = {
  getAll: () =>
    API.get("/project"),

  getById: (id) =>
    API.get(`/project/${id}`),

  create: (data) =>
    API.post(
      "/project",
      data
    ),

  update: (id, data) =>
    API.put(
      `/project/${id}`,
      data
    ),

  remove: (id) =>
    API.delete(
      `/project/${id}`
    ),

  delete: (id) =>
    API.delete(
      `/project/${id}`
    )
};

export const TaskApi = {
  getAll: () =>
    API.get("/task"),

  getById: (id) =>
    API.get(`/task/${id}`),

  create: (data) =>
    API.post(
      "/task",
      data
    ),

  update: (id, data) =>
    API.put(
      `/task/${id}`,
      data
    ),

  remove: (id) =>
    API.delete(
      `/task/${id}`
    ),

  delete: (id) =>
    API.delete(
      `/task/${id}`
    )
};

export const UserApi = {
  getAll: () =>
    API.get("/auth/users"),

  getById: (id) =>
    API.get(`/auth/users/${id}`),

  create: (data) =>
    API.post(
      "/auth/users",
      data
    ),

  update: (id, data) =>
    API.put(
      `/auth/users/${id}`,
      data
    ),

  remove: (id) =>
    API.delete(
      `/auth/users/${id}`
    ),

  delete: (id) =>
    API.delete(
      `/auth/users/${id}`
    )
};


export default API;
