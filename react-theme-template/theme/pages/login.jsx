import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { loginGuard } from "../helper/auth-guard";
import { isRunningOnClient } from "../helper/utils";
import LoginWrap from "../page-layouts/Login/login-wrap";

function LoginPage({ fpi }) {
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const loggedIn = useGlobalStore(fpi.getters.LOGGED_IN);

  const handleLogin = React.useCallback(() => {
    fpi.auth
      .signInUserWithPassword({
        is_redirection: true,
        username: "",
        password: "",
      })
      .then((data) => {

      });
  }, []);

  const handleLogout = React.useCallback(() => {
    fpi.auth.signOutUser().then((data) => {
      alert("user logged out");
    });
  }, []);

  if (loggedIn) {
    if (isRunningOnClient()) {
      return <Navigate to={redirectUrl} />;
      // window.location.href=redirectUrl
    }
    return null;
  }

  return (
    <>
      <LoginWrap></LoginWrap>
      {/* <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Log out</button> */}
    </>
  );
}

LoginPage.serverFetch = () => {};

LoginPage.authGuard = loginGuard;

export default LoginPage;
