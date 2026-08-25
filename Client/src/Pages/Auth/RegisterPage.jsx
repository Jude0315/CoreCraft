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

export default function RegisterPage() {
  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();

  const [
    name,
    setName,
  ] = useState("");

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

    setLoading(true);
    setError("");

    try {
      const data =
        await register(
          name,
          email,
          password,
        );

      if (data.token) {
        navigate(
          "/dashboard",
        );
      } else {
        navigate(
          "/login",
        );
      }
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
          Create.
          Synthesize.
          Build.
        </h1>

        <p>
          Start a workspace and
          transform your software
          requirements into a
          generated MERN project.
        </p>
      </section>

      <section className="auth-form-area">
        <div className="auth-form-heading">
          <span>
            INITIALIZE PROFILE
          </span>

          <h2>
            Create account
          </h2>

          <p>
            Your projects will be
            stored inside your
            CoreCraft workspace.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Name

            <input
              value={name}
              onChange={
                (event) =>
                  setName(
                    event.target.value,
                  )
              }
              placeholder="Your name"
              required
            />
          </label>

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
              minLength={6}
              placeholder="Create password"
              required
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating profile..."
              : "Create CoreCraft Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?

          <Link to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
