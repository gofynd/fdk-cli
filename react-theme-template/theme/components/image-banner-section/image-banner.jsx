import React from 'react';
import styles from '../../styles/image-banner.less';

const ImageBanner = ({ bannerImage }) => {
  return (
    <div className={styles.bannerImageContainer}>
      <div
        className={styles.imageContainer}
        style={{
          background: `url(${bannerImage?.value})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      ></div>
    </div>
  );
};

export default ImageBanner;
