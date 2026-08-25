import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import CoreBackground from "../Components/CoreBackground/CoreBackground";
import {
  useAuth,
} from "../Context/AuthContext";

import "./CoreCraftLayout.css";

export default function CoreCraftLayout() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  function handleLogout() {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }

  return (
    <div className="cc-shell">
      <CoreBackground />

      <aside className="cc-sidebar">
        <div className="cc-brand">
          <div className="cc-brand-mark">
            C
          </div>

          <div>
            <strong>
              CoreCraft
            </strong>

            <span>
              AI Synthesis Engine
            </span>
          </div>
        </div>

        <div className="cc-nav-label">
          WORKSPACE
        </div>

        <nav className="cc-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "cc-nav-item active"
                : "cc-nav-item"
            }
          >
            <span>⌂</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive
                ? "cc-nav-item active"
                : "cc-nav-item"
            }
          >
            <span>◇</span>
            My Projects
          </NavLink>
        </nav>

        <div className="cc-sidebar-bottom">
          <div className="cc-engine-status">
            <span className="cc-engine-dot" />

            <div>
              <strong>
                Core Engine
              </strong>

              <small>
                Online
              </small>
            </div>
          </div>

          <div className="cc-sidebar-user">
            <div className="cc-user-avatar">
              {(user?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="cc-sidebar-user-info">
              <strong>
                {user?.name || "User"}
              </strong>

              <small>
                {user?.email || ""}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="cc-sidebar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="cc-main">
        <header className="cc-topbar">
          <div>
            <span className="cc-topbar-label">
              CORECRAFT
            </span>

            <strong>
              Application Synthesis Console
            </strong>
          </div>

          <div className="cc-topbar-actions">
            <div className="cc-ai-state">
              <span className="cc-ai-pulse" />
              AI Engine Ready
            </div>

            <button
              type="button"
              className="cc-topbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="cc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
