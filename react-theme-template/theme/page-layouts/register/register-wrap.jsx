import React, { useEffect, useState } from "react";
import LoginContainer from "../Login/login-container";
import styles from "./register-wrap.less";
import { useGlobalStore } from "fdk-core/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../../components/loader/loader";

function RegisterWrap({ fpi }) {
  const platformdata = useGlobalStore(fpi.getters.PLATFORM_DATA);

  const [searchParams] = useSearchParams();
  const query = new URLSearchParams(searchParams);
  const [isLoading, setisLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: { value: "", showError: false },
    lastName: { value: "", showError: false },
    gender: { value: "male" },
    email: { value: "", showError: false, errorMessage: "" },
    password: { value: "", showError: false, errorMessage: "" },
    confirmPassword: { value: "", showError: false, errorMessage: "" },
  });
  const navigate = useNavigate();
  const [sendOtpResponse, setisendOtpResponse] = useState({});
  const [phNo, setphNo] = useState("");
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [isAllField, setisAllField] = useState(false);
  const [isInValidForm, setIsInValidForm] = useState(false);
  const [inValidFormErrorMsg, setInValidFormErrorMsg] = useState("");
  const [otpSent, setotpSent] = useState(false);
  const [otpMobile, setotpMobile] = useState("");
  const [isValidMobileOtp, setisValidMobileOtp] = useState(false);
  const [isValidEmailOtp, setisValidEmailOtp] = useState(false);

  const [otpemail, setotpemail] = useState("");
  const [isShowResendOtpMobile, setisShowResendOtpMobile] = useState(false);
  const [isShowResendOtpEmail, setisShowResendOtpEmail] = useState(false);
  const [mobileOtpTime, setmobileOtpTime] = useState("30");
  const [emailOtpTime, setemailOtpTime] = useState("90");
  const [mobileOtpTimer, setmobileOtpTimer] = useState(null);
  const [emailOtpTimer, setemailOtpTimer] = useState(null);
  const [verifyMobileOtp, setverifyMobileOtp] = useState(false);
  const [verifyEmailOtp, setverifyEmailOtp] = useState(false);
  const [isInValidMobile, setisInValidMobile] = useState(false);
  const [isInValidEmail, setisInValidEmail] = useState(false);
  const [inValidMobileErrorMsg, setinValidMobileErrorMsg] = useState("");
  const [inValidEmailErrorMsg, setinValidEmailErrorMsg] = useState("");
  const isEmail = platformdata?.register_required_fields?.email?.is_required; // Set your condition for email visibility
  // Set your condition for email required


  function checkObjectProperties(obj) {
    for (let prop in obj) {
      if (prop === "email" && !isEmail) {
        continue; // Skip checking the "email" property
      }

      if (!obj[prop].value) {
        return false;
      }
    }

    return true;
  }
  const resendOtpClick = () => {
    if (isShowResendOtpMobile) {
      clearInterval(mobileOtpTimer);

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
  const mobiletimer = (remaining) => {
    setmobileOtpTimer(
      setInterval(() => {
        remaining -= 1;
        setmobileOtpTime(`${remaining}`);
        if (remaining < 0) {
          clearInterval(mobileOtpTimer);
          setisShowResendOtpMobile(true);
        }
      }, 1000)
    );
  };
  const emailtimer = (remaining) => {
    setemailOtpTimer(
      setInterval(() => {
        remaining -= 1;
        setemailOtpTime(`${remaining}`);
        if (remaining < 0) {
          clearInterval(emailOtpTimer);
          setisShowResendOtpEmail(true);
        }
      }, 1000)
    );
  };
  const verifyOtpRegisterMobile = () => {
    if (otpMobile) {
      let isEmailVerified = false;
      if (sendOtpResponse?.verify_email_otp) {
        if (isValidEmailOtp) {
          isEmailVerified = true;
        }
      } else {
        isEmailVerified = true;
      }
      let body = {
        request_id: sendOtpResponse && sendOtpResponse.request_id,
        register_token: sendOtpResponse && sendOtpResponse.register_token,
        otp: otpMobile,
        is_email_verified: isEmailVerified,
        is_redirection: true,
      };

      fpi.auth
        .verifyMobileOtp({ body, id: window.APP_DATA.applicationID })
        .then((res) => {

          if (res?.meta?.requestStatus == "fulfilled") {
            setisInValidMobile(false);
            setisValidMobileOtp(true);
            setverifyMobileOtp(false);
            if (isEmailVerified) {
              navigate("/");
            } else {
              console.log("Mobile-Verified");
            }
          } else {
            if (res.error.message) {
              setinValidMobileErrorMsg(res.error.message);
            }
            setisInValidMobile(true);
            setisValidMobileOtp(false);
          }
        });
    }
  };
  const verifyOtpRegisterEmail = () => {
    if (otpemail) {
      let isMobileVerified = false;
      if (sendOtpResponse?.verify_mobile_otp) {
        if (isValidMobileOtp) {
          isMobileVerified = true;
        }
      } else {
        isMobileVerified = true;
      }

      let body = {
        otp: otpemail,
        email: sendOtpResponse && sendOtpResponse.email,
        register_token: sendOtpResponse && sendOtpResponse.register_token,
        action: "register",
        is_mobile_verified: isMobileVerified,
        is_redirection: true,
      };
      fpi.auth
        .verifyEmailOtp({ body, id: window.APP_DATA.applicationID })
        .then((res) => {

          if (res?.meta?.requestStatus == "fulfilled") {
            if (isMobileVerified) {
              navigate("/");
            } else {
              console.log("Email-Verified");
            }
            setisInValidEmail(false);
            setisValidEmailOtp(true);
            setverifyEmailOtp(false);
          } else {
            if (res?.error?.message) {
              setinValidEmailErrorMsg(err.message);
            }
            setisInValidEmail(true);
            setisValidEmailOtp(false);
          }
        });
    }
  };

  useEffect(() => {
    if (checkObjectProperties(formData)) {
      setisAllField(true);
    } else {
      setisAllField(false);
    }
  }, [formData]);
  const isEmailRequired = () => {
    if (platformdata?.required_fields?.email?.level === "soft") {
      return "(optional)";
    }
    if (platformdata?.required_fields?.email?.level === "hard") {
      return "*";
    }
  };
  const isMobileRequired = () => {
    if (platformdata?.required_fields?.mobile?.level === "soft") {
      return "(optional)";
    }
    if (platformdata?.required_fields?.mobile?.level === "hard") {
      return "*";
    }
  };

  const isMobile = platformdata?.register_required_fields?.mobile?.is_required; // Set your condition for mobile visibility

  const validateFname = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      firstName: { ...prevData.firstName, value },
    }));
  };

  const registerUser = () => {
    let body = {};
    setisLoading(true)

    for (const property in formData) {
      if (property != "confirmPassword")
        body[property] = formData[property].value;
    }

    body["phone"] = {
      mobile: phNo,
      country_code: "91",
    };
    body["register_token"] = "";

    if (checkObjectProperties(formData)) {
      if (formData.confirmPassword.value == formData.password.value) {
        fpi.auth
          .signUpUser({
            body,
            id: window.APP_DATA.applicationID,
          })
          .then((res) => {
         
            if (res?.error?.message) {
              setisLoading(false)
              setIsInValidForm(true);
              setInValidFormErrorMsg(res?.error?.message);
            } else {
              setisLoading(false)
              if (
                res?.payload?.verify_mobile_otp ||
                res?.payload?.verify_email_otp
              ) {
                if (res?.payload?.verify_mobile_otp) {
                  setverifyMobileOtp(true);
                  mobiletimer(res?.payload?.resend_timer);
                }
                if (res?.payload?.verify_email_otp) {
                  setverifyEmailOtp(true);
                  emailtimer(90);
                }
                setisendOtpResponse(res.payload);
                setotpSent(true);
                setIsInValidForm(false);
              } else {
                navigate("/");
              }
            }
          });
      } else {
        setIsInValidForm(true);
        setInValidFormErrorMsg("Password Mismatch");
      }
    } else {
      setIsInValidForm(true);
      setInValidFormErrorMsg("Please Fill all field");
    }

  };
  const validateLname = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      lastName: { ...prevData.lastName, value },
    }));
  };

  const validateEmail = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      email: { ...prevData.email, value },
    }));
  };

  const validatePassword = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      password: { ...prevData.password, value },
    }));
  };

  const validateConfirmPassword = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      confirmPassword: { ...prevData.confirmPassword, value },
    }));
  };

  const passwordShowClick = () => {
    setIsPasswordShow(true);
  };

  const passwordHideClick = () => {
    setIsPasswordShow(false);
  };

  const confirmPasswordShowClick = () => {
    setIsConfirmPasswordShow(true);
  };

  const confirmPasswordHideClick = () => {
    setIsConfirmPasswordShow(false);
  };

  function redirectToAnotherURL(arg) {
    const currentQueryParams = query.toString();
    const newURL = `${arg}?${currentQueryParams}`;

    navigate(newURL);
  }

  return (
    <LoginContainer>
      <div className={styles.loginContent}>
        <ul className={styles.loginTabButtons}>
          <li
            className={`${styles.tabButton} ${styles.registerButton} ${styles.selected}`}
          >
            <div>Register</div>
          </li>
          <li
            onClick={() => redirectToAnotherURL("/auth/login")}
            className={`${styles.tabButton} ${styles.loginButton} `}
          >
            <div>Login</div>
          </li>
        </ul>
        <div className={styles.registerFormWrapper}>
          {!otpSent ? (
            <>
              <div className={styles.registerNameInput}>
                <div
                  className={`${styles.inputGroup} ${
                    formData.firstName.showError ? styles.errorInput : ""
                  }`}
                >
                  <label className={styles.inputTitle} htmlFor="firstName">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName.value}
                    onChange={validateFname}
                  />
                </div>
                <div
                  className={`${styles.inputGroup} ${
                    formData.lastName.showError ? styles.errorInput : ""
                  }`}
                >
                  <label className={styles.inputTitle} htmlFor="lastName">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName.value}
                    onChange={validateLname}
                  />
                </div>
              </div>
              <div className={styles.genderRadioContainer}>
                <label className={styles.radioContainer}>
                  Male
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender.value === "male"}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        gender: { value: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.checkmark}></span>
                </label>
                <label className={styles.radioContainer}>
                  Female
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender.value === "female"}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        gender: { value: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.checkmark}></span>
                </label>
                <label className={styles.radioContainer}>
                  Other
                  <input
                    type="radio"
                    name="gender"
                    value="unisex"
                    checked={formData.gender.value === "unisex"}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        gender: { value: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.checkmark}></span>
                </label>
              </div>
              {isEmail && (
                <div
                  className={`${styles.resgisterEmail} ${
                    formData.email.showError ? styles.errorInput : ""
                  }`}
                >
                  <label className={styles.inputTitle} htmlFor="email">
                    Email {isEmailRequired()}
                  </label>
                  <input
                    type="text"
                    name="email"
                    required
                    value={formData.email.value}
                    onChange={validateEmail}
                  />
                  <p className={styles.errorText}>
                    {formData.email.errorMessage}
                  </p>
                </div>
              )}
              {isMobile && (
                <div className={styles.registerMobileInput}>
                  {/* Replace with your mobile input component */}
                  <div className={styles.loginMobileInput}>
                    <div className={styles.loginInputGroup}>
                      <label
                        htmlFor="username"
                        className={styles.loginInputTitle}
                      >
                        Mobile No{isMobileRequired()}
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
                  </div>
                </div>
              )}
              <div
                className={`${styles.registerPasswordInput} ${
                  formData.password.showError ? styles.errorInput : ""
                }`}
              >
                <label className={styles.inputTitle} htmlFor="password">
                  Password*
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={isPasswordShow ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password.value}
                    onChange={validatePassword}
                  />
                  {formData.password.value && !isPasswordShow && (
                    <div
                      className={styles.passwordToggle}
                      onClick={passwordShowClick}
                    >
                      {/* Replace with show password icon */}
                    </div>
                  )}
                  {formData.password.value && isPasswordShow && (
                    <div
                      className={styles.passwordToggle}
                      onClick={passwordHideClick}
                    >
                      {/* Replace with hide password icon */}
                    </div>
                  )}
                </div>
                <p className={styles.errorText}>
                  {formData.password.errorMessage}
                </p>
              </div>
              <div
                className={`${styles.registerConfirmPasswordInput} ${
                  formData.confirmPassword.showError ? styles.errorInput : ""
                }`}
              >
                <label className={styles.inputTitle} htmlFor="confirmPassword">
                  Confirm Password*
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={isConfirmPasswordShow ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword.value}
                    onChange={validateConfirmPassword}
                  />
                  {formData.confirmPassword.value && !isConfirmPasswordShow && (
                    <div
                      className={styles.passwordToggle}
                      onClick={confirmPasswordShowClick}
                    >
                      {/* Replace with show password icon */}
                    </div>
                  )}
                  {formData.confirmPassword.value && isConfirmPasswordShow && (
                    <div
                      className={styles.passwordToggle}
                      onClick={confirmPasswordHideClick}
                    >
                      {/* Replace with hide password icon */}
                    </div>
                  )}
                </div>
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
                <p className={styles.errorText}>
                  {formData.confirmPassword.errorMessage}
                </p>

                <button
                  className={`${styles.loginButton} ${
                    isAllField ? styles.secondaryBtn : ""
                  }`}
                  disabled={!isAllField}
                  onClick={registerUser}
                >
                  Register
                </button>
              </div>
            </>
          ) : (
            <div>
              {verifyMobileOtp && (
                <>
                  <div className={styles.loginInputGroup}>
                    <h3 className={styles.formWrapperHeader}>Verify Mobile</h3>
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
                      value={otpMobile}
                      onChange={(e) => setotpMobile(e.target.value)}
                      className={styles.loginMobileOtp}
                    />
                  </div>

                  {isInValidMobile && (
                    <div
                      className={`${styles.loginAlert} ${styles.alertError}`}
                    >
                      <span className={styles.alertMessage}>
                        {inValidMobileErrorMsg}
                      </span>
                    </div>
                  )}
                  {otpSent && (
                    <div>
                      <button
                        className={`${styles.loginButton} ${styles.verifyOtpBtn} ${styles.secondaryBtn}`}
                        disabled={false}
                        onClick={verifyOtpRegisterMobile}
                      >
                        SUBMIT
                      </button>
                      <button
                        className={`${styles.loginButton} ${
                          styles.resendOtpBtn
                        } ${isShowResendOtpMobile ? styles.secondaryBtn : ""}`}
                        disabled={!isShowResendOtpMobile}
                        onClick={resendOtpClick}
                      >
                        <span>
                          Resend OTP &nbsp;
                          {!isShowResendOtpMobile
                            ? `In ${mobileOtpTime}s `
                            : null}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
              {verifyEmailOtp && (
                <>
                  <div className={styles.loginInputGroup}>
                    <h3 className={styles.formWrapperHeader}>Verify Email</h3>
                    <span className={styles.otpSentMsg}>
                      OTP sent to {sendOtpResponse.email}
                    </span>
                    <label className={styles.loginInputTitle} for="otp">
                      OTP
                    </label>
                    <input
                      type="number"
                      name="otp"
                      required=""
                      value={otpemail}
                      onChange={(e) => setotpemail(e.target.value)}
                      className={styles.loginMobileOtp}
                    />
                  </div>

                  {isInValidEmail && (
                    <div
                      className={`${styles.loginAlert} ${styles.alertError}`}
                    >
                      <span className={styles.alertMessage}>
                        {inValidEmailErrorMsg}
                      </span>
                    </div>
                  )}
                  {otpSent && (
                    <div>
                      <button
                        className={`${styles.loginButton} ${styles.verifyOtpBtn} ${styles.secondaryBtn}`}
                        disabled={false}
                        onClick={verifyOtpRegisterEmail}
                      >
                        SUBMIT
                      </button>
                      <button
                        className={`${styles.loginButton} ${
                          styles.resendOtpBtn
                        } ${isShowResendOtpEmail ? styles.secondaryBtn : ""}`}
                        disabled={!isShowResendOtpEmail}
                        onClick={resendOtpClick}
                      >
                        <span>
                          Resend OTP &nbsp;
                          {!isShowResendOtpEmail
                            ? `In ${emailOtpTime}s `
                            : null}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {isInValidForm && (
            <div className={`${styles.loginAlert} ${styles.alertError}`}>
              <span className={styles.alertMessage}>{inValidFormErrorMsg}</span>
            </div>
          )}
        </div>
      </div>
      {isLoading && <Loader></Loader>}
    </LoginContainer>
  );
}

export default RegisterWrap;
