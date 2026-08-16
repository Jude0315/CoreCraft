const GenerateApiService = () => {
  return `import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        \`Bearer \${token}\`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
`;
};

const GenerateAuthContext = () => {
  return `import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../Services/Api";

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const LoadUser = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await API.get("/auth/profile");

        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    LoadUser();
  }, []);

  const Login = async (
    email,
    password
  ) => {
    const response =
      await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    localStorage.setItem(
      "token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data.user;
  };

  const Register = async (
    userData
  ) => {
    return API.post(
      "/auth/register",
      userData
    );
  };

  const Logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        Login,
        Register,
        Logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
`;
};

const GenerateProtectedRoute = () => {
  return `import React from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";

const ProtectedRoute = ({
  children,
  roles = [],
}) => {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
`;
};

const GenerateThemeCss = (appType = "Application") => {
  const normalized = appType.toLowerCase();

  let accent = "#2563eb";
  let surface = "#f8fafc";

  if (normalized.includes("ecommerce")) {
    accent = "#7c3aed";
    surface = "#faf5ff";
  }

  if (normalized.includes("portfolio")) {
    accent = "#0f766e";
    surface = "#f0fdfa";
  }

  if (normalized.includes("blog")) {
    accent = "#c2410c";
    surface = "#fff7ed";
  }

  return `:root {
  font-family: Inter, system-ui, sans-serif;
  color: #0f172a;
  background: ${surface};
  --accent: ${accent};
  --card: #ffffff;
  --muted: #64748b;
  --border: #e2e8f0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--card);
}

a {
  color: inherit;
  text-decoration: none;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
}

.auth-brand {
  padding: 64px;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 85%, black),
      var(--accent)
    );
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-brand h1 {
  font-size: 48px;
  margin: 0 0 20px;
}

.auth-brand p {
  max-width: 520px;
  line-height: 1.7;
  opacity: 0.9;
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8fafc;
}

.auth-card {
  width: 100%;
  max-width: 430px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  box-shadow:
    0 20px 45px rgba(15, 23, 42, 0.08);
}

.auth-card h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.auth-card p {
  color: var(--muted);
  margin-bottom: 28px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
}

.form-group input:focus,
.form-group select:focus {
  outline: 2px solid
    color-mix(in srgb, var(--accent) 25%, white);
  border-color: var(--accent);
}

.primary-button {
  width: 100%;
  padding: 13px 16px;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.form-error {
  margin-bottom: 16px;
  color: #b91c1c;
  background: #fef2f2;
  padding: 10px 12px;
  border-radius: 8px;
}

.auth-link {
  margin-top: 18px;
  text-align: center;
  color: var(--muted);
}

.auth-link a {
  color: var(--accent);
  font-weight: 600;
}a

.app-navbar {
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 32px;
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.navbar-brand {
  font-size: 21px;
  font-weight: 800;
  color: var(--accent);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 22px;
  flex: 1;
}

.navbar-links a {
  color: #334155;
  font-weight: 600;
}

.navbar-links a:hover {
  color: var(--accent);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.navbar-register {
  background: var(--accent);
  color: white !important;
  padding: 9px 16px;
  border-radius: 9px;
}

.navbar-user {
  color: var(--muted);
  font-weight: 600;
}

.logout-button {
  border: 1px solid var(--border);
  background: white;
  padding: 9px 14px;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
}

.logout-button:hover {
  border-color: var(--accent);
  color: var(--accent);
}


.page-shell {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 72px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: center;
  min-height: 520px;
}

.hero-copy h1 {
  font-size: clamp(42px, 6vw, 72px);
  line-height: 1.02;
  letter-spacing: -0.04em;
  margin: 14px 0 22px;
  max-width: 760px;
}

.hero-copy p {
  max-width: 620px;
  color: var(--muted);
  font-size: 18px;
  line-height: 1.75;
}

.eyebrow {
  display: inline-block;
  color: var(--accent);
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.hero-button {
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: 22px;
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: white;
  font-weight: 700;
}

.secondary-button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.hero-card {
  border-radius: 24px;
  padding: 30px;
  background:
    linear-gradient(
      145deg,
      #ffffff,
      color-mix(in srgb, var(--accent) 5%, white)
    );
  border: 1px solid var(--border);
  box-shadow:
    0 30px 80px rgba(15, 23, 42, 0.12);
}

.hero-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.hero-card-header span {
  color: var(--muted);
  font-weight: 600;
}

.hero-card-header strong {
  font-size: 28px;
  color: var(--accent);
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 100px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 26px;
}

.hero-stat-grid div {
  background: white;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hero-stat-grid strong {
  font-size: 24px;
}

.hero-stat-grid span {
  color: var(--muted);
  font-size: 13px;
}

.section-block {
  padding: 72px 0 10px;
}

.section-heading {
  max-width: 700px;
  margin-bottom: 30px;
}

.section-heading h2 {
  font-size: 38px;
  margin: 10px 0 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.feature-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color:
    color-mix(in srgb, var(--accent) 35%, white);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.08);
}

.feature-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.feature-card p {
  color: var(--muted);
  line-height: 1.65;
  margin-bottom: 0;
}

.dashboard-header {
  padding: 20px 0 30px;
}

.dashboard-header h1 {
  font-size: 42px;
  margin: 10px 0 8px;
}

.dashboard-header p {
  color: var(--muted);
  font-size: 17px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  background: white;
}

.stat-card span {
  display: block;
  color: var(--muted);
  margin-bottom: 12px;
  font-weight: 600;
}

.stat-card strong {
  font-size: 34px;
  color: var(--accent);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 22px;
  margin-top: 24px;
}

.content-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
}

.card-heading h2 {
  margin: 0 0 20px;
  font-size: 22px;
}

.course-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-row,
.activity-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.course-row div,
.activity-list > div {
  min-width: 0;
}

.course-row div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-row span,
.activity-list span {
  color: var(--muted);
  font-size: 14px;
}

.page-header {
  padding: 32px 0;
}

.page-header h1 {
  font-size: 42px;
  margin: 10px 0 8px;
}

.page-header p {
  color: var(--muted);
  max-width: 660px;
  line-height: 1.7;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.course-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    0 14px 32px rgba(15, 23, 42, 0.05);
}

.course-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.course-category {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background:
    color-mix(in srgb, var(--accent) 10%, white);
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
}

.course-progress-value {
  color: var(--muted);
  font-weight: 700;
}

.course-card h3 {
  margin: 22px 0 8px;
  font-size: 21px;
}

.course-instructor {
  color: var(--muted);
  margin-bottom: 20px;
}

.course-card-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.course-card-footer span {
  color: var(--muted);
  font-size: 14px;
}

.action-button {
  width: auto;
  padding-inline: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.instructor-course-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.instructor-course-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.instructor-course-row > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.instructor-course-row span {
  color: var(--muted);
  font-size: 14px;
}

.row-actions {
  display: flex;
  gap: 10px;
}

.course-detail-header {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 32px;
  align-items: center;
  padding: 24px 0 40px;
}

.course-detail-header h1 {
  font-size: 46px;
  margin: 12px 0;
}

.course-detail-header p {
  color: var(--muted);
  line-height: 1.7;
  max-width: 720px;
}

.course-summary-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
}

.course-summary-card > strong {
  display: block;
  font-size: 36px;
  color: var(--accent);
}

.course-summary-card > span {
  display: block;
  color: var(--muted);
  margin: 6px 0 18px;
}

.course-detail-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 22px;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  padding: 15px;
  border-radius: 12px;
}

.lesson-number {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background:
    color-mix(in srgb, var(--accent) 10%, white);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-weight: 800;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.lesson-info span {
  color: var(--muted);
  font-size: 13px;
}

.status-complete,
.status-pending {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-complete {
  background: #ecfdf5;
  color: #047857;
}

.status-pending {
  background: #eff6ff;
  color: var(--accent);
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-list > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.detail-list span {
  color: var(--muted);
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.assessment-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
}

.assessment-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.assessment-card h3 {
  font-size: 21px;
  margin: 24px 0 14px;
}

.assessment-meta {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 20px;
}

.assignment-list {
  display: flex;
  flex-direction: column;
}

.assignment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 4px;
  gap: 20px;
  border-bottom: 1px solid var(--border);
}

.assignment-row > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.assignment-row > div:first-child span {
  color: var(--muted);
  font-size: 14px;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 18px;
}

.progress-card {
  margin-top: 24px;
}

.progress-course-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-course-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-course-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 950px) {
  .course-detail-header,
  .course-detail-grid {
    grid-template-columns: 1fr;
  }

  .assessment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .assessment-grid {
    grid-template-columns: 1fr;
  }

  .assignment-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .assignment-meta {
    width: 100%;
    justify-content: space-between;
  }
}



@media (max-width: 850px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
  }
}

@media (max-width: 950px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .feature-grid,
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-shell {
    width: min(100% - 24px, 1180px);
    padding-top: 28px;
  }

  .hero-copy h1 {
    font-size: 42px;
  }

  .hero-stat-grid,
  .feature-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .app-navbar {
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .navbar-links {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }
}


`;


};

