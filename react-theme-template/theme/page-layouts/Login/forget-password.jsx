import FPIClient from "fdk-store";
import React, { useState } from "react";
import { validateEmailField } from "../../helper/utils";
import LoginContainer from "./login-container";
import styles from "./forget-password.less";
import { useSearchParams, useNavigate } from "react-router-dom";

function ForgetPassword({ fpi }) {
  const [searchParams] = useSearchParams();
  const query = new URLSearchParams(searchParams);
  const [resetMobileEmail, setresetMobileEmail] = useState("");
  const [isShowResetButton, setisShowResetButton] = useState(false);
  const [isSendResetPasswordSuccess, setisSendResetPasswordSuccess] =
    useState(false);
  const [isInValidMobileEmail, setisInValidMobileEmail] = useState(false);
  const [isEmailNotExist, setisEmailNotExist] = useState(false);
  const [emailErrorMsg, setemailErrorMsg] = useState("");
  const navigate = useNavigate();


  const forgotPasswordSubmitBtnClick = () => {
    if (isShowResetButton) {
      if (validateEmailField(resetMobileEmail)) {
        fpi.auth
          .resetPasswordWithEmail({
            id: window.APP_DATA.applicationID,
            email: resetMobileEmail,
            captcha_code: "_skip_",
          })
          .then((res) => {
            if (res?.payload?.status == "success") {
              setisSendResetPasswordSuccess(true);
            } else {
              setisSendResetPasswordSuccess(false);
              setisEmailNotExist(true);
              setemailErrorMsg( res.error.message);
            }
          });
      }
    }
  };

  function validateEmailMobile(val) {
    setresetMobileEmail(val);
    if (validateEmailField(val)) {
      setisInValidMobileEmail(false);
      setisShowResetButton(true);
    } else {
      setisInValidMobileEmail(true);
      setisShowResetButton(false);
    }
  }

  function redirectToAnotherURL() {
    const currentQueryParams = query.toString();
    const newURL = `/auth/login?${currentQueryParams}`;

    navigate(newURL);

  }

  return (
    <LoginContainer>
      <div className={styles.loginContent}>
        {!isSendResetPasswordSuccess ? (
          <div className={`${styles.forgotPasswordWrapper}`}>
            <div className={`${styles.forgotPasswordContentTitle}`}>
              Forgot Password?
            </div>
            <div
              className={`${styles.forgotPasswordAlert} ${styles.alertSuccess}`}
            >
              <span className={styles.alertMessage}>
                Enter your registered email
              </span>
              <div className={styles.alertLink} onClick={redirectToAnotherURL}>
                Cancel Reset
              </div>
            </div>
            <div
              className={`${styles.forgotPasswordInputGroup} ${
                isInValidMobileEmail ? styles.errorInput : ""
              }`}
            >
              <label
                className={styles.forgotPasswordInputTitle}
                htmlFor="email"
              >
                Email address*
              </label>
              <input
                type="text"
                name="email"
                // onInput={validateEmailMobile}
                required
                value={resetMobileEmail}
                onInput={(e) => {
                  validateEmailMobile(e.target.value);
                }}
              />
              {isInValidMobileEmail && (
                <span className={styles.errorText}>
                  Please enter a valid Email address
                </span>
              )}
            </div>
            {isEmailNotExist && (
              <div
                className={`${styles.forgotPasswordAlert} ${styles.alertError}`}
              >
                <span className={styles.alertMessage}>{emailErrorMsg}</span>
              </div>
            )}
            <button
              className={`${styles.forgotPasswordSubmitBtn} ${
                isShowResetButton && styles.secondaryBtn
              }`}
              disabled={!isShowResetButton}
              onClick={forgotPasswordSubmitBtnClick}
              type="submit"
            >
              Send Password Reset Link
            </button>
          </div>
        ) : (
          <div className={`${styles.resetSuccessMsg}`}>
            <p>Reset Link has been sent to your primary email address.</p>
            <div className={`${styles.resetDone}`}>OK</div>
          </div>
        )}
      </div>
    </LoginContainer>
  );
}

export default ForgetPassword;
