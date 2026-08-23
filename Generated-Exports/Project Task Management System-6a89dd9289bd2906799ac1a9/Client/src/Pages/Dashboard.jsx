import React, {
  useEffect,
  useState,
} from "react";


import {
  ProjectApi,
  TaskApi,
  UserApi
} from "../Services/Api";


const Dashboard = () => {

  const [
    projectCount,
    setProjectCount
  ] = useState(0);


  const [
    taskCount,
    setTaskCount
  ] = useState(0);


  const [
    userCount,
    setUserCount
  ] = useState(0);


  const LoadDashboardData = async () => {

      try {
        const response =
          await ProjectApi.getAll();

        const payload =
          response.data;

        const records =
          Array.isArray(payload)
            ? payload
            : payload?.items ||
              payload?.data ||
              payload?.records ||
              [];

        const count =
          typeof payload?.count === "number"
            ? payload.count
            : Array.isArray(records)
              ? records.length
              : 0;

        setProjectCount(
          count
        );
      } catch (error) {
        console.error(
          "Unable to load Project dashboard data:",
          error
        );
      }


      try {
        const response =
          await TaskApi.getAll();

        const payload =
          response.data;

        const records =
          Array.isArray(payload)
            ? payload
            : payload?.items ||
              payload?.data ||
              payload?.records ||
              [];

        const count =
          typeof payload?.count === "number"
            ? payload.count
            : Array.isArray(records)
              ? records.length
              : 0;

        setTaskCount(
          count
        );
      } catch (error) {
        console.error(
          "Unable to load Task dashboard data:",
          error
        );
      }


      try {
        const response =
          await UserApi.getAll();

        const payload =
          response.data;

        const records =
          Array.isArray(payload)
            ? payload
            : payload?.items ||
              payload?.data ||
              payload?.records ||
              [];

        const count =
          typeof payload?.count === "number"
            ? payload.count
            : Array.isArray(records)
              ? records.length
              : 0;

        setUserCount(
          count
        );
      } catch (error) {
        console.error(
          "Unable to load User dashboard data:",
          error
        );
      }

  };


  useEffect(() => {
    LoadDashboardData();
  }, []);


  return (
    <main className="page-shell">

      <section className="page-header">

        <span className="eyebrow">
          Project Task Management System
        </span>

        <h1>
          Dashboard
        </h1>

        <p>
          Overview of project and task activities for all users.
        </p>

      </section>


      <section className="dashboard-grid">

          <article className="stat-card">

            <span className="stat-label">
              Project
            </span>

            <strong className="stat-value">
              {projectCount}
            </strong>

          </article>

          <article className="stat-card">

            <span className="stat-label">
              Task
            </span>

            <strong className="stat-value">
              {taskCount}
            </strong>

          </article>

          <article className="stat-card">

            <span className="stat-label">
              User
            </span>

            <strong className="stat-value">
              {userCount}
            </strong>

          </article>
      </section>

    </main>
  );
};


export default Dashboard;
