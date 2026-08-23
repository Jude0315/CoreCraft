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


const RegisterPage = () => {
  const navigate =
    useNavigate();

  const {
    Register,
  } = useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      role: "administrator",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const HandleChange = (
    event
  ) => {
    setForm({
      ...form,

      [event.target.name]:
        event.target.value,
    });
  };


  const HandleSubmit = async (
    event
  ) => {
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
            Create account
          </h2>

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

            <label>
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={HandleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={HandleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={HandleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Account type
            </label>

            <select
              name="role"
              value={form.role}
              onChange={HandleChange}
            >

              <option value="administrator">
                Administrator
              </option>
              <option value="project manager">
                Project Manager
              </option>
              <option value="team member">
                Team Member
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