const GenerateLoginPage = (appType = "Application") => {
  return `import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    Login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const HandleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await Login(
        email,
        password
      );

      if (
        user.role === "instructor" ||
        user.role === "admin"
      ) {
        navigate("/instructor-portal");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <h1>${appType}</h1>

        <p>
          Sign in to continue to your
          personalized workspace.
        </p>
      </section>

      <section className="auth-panel">
        <form
          className="auth-card"
          onSubmit={HandleSubmit}
        >
          <h2>Welcome back</h2>

          <p>
            Enter your account details
            to continue.
          </p>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

          <div className="auth-link">
            No account?{" "}
            <Link to="/register">
              Create one
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
`;
};

const GenerateRegisterPage = (appType = "Application") => {
  return `import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    Register,
  } = useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const HandleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await Register(form);

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <h1>${appType}</h1>

        <p>
          Create your account and start
          using the platform.
        </p>
      </section>

      <section className="auth-panel">
        <form
          className="auth-card"
          onSubmit={HandleSubmit}
        >
          <h2>Create account</h2>

          <p>
            Set up your profile to get
            started.
          </p>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Name</label>

            <input
              name="name"
              value={form.name}
              onChange={HandleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={HandleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={HandleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Account type</label>

            <select
              name="role"
              value={form.role}
              onChange={HandleChange}
            >
              <option value="student">
                Student
              </option>

              <option value="instructor">
                Instructor
              </option>
            </select>
          </div>

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

          <div className="auth-link">
            Already registered?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
`;
};



const GenerateNavbar = (appType = "Application") => {
  return `import React from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    user,
    Logout,
  } = useAuth();

  const HandleLogout = () => {
    Logout();
    navigate("/login");
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <Link to="/">
          ${appType}
        </Link>
      </div>

      <div className="navbar-links">
        {user && (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/courses">
              Courses
            </Link>

            {(user.role === "instructor" ||
              user.role === "admin") && (
              <Link to="/instructor-portal">
                Instructor Portal
              </Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-actions">
        {!user ? (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              className="navbar-register"
              to="/register"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="navbar-user">
              {user.name}
            </span>

            <button
              className="logout-button"
              onClick={HandleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
`;
};

module.exports = {
  GenerateApiService,
  GenerateAuthContext,
  GenerateProtectedRoute,
  GenerateThemeCss,
  GenerateLoginPage,
  GenerateRegisterPage,
  GenerateNavbar,
};