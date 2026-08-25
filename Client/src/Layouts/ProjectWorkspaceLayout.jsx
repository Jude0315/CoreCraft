import {
  NavLink,
  Outlet,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  getProjectById,
} from "../Services/Api";

import "./ProjectWorkspaceLayout.css";

export default function ProjectWorkspaceLayout() {
  const {
    projectId,
  } = useParams();

  const [
    project,
    setProject,
  ] = useState(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const data =
          await getProjectById(
            projectId,
          );

        setProject(data);
      } catch (error) {
        console.error(
          "Unable to load project:",
          error,
        );
      }
    }

    loadProject();
  }, [projectId]);

  const tabs = [
    {
      label:
        "Requirements",
      path:
        `/projects/${projectId}/requirements`,
    },
    {
      label:
        "Specification",
      path:
        `/projects/${projectId}/specification`,
    },
    {
      label:
        "Generate",
      path:
        `/projects/${projectId}/generate`,
    },
    {
      label:
        "Export",
      path:
        `/projects/${projectId}/export`,
    },
  ];

  return (
    <section className="project-workspace">
      <div className="project-workspace-bar">
        <div>
          <span>
            CURRENT PROJECT
          </span>

          <strong>
            {project?.name ||
              "Loading project..."}
          </strong>
        </div>

        <nav className="project-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                isActive
                  ? "project-tab active"
                  : "project-tab"
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="project-workspace-content">
        <Outlet />
      </div>
    </section>
  );
}
