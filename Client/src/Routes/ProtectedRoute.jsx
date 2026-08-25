import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../Context/AuthContext";

export default function ProtectedRoute({
  children,
}) {
  const {
    authenticated,
  } = useAuth();

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}
