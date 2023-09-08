import React from "react";
import styles from "./login-container.less";

function LoginContainer({ children }) {
  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogoWrapper}>
          <img
            src="https://hdn-1.addsale.com/x0/company/164/applications/5efc9913f474c329718e3690/application/pictures/free-logo/original/olqHM8LNr-JioMart-Groceries.png"
            alt="logo"
            className={styles.desktopImg}
          />
          <div className={styles.loginLogoText}>
            <div className={styles.loginFyndText}>Fynd</div>
            <div className={styles.loginText}>Login to Fynd</div>
          </div>
        </div>

          {children}

      </div>
    </div>
  );
}

export default LoginContainer;
