import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  downloadGeneratedProject,
  getRequirementSession,
} from "../../Services/Api";

import "./ExportPage.css";

export default function ExportPage() {
  const {
    projectId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    session,
    setSession,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getRequirementSession(
          projectId,
        );

      if (!data) {
        throw new Error(
          "Requirement session not found",
        );
      }

      if (
        !data
          .specificationGeneratedAt
      ) {
        throw new Error(
          "Application blueprint has not been generated yet.",
        );
      }

      setSession(data);
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function handleDownload() {
    if (!session?._id) {
      return;
    }

    try {
      setDownloading(true);
      setError("");

      await downloadGeneratedProject(
        session._id,
      );
    } catch (err) {
      console.error(
        "Download failed:",
        err,
      );

      setError(
        err.message,
      );
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <section className="export-loading">
        <span className="export-loading-core" />

        <small>
          CORECRAFT EXPORT
        </small>

        <p>
          Loading generated project...
        </p>
      </section>
    );
  }

  if (error && !session) {
    return (
      <section className="export-error">
        <span>
          EXPORT UNAVAILABLE
        </span>

        <h2>
          Generated project could
          not be loaded.
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${projectId}/generate`,
            )
          }
        >
          &lt;- Return to Synthesis
        </button>
      </section>
    );
  }

  const specification =
    session
      ?.generationSpecification ||
    {};

  const roles =
    specification.roles || [];

  const entities =
    specification.entities || [];

  const pages =
    specification.pages || [];

  const apiModules =
    specification.apiModules || [];

  const requiresAuthentication =
    roles.length > 0 ||
    pages.some(
      (page) =>
        page?.protected === true,
    ) ||
    apiModules.some(
      (apiModule) =>
        apiModule?.protected === true,
    );

  return (
    <section className="export-page">
      <div className="export-complete-mark">
        OK
      </div>

      <div className="export-heading">
        <span>
          SYNTHESIS COMPLETE
        </span>

        <h1>
          {specification.applicationName ||
            "Generated Application"}
        </h1>

        <p>
          Your MERN starter application
          has been synthesized and is
          ready to export.
        </p>
      </div>

      <div className="export-stats">
        <div>
          <strong>
            {roles.length}
          </strong>

          <span>
            Roles
          </span>
        </div>

        <div>
          <strong>
            {entities.length}
          </strong>

          <span>
            Entities
          </span>
        </div>

        <div>
          <strong>
            {pages.length}
          </strong>

          <span>
            Pages
          </span>
        </div>

        <div>
          <strong>
            {apiModules.length}
          </strong>

          <span>
            API Modules
          </span>
        </div>
      </div>

      <div className="export-deliverables">
        <div className="export-deliverable">
          <span>OK</span>

          <div>
            <strong>
              React Frontend
            </strong>

            <small>
              Generated pages,
              layout and API
              integration
            </small>
          </div>
        </div>

        <div className="export-deliverable">
          <span>OK</span>

          <div>
            <strong>
              Express Backend
            </strong>

            <small>
              Controllers, routes
              and application
              structure
            </small>
          </div>
        </div>

        <div className="export-deliverable">
          <span>OK</span>

          <div>
            <strong>
              MongoDB Models
            </strong>

            <small>
              Generated Mongoose
              entities and
              relationships
            </small>
          </div>
        </div>

        <div className="export-deliverable">
          <span>OK</span>

          <div>
            <strong>
              Authentication
            </strong>

            <small>
              {requiresAuthentication
                ? "Generated for this application"
                : "Not required by this application"}
            </small>
          </div>
        </div>

        <div className="export-deliverable">
          <span>OK</span>

          <div>
            <strong>
              Project Documentation
            </strong>

            <small>
              README, setup guide
              and environment
              configuration
            </small>
          </div>
        </div>
      </div>

      {error && (
        <div className="export-download-error">
          {error}
        </div>
      )}

      <div className="export-actions">
        <button
          type="button"
          className="export-back"
          onClick={() =>
            navigate(
              `/projects/${projectId}/generate`,
            )
          }
        >
          &lt;- Synthesis
        </button>

        <button
          type="button"
          className="export-download"
          onClick={
            handleDownload
          }
          disabled={
            downloading
          }
        >
          {downloading
            ? "Preparing ZIP..."
            : "Download Project ZIP"}
        </button>
      </div>
    </section>
  );
}
