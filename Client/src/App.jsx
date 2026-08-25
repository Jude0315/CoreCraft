import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import CoreCraftLayout from "./Layouts/CoreCraftLayout";
import ProjectWorkspaceLayout from "./Layouts/ProjectWorkspaceLayout";
import LoginPage from "./Pages/Auth/LoginPage";
import RegisterPage from "./Pages/Auth/RegisterPage";
import CoreCraftDashboard from "./Pages/Dashboard/CoreCraftDashboard";
import GenerationPage from "./Pages/Generation/GenerationPage";
import ExportPage from "./Pages/Workspace/ExportPage";
import RequirementsPage from "./Pages/Workspace/RequirementsPage";
import SpecificationPage from "./Pages/Workspace/SpecificationPage";
import ProtectedRoute from "./Routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <CoreCraftLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<CoreCraftDashboard />}
        />

        <Route
          path="/projects"
          element={<CoreCraftDashboard />}
        />

        <Route
          path="/projects/:projectId"
          element={<ProjectWorkspaceLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="requirements"
                replace
              />
            }
          />

          <Route
            path="requirements"
            element={<RequirementsPage />}
          />

          <Route
            path="specification"
            element={<SpecificationPage />}
          />

          <Route
            path="generate"
            element={<GenerationPage />}
          />

          <Route
            path="export"
            element={<ExportPage />}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}
