// AuthContext stores the current login state and makes it available
// to every component in the React application.
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../Services/Api";

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const LoadUser = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await API.get("/auth/profile");

        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    LoadUser();
  }, []);

  const Login = async (
    email,
    password
  ) => {
    const response =
      await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    localStorage.setItem(
      "token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data.user;
  };

  const Register = async (
    userData
  ) => {
    return API.post(
      "/auth/register",
      userData
    );
  };

  const Logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        Login,
        Register,
        Logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
