import React, {
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
  const navigate =
    useNavigate();

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


  const HandleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await Login(
        email,
        password
      );

      const roleLandingPages =
        {
  "administrator": "/users",
  "project manager": "/dashboard",
  "team member": "/dashboard"
};

      const destination =
        roleLandingPages[user.role] ||
        "/dashboard";

      navigate(destination);
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
    <div className="auth-shell auth-position-right auth-align-center auth-background-mesh auth-panel-glass auth-decoration-glow auth-brand-left auth-brand-align-left">

      <section className="auth-brand">

        <div className="auth-brand-content">

          <span className="eyebrow">
            Welcome to
          </span>

          <h1>
            Project Task Management System
          </h1>

          <p>
            A collaborative platform for managing projects and tasks, enabling efficient workflow between administrators, project managers, and team members.
          </p>


        </div>

      </section>


      <section className="auth-panel">

        <form
          className="auth-card"
          onSubmit={HandleSubmit}
        >

          <h2>
            Welcome back
          </h2>

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

            <label>
              Email
            </label>

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

            <label>
              Password
            </label>

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
