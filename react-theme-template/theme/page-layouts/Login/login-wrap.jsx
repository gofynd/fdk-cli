import FPIClient from "fdk-store";
import React, { useState } from "react";
import LoginContainer from "./login-container";
import styles from "./login-wrap.less";
import { useSearchParams, useNavigate } from "react-router-dom";
import Loader from "../../components/loader/loader";


function LoginWrap() {

  const [isLoading,setisLoading]=useState(false)
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [selected, setselected] = useState("password");
  const [otp, setotp] = useState("");
  const [otpSent, setotpSent] = useState(false);
  const [phNo, setphNo] = useState("");
  const [isOtpError, setisOtpError] = useState(false);
  const [ispassError, setispassError] = useState(false);
  const [errorMsg, seterrorMsg] = useState(false);
  const [isShowResendOtp, setisShowResendOtp] = useState(false);
  const [sendOtpResponse, setisendOtpResponse] = useState({});
  const [otpTime, setotpTime] = useState(null);
  const [otpTimer, setotpTimer] = useState(null);
  const [searchParams] = useSearchParams();
  const query = new URLSearchParams(searchParams);
  const navigate = useNavigate();

  const handlePassword = (e) => {
    setpassword(e.target.value);
  };

  const resendOtpClick = () => {
    if (isShowResendOtp) {
      clearInterval(otpTimer);

      let body = {
        mobile: phNo,
        country_code: "91",
        token: sendOtpResponse.resend_token,
        action: "resend",
      };
      return fpi.auth
        .sendOtpMobile({ body, id: window.APP_DATA.applicationID })
        .then((res) => {
          if (res?.payload?.success) {
            setotpSent(true);
            setisShowResendOtp(false);
            setotpTime(res.payload.resend_timer);
            timer(res.payload.resend_timer);
          }
        });
    }
  };
  const goToForgotPass = () => {
    const currentQueryParams = query.toString();
    const newURL = `/auth/forgot-password?${currentQueryParams}`;

    navigate(newURL);
  }
  const sentOTP = () => {
    setisLoading(true)
    fpi.auth.sendOtp({ mobile: phNo, country_code: "91" }).then((res) => {
      if (res?.payload?.success) {
        setisLoading(false)
        setisOtpError(false);
        setotpSent(true);
        setisShowResendOtp(false);
        setotpTime(res.payload.resend_timer);
        setisendOtpResponse(res.payload);
        timer(res.payload.resend_timer);
      }
      if (res?.error?.message) {
        setisLoading(false)
        setisOtpError(true);
        seterrorMsg(res?.error?.message);
      }
    });
  };

  const verifyOtpLogin = () => {
    const body = { request_id: sendOtpResponse.request_id, otp: otp };
    fpi.auth.signInUserWithOtp({ body, id: window.APP_DATA.applicationID }).then((res) => {
      if (res?.error?.message) {
        setisOtpError(true);
        seterrorMsg(res?.error?.message);
      }
    });
  };

  const timer = (remaining) => {
    setotpTimer(
      setInterval(() => {
        remaining -= 1;
        setotpTime(`${remaining}`);
        if (remaining < 0) {
          clearInterval(otpTimer);
          setisShowResendOtp(true);
        }
      }, 1000)
    );
  };
  function loginWithPaas() {
    setisLoading(true)
    fpi.auth
      .signInUserWithPassword({
        username,
        password,
      })
      .then((res) => {
        setisLoading(false)
        if (res?.error?.message) {
          setispassError(true);
          seterrorMsg(res?.error?.message);
        }
      });

  }

  function redirectToAnotherURL(arg) {
    const currentQueryParams = query.toString();
    const newURL = `${arg}?${currentQueryParams}`;

    navigate(newURL);

  }
  return (
    <LoginContainer>
      <div className={styles.loginContent}>
        <ul className={styles.loginTabButtons}>
          <li className={`${styles.tabButton} ${styles.registerButton}`} onClick={()=>redirectToAnotherURL('/auth/register')}>
            <div>Register</div>
          </li>
          <li
            className={`${styles.tabButton} ${styles.loginButton} ${styles.selected}`}
          >
            <div>Login</div>
          </li>
        </ul>
        {selected == "password" ? (
          <div className={styles.loginContentWrapper}>
            <div>
              {/**/}
              <div>
                <div className={styles.loginInputGroup}>
                  <div className={styles.loginMobileInput}>
                    <div className={styles.loginInputGroup}>
                      <label
                        htmlFor="username"
                        className={styles.loginInputTitle}
                      >
                        Email / Mobile
                      </label>
                      <input
                        type="text"
                        name="username"
                        placeholder="abcd@gmail.com / 9987123456"
                        required="required"
                        value={username}
                        onChange={(e) => setusername(e.target.value)}
                      />
                      {/**/}
                    </div>
                    <div className={styles.loginModeButtons}>
                      <button
                        type="button"
                        className={`${styles.loginModeButton} ${
                          styles.loginOtpButton
                        } ${selected == "otp" && styles.selected}`}
                        onClick={() => setselected("otp")}
                      >
                        OTP
                      </button>
                      <button
                        type="button"
                        className={`${styles.loginModeButton} ${
                          styles.loginPasswordButton
                        } ${selected == "password" && styles.selected}`}
                        onClick={() => setselected("password")}
                      >
                        Password
                      </button>
                    </div>
                    <div className={styles.loginInputGroup}>
                      <div className={styles.passwordLabelWrapper}>
                        <label
                          htmlFor="password"
                          className={styles.loginInputTitle}
                        >
                          Password
                        </label>
                        <div className={styles.forgotPassword} onClick={goToForgotPass}>
                          Forgot Password?
                        </div>
                      </div>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          name="password"
                          required="required"
                          type="password"
                          value={password}
                          onChange={(e) => handlePassword(e)}
                        />
                        {/**/}
                        {/**/}
                      </div>
                    </div>
                  </div>
                  {/**/}
                  <div className={styles.midLinks}>
                    By continuing, I agree to the
                    <a href="/terms-and-conditions" target="_blank">
                      Terms of Service
                    </a>
                    &amp;
                    <a href="/privacy-policy" target="_blank">
                      Privacy Policy
                    </a>
                  </div>
                  <div />
                  {ispassError && (
                    <div
                      className={`${styles.loginAlert} ${styles.alertError}`}
                    >
                      <span className={styles.alertMessage}>{errorMsg}</span>
                    </div>
                  )}
                  <button
                    className={`${styles.loginButton} ${
                      password.length > 6 && username.length > 1
                        ? styles.secondaryBtn
                        : ""
                    }`}
                    disabled={!(password.length > 6 && username.length)}
                    onClick={loginWithPaas}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.loginContentWrapper}>
            <div>
              {/**/}
              <div>
                <div className={styles.loginInputGroup}>
                  {otpSent ? (
                    <div>
                      <div className={styles.loginInputGroup}>
                        <span className={styles.otpSentMsg}>
                          OTP sent to {sendOtpResponse.mobile}
                        </span>
                        <label className={styles.loginInputTitle} for="otp">
                          OTP
                        </label>
                        <input
                          type="number"
                          name="otp"
                          required=""
                          value={otp}
                          onChange={(e) => setotp(e.target.value)}
                          className={styles.loginMobileOtp}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.loginMobileInput}>
                      <div className={styles.loginInputGroup}>
                        <label
                          htmlFor="username"
                          className={styles.loginInputTitle}
                        >
                          Mobile No
                        </label>
                        <input
                          type="text"
                          name="username"
                          placeholder="9987123456"
                          required="required"
                          value={phNo}
                          onChange={(e) => setphNo(e.target.value)}
                        />
                        {/**/}
                      </div>
                      <div className={styles.loginModeButtons}>
                        <button
                          type="button"
                          className={`${styles.loginModeButton} ${
                            styles.loginOtpButton
                          } ${selected == "otp" && styles.selected}`}
                          onClick={() => setselected("otp")}
                        >
                          OTP
                        </button>
                        <button
                          type="button"
                          className={`${styles.loginModeButton} ${
                            styles.loginPasswordButton
                          } ${selected == "password" && styles.selected}`}
                          onClick={() => setselected("password")}
                        >
                          Password
                        </button>
                      </div>
                    </div>
                  )}
                  <div className={styles.midLinks}>
                    By continuing, I agree to the
                    <a href="/terms-and-conditions" target="_blank">
                      Terms of Service
                    </a>
                    &amp;
                    <a href="/privacy-policy" target="_blank">
                      Privacy Policy
                    </a>
                  </div>
                  <div />
                  {isOtpError && (
                    <div
                      className={`${styles.loginAlert} ${styles.alertError}`}
                    >
                      <span className={styles.alertMessage}>{errorMsg}</span>
                    </div>
                  )}
                  {!otpSent ? (
                    <button
                      className={`${styles.loginButton} ${
                        phNo.length > 5 ? styles.secondaryBtn : ""
                      }`}
                      disabled={!(phNo.length > 5)}
                      onClick={sentOTP}
                    >
                      Send OTP
                    </button>
                  ) : (
                    <div>
            
                      <button
                        className={`${styles.loginButton} ${styles.verifyOtpBtn} ${styles.secondaryBtn}`}
                        disabled={false}
                        onClick={verifyOtpLogin}
                      >
                        LOGIN
                      </button>
                      <button
                        className={`${styles.loginButton} ${
                          styles.resendOtpBtn
                        } ${isShowResendOtp ? styles.secondaryBtn : ""}`}
                        disabled={!isShowResendOtp}
                        onClick={resendOtpClick}
                      >
                        <span>
                          Resend OTP &nbsp;
                          {!isShowResendOtp ? `In ${otpTime}s ` : null}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div></div>
          </div>
        )}
      </div>
  {  isLoading &&  <Loader></Loader>}
    </LoginContainer>
  );
}

export default LoginWrap;
