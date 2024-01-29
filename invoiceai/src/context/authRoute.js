import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { UserContext } from "./userContext";

const AuthRoute = ({ ...rest }) => {
  const [state] = useContext(UserContext);

  if (!state) {
    return <Navigate to="/" />;
  }

  return state && state.token ? <Routes><Route {...rest} /></Routes> : "";
};

export default AuthRoute;