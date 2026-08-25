import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import LaserFlow from "../../Components/Effects/LaserFlow/LaserFlow";
import {
  useAuth,
} from "../../Context/AuthContext";

import "./AuthPage.css";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        email,
        password,
      );

      navigate(
        "/dashboard",
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-energy">
        <LaserFlow
          color="#46D9FF"
          horizontalBeamOffset={0}
          verticalBeamOffset={0}
          horizontalSizing={0.65}
          verticalSizing={2}
          wispDensity={1}
          wispSpeed={10}
          wispIntensity={3}
          flowSpeed={0.25}
          fogIntensity={0.35}
        />
      </div>

      <section className="auth-brand">
        <span>
          CORECRAFT
        </span>

        <h1>
          Turn requirements
          into applications.
        </h1>

        <p>
          AI-assisted MERN
          application synthesis
          from idea to runnable
          source code.
        </p>
      </section>

      <section className="auth-form-area">
        <div className="auth-form-heading">
          <span>
            ACCESS CORECRAFT
          </span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue
            building.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="auth-form"
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={
                (event) =>
                  setEmail(
                    event.target.value,
                  )
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={
                (event) =>
                  setPassword(
                    event.target.value,
                  )
              }
              placeholder="Enter password"
              required
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : "Enter CoreCraft"}
          </button>
        </form>

        <p className="auth-switch">
          New to CoreCraft?

          <Link to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
