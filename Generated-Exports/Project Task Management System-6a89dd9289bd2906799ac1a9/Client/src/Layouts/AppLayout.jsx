
import React from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";


const navigationItems =
  [
  {
    "name": "Dashboard",
    "route": "/dashboard",
    "roles": [
      "administrator",
      "project manager",
      "team member"
    ]
  },
  {
    "name": "Projects",
    "route": "/projects",
    "roles": [
      "administrator",
      "project manager"
    ]
  },
  {
    "name": "Tasks",
    "route": "/tasks",
    "roles": [
      "administrator",
      "project manager",
      "team member"
    ]
  },
  {
    "name": "Users",
    "route": "/users",
    "roles": [
      "administrator"
    ]
  }
];


const AppLayout = () => {

  const navigate =
    useNavigate();


  const {
    user,
    loading,
    Logout,
  } = useAuth();


  if (loading) {
    return (
      <div className="app-loading">
        Loading...
      </div>
    );
  }


  const role =
    user?.role || "";


  const visibleItems =
    navigationItems.filter(
      (item) =>
        item.roles.length === 0 ||
        item.roles.includes(
          role
        )
    );


  const HandleLogout = () => {
    Logout();

    navigate(
      "/login"
    );
  };


  return (
    <div
      className=
        "app-layout navigation-topbar"
    >

      <header className="app-header">

        <div className="brand-block">

          <strong className="brand-name">
            Project Task Management System
          </strong>

        </div>


        
        <nav className="top-navigation">

          {visibleItems.map(
            (item) => (
              <NavLink
                key={item.route}
                to={item.route}
                className={({
                  isActive
                }) =>
                  isActive
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                {item.name}
              </NavLink>
            )
          )}

        </nav>



        <div className="header-actions">

          {role && (
            <span className="user-role">
              {role}
            </span>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={HandleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      <div className="app-body">


        


        <section className="app-content">

          <Outlet />

        </section>

      </div>

    </div>
  );
};


export default AppLayout;
