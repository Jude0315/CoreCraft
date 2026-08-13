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

@media (max-width: 850px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
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