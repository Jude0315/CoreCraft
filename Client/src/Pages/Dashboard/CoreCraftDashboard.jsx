import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createProject,
  deleteProject,
  getProjects,
} from "../../Services/Api";

import "./CoreCraftDashboard.css";

function formatProjectStatus(
  status,
) {
  switch (status) {
    case "requirements-finalized":
      return "Requirements Finalized";

    case "blueprint-ready":
      return "Blueprint Ready";

    case "generated":
      return "Generated";

    case "draft":
    default:
      return "Draft";
  }
}

export default function CoreCraftDashboard() {
  const navigate =
    useNavigate();

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showCreate,
    setShowCreate,
  ] = useState(false);

  const [
    projectName,
    setProjectName,
  ] = useState("");

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    deletingProjectId,
    setDeletingProjectId,
  ] = useState(null);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProjects();

      const projectList =
        Array.isArray(data)
          ? data
          : data?.projects || [];

      setProjects(
        projectList,
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreateProject(
    event,
  ) {
    event.preventDefault();

    const trimmed =
      projectName.trim();

    if (!trimmed) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const project =
        await createProject(
          trimmed,
        );

      setProjectName("");
      setShowCreate(false);

      navigate(
        `/projects/${project._id}/requirements`,
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(
    project,
  ) {
    const confirmed =
      window.confirm(
        `Decommission "${project.name}"?\n\nThis will permanently remove the project and its saved requirement session.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(
        project._id,
      );

      setError("");

      await deleteProject(
        project._id,
      );

      setProjects(
        (currentProjects) =>
          currentProjects.filter(
            (item) =>
              item._id !==
              project._id,
          ),
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setDeletingProjectId(
        null,
      );
    }
  }

  return (
    <section className="dashboard">
      <div className="dashboard-hero">
        <div>
          <div className="dashboard-kicker">
            SYNTHESIS WORKSPACE
          </div>

          <h1>
            Your applications.
          </h1>

          <p>
            Create a project,
            describe what you want
            to build, and let
            CoreCraft structure
            the application.
          </p>
        </div>

        <button
          className="dashboard-create"
          type="button"
          onClick={() =>
            setShowCreate(true)
          }
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-section-header">
        <div>
          <span>
            MY PROJECTS
          </span>

          <h2>
            Workspaces
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-empty">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="dashboard-empty cc-glass">
          <span>
            NO PROJECTS
          </span>

          <h3>
            Start your first
            application.
          </h3>

          <p>
            Create a project and
            describe the software
            you want CoreCraft
            to generate.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowCreate(true)
            }
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="dashboard-projects">
          {projects.map((project) => (
            <article
              key={project._id}
              className="dashboard-project cc-glass"
            >
              <div className="dashboard-project-icon">
                &lt;/&gt;
              </div>

              <div className="dashboard-project-body">
                <h3>
                  {project.name}
                </h3>

                <div className="dashboard-project-meta">
                  <span>
                    MERN
                  </span>

                  <span>
                    {formatProjectStatus(
                      project.status,
                    )}
                  </span>
                </div>
              </div>

              <div className="dashboard-project-actions">
                <button
                  className="dashboard-open"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}/requirements`,
                    )
                  }
                >
                  Open
                </button>

                <button
                  className="dashboard-decommission"
                  type="button"
                  disabled={
                    deletingProjectId ===
                    project._id
                  }
                  onClick={() =>
                    handleDeleteProject(
                      project,
                    )
                  }
                >
                  {deletingProjectId ===
                  project._id
                    ? "Decommissioning..."
                    : "Decommission"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="create-project-overlay">
          <form
            className="create-project-dialog"
            onSubmit={
              handleCreateProject
            }
          >
            <div className="create-project-heading">
              <span>
                NEW WORKSPACE
              </span>

              <h2>
                Create Project
              </h2>

              <p>
                Give your CoreCraft
                project a name.
              </p>
            </div>

            <input
              autoFocus
              value={
                projectName
              }
              onChange={
                (event) =>
                  setProjectName(
                    event.target.value,
                  )
              }
              placeholder="e.g. Veterinary Clinic System"
              required
            />

            <div className="create-project-actions">
              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
                disabled={
                  creating
                }
              >
                {creating
                  ? "Creating..."
                  : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
