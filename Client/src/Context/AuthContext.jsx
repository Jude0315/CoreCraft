import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  apiRequest,
} from "../Services/Api";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [
    token,
    setToken,
  ] = useState(
    localStorage.getItem(
      "corecraft_token",
    ),
  );

  const [
    user,
    setUser,
  ] = useState(() => {
    const stored =
      localStorage.getItem(
        "corecraft_user",
      );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(
        stored,
      );
    } catch {
      return null;
    }
  });

  async function login(
    email,
    password,
  ) {
    const data =
      await apiRequest(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

    const authenticatedUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
    };

    localStorage.setItem(
      "corecraft_token",
      data.token,
    );

    localStorage.setItem(
      "corecraft_user",
      JSON.stringify(
        authenticatedUser,
      ),
    );

    setToken(
      data.token,
    );

    setUser(
      authenticatedUser,
    );

    return data;
  }

  async function register(
    name,
    email,
    password,
  ) {
    const data =
      await apiRequest(
        "/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

    const authenticatedUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
    };

    localStorage.setItem(
      "corecraft_token",
      data.token,
    );

    localStorage.setItem(
      "corecraft_user",
      JSON.stringify(
        authenticatedUser,
      ),
    );

    setToken(
      data.token,
    );

    setUser(
      authenticatedUser,
    );

    return data;
  }

  function logout() {
    localStorage.removeItem(
      "corecraft_token",
    );

    localStorage.removeItem(
      "corecraft_user",
    );

    setToken(null);
    setUser(null);
  }

  const authenticated =
    Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext,
  );
}
