import React from 'react';
import { useSnapCarousel } from 'react-snap-carousel';
import styles from '../../styles/collection.less';
import { FDKLink } from 'fdk-core/components';
import SvgWrapper from '../svgWrapper/SvgWrapper.jsx';

const BestCollectionSection = ({ heading, subHeading, products }) => {
  const { scrollRef, next, prev } = useSnapCarousel();
  return (
<div className={styles.imageCarouselContainer}>
  <h2 className={styles.imageCarouselHeading}>{heading?.value}</h2>
  <p className={styles.imageCarouselSubHeading}>{subHeading?.value}</p>
  <div
    className={styles.carouselContainer}
    style={{ scrollSnapType: 'x mandatory' }}
    ref={scrollRef}
  >
    {products?.length > 0 &&
      products?.map((singleProduct) => {
        singleProduct = singleProduct.props;
        return (
          <FDKLink to={`/product/${singleProduct?.productId?.value}`}>
            <div className={styles.productContainer}>
              <img
                src={singleProduct?.productImage?.value}
                className={styles.productImage}
                alt={singleProduct?.productTitle?.value}
              />
              <h3 className={styles.productHeading}>
                {singleProduct?.productTitle?.value}
              </h3>
              <p className={styles.productPricing}>
                <span className={styles.ruppeeIcon}> &#x20B9;</span>
                {singleProduct?.productDiscountedPrice?.value}{' '}
                <span className={styles.productOriginalPrice}>
                  <span className={styles.ruppeeIcon}> &#x20B9;</span>
                  {singleProduct?.productMRP?.value}
                </span>
              </p>
            </div>
          </FDKLink>
        );
      })}
  </div>
  <div className={styles.prevNextButtonContainer}>
    <SvgWrapper svgSrc="arrow-left" onClick={() => prev()} />
    <SvgWrapper svgSrc="arrow-right" onClick={() => next()} />
  </div>
</div>

  );
};

export default BestCollectionSection;
