// PrivateRoute.tsx
import React from "react";
import { Route, Navigate, RouteProps } from "react-router-dom";
import { userContext } from "../Context";
import { useContext } from "react";
import Dashboard from "./Dashboard";

function PrivateRoute() {
  const { token } = useContext(userContext);
  const localToken =
    token === null || token === "" ? localStorage.getItem("token") : token;

  return localToken !== null && localToken !== "" ? (
    <Dashboard />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default PrivateRoute;
