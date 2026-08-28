import React from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Dashboard
  from "./Pages/Dashboard";
import Projects
  from "./Pages/Projects";
import Tasks
  from "./Pages/Tasks";
import Users
  from "./Pages/Users";


import ProtectedRoute
  from "./Routes/ProtectedRoute";

import AppLayout
  from "./Layouts/AppLayout";

import LoginPage
  from "./Pages/Login";

import RegisterPage
  from "./Pages/Register";



const App = () => {
  return (
    <Routes>


        {/* Start unauthenticated visitors at login. */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />



        {/* Public auth routes. */}
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />





        {/* Protected app shell. Nested pages still keep their own role restrictions. */}
        <Route
          element={
            <ProtectedRoute>

              <AppLayout />

            </ProtectedRoute>
          }
        >


          {/* Dashboard and module pages generated from the CoreCraft blueprint. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["administrator","project manager","team member"]}>

                <Dashboard />

              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute roles={["administrator","project manager"]}>

                <Projects />

              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute roles={["administrator","project manager","team member"]}>

                <Tasks />

              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["administrator"]}>

                <Users />

              </ProtectedRoute>
            }
          />

        </Route>


        {/* Unknown routes are redirected back into the app entry point. */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

    </Routes>
  );
};


export default App;
