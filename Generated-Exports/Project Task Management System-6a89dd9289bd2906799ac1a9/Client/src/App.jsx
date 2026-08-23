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


        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />



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





        <Route
          element={
            <ProtectedRoute>

              <AppLayout />

            </ProtectedRoute>
          }
        >


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
