import React from 'react';
import styles from './loader.less';

const Loader = (props) => {
  return (
    // <div className={styles.loaderMainContainer}>
    //   <div className={styles.ldsFacebook} {...props}>
    //     <div></div>
    //     <div></div>
    //     <div></div>
    //   </div>
    // </div>
    <div className={styles.loading}>Loading&#8230;</div>

  );
};

export default Loader;
