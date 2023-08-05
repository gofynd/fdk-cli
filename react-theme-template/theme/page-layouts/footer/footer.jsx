import React from "react";
import styles from "../../styles/footer.less";
import { useGlobalStore } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import useFooter from "./useFooter";

const Footer = ({ fpi }) => {
  const configuration = useGlobalStore(fpi?.getters?.CONFIGURATION);

  const { globalConfig, navigation, appInfo, support, footerProps } =
    useFooter(fpi);

  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerTop}>
        <div className={styles.footerTopGeneralContainer}>
          <div className={styles.footerLogoDescription}>
            <img
              className={styles.footerLogo}
              src={configuration?.application?.logo?.secure_url}
              alt="Footer Logo"
            />
            <p className={styles.footerDescription}>
              {footerProps?.footer_description || " Astra is a form of self-expression and autonomy at a particular  period and place and in a specific context, of clothing, footwear,   lifestyle, accessories, makeup, hairstyle, and body posture."}
            </p>
          </div>
          <div className={styles.footerNavigationLinks}>
            <div className={styles.linksContainer}>
              <h5 className={styles.linkHeading}>Links</h5>
              {navigation?.length > 0 &&
                navigation.slice(0, 4).map((nav, index) => (
                  <FDKLink to={nav?.action?.page?.url} key={index}>
                    <p className={styles.linkParagraph}> {nav?.display}</p>
                  </FDKLink>
                ))}
            </div>
            <div className={styles.linksContainer}>
              <h5 className={styles.linkHeading}>Legal</h5>
              {appInfo?.links?.length > 0 &&
                appInfo.links.slice(0, 4).map((legal, index) => (
                  <FDKLink to={legal?.link} key={index}>
                    <p className={styles.linkParagraph}> {legal?.title}</p>
                  </FDKLink>
                ))}
            </div>
          </div>
        </div>
        <div className={styles.footerTopSocialLinksContainer}>
          {support?.contact?.phone?.active && (
            <div className={styles.contactContainer}>
              <h5>Contact Us</h5>
              <p>
                {support?.contact?.phone?.phone?.length > 0 &&
                  support?.contact?.phone?.phone[0].number}
              </p>
            </div>
          )}
          {support?.contact?.email?.active && (
            <div
              className={styles.contactContainer}
              style={{ justifyContent: "center" }}
            >
              <h5>Email</h5>
              <p>
                {support?.contact?.email?.email?.length > 0 &&
                  support?.contact?.email?.email[0].value}
              </p>
            </div>
          )}

          {Object.keys(appInfo?.social_links || {})?.length > 0 && (
            <div
              className={styles.contactContainer}
              style={{ justifyContent: "end" }}
            >
              <h5>Social Links</h5>
              {Object.keys(appInfo.social_links).map((socialLink) => {
                if (
                  appInfo.social_links[socialLink].link &&
                  appInfo.social_links[socialLink].icon
                ) {
                  return (
                    <FDKLink to={appInfo.social_links[socialLink].link}>
                      <img
                        src={appInfo.social_links[socialLink].icon}
                        alt={appInfo.social_links[socialLink].title}
                        className={styles.socialLinkIcon}
                      />
                    </FDKLink>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <h1 className={styles.copyRightText}>{appInfo?.copyright_text}</h1>
        <img
          src="https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/wrkr/company/4032/applications/6418537ceb7bf1c92619ca6d/theme/pictures/free/original/theme-image-1680262108848.png"
          className={styles.paymentLogo}
        />
      </div>
    </div>
  );
};

Footer.serverFetch = ({ fpi }) =>
  Promise.all([
    fpi.content.fetchNavigation(),
    fpi.content.fetchSupportInformation(),
    fpi.configuration.fetchContactInfo(),
  ]);

export default Footer;
