import React from "react";
import { loginGuard } from "../helper/auth-guard";
import RegisterWrap from "../page-layouts/register/register-wrap";

function RegisterPage({ fpi }) {
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

  // if (loggedIn) {
  //   if (isRunningOnClient()) {
  //     return <Navigate to={redirectUrl} />;
  //   }
  //   return null;
  // }

  return (
    <>
      <RegisterWrap fpi={fpi}>
        
      </RegisterWrap>
    </>
  );
}

RegisterPage.authGuard = loginGuard;

export default RegisterPage;
