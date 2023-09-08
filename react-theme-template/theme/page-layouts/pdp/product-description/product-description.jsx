import React, { useEffect, useState } from "react";
import styles from "./product-description.less";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import Loader from "../../../components/loader/loader";
import useProductDescription from "./useProductDescription";

const ProductDescriptionPdp = ({ fpi, slug }) => {
  const [isSizeModalOpen, setSizeSideModal] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const {
    productDetails,
    currentImageIndex,
    productVariants,
    isLoading,
    productPriceBySlug,
    productMeta,
    currentSizeIndex,
    currentPincode,
    setCurrentImageIndex,
    setCurrentSizeIndex,
    setCurrentPincode,
    errMsg,
  } = useProductDescription(fpi, slug);

  let { medias, grouped_attributes } = productDetails;
  let { sizes } = productMeta;
  medias = medias?.length > 0 && medias.filter((el) => el?.type === "image");

  const priceDataDefault = productMeta?.price;

  const priceDataBySize = productPriceBySlug?.price;

  const handlePincodeInput = (input) => {
    const regex = /^[0-9]{0,6}$/; // Only allow numbers and maximum 6 digits

    if (regex.test(input)) {

      setCurrentPincode(input);
    }
  };
  useEffect(() => {
    if (medias?.length > 0 && !currentImageIndex) {
      setCurrentImageIndex(0);
    }
  }, [medias]);

  useEffect(() => {
    if (grouped_attributes?.length > 0) {
      setActiveTab(0);
    }
  }, [grouped_attributes]);

  function addItemsToCart(event, buyNow = false) {
    if (event) {
      event.stopPropagation();
    }
    if (!sizes[currentSizeIndex]?.value) {
      return alert("Size Not Available");
    }
    const itemsQuery = {
      item_id: productDetails?.uid,
      item_size: sizes[currentSizeIndex]?.value,
      quantity: 1,
      article_assignment: productPriceBySlug?.article_assignment,
      seller_id: productPriceBySlug?.seller?.uid,
      store_id: productPriceBySlug?.store?.uid,
    };
    fpi.cart.addCartItem({ items: [itemsQuery], buy_now: buyNow }).then(() => {
      fpi.cart.getCartItemsCount();
    });
  }
  return (
    <>
      <div className={styles.productDescriptionContainer}>
        {productDetails?.slug === slug && (
          <>
            <div className={styles.productImagesPricingContainer}>
              <div className={styles.productImagesContainer}>
                <div className={styles.carouselImagesContainer}>
                  <div className={styles.singleImagePreviewContainer}>
                    <div className={styles.carouselSvgContainer}>
                      <SvgWrapper
                        svgSrc={"carouselright"}
                        style={{ transform: "rotate(180deg)" }}
                        className={`${
                          currentImageIndex === 0 && styles.inActiveSvg
                        }`}
                        onClick={() => {
                          if (medias?.length > 0 && currentImageIndex !== 0) {
                            setCurrentImageIndex(currentImageIndex - 1);
                          }
                        }}
                      />
                    </div>
                    <div className={styles.carouselImage}>
                      {currentImageIndex !== null && medias?.length > 0 && (
                        <img
                          src={
                            medias[currentImageIndex]?.url || "No product Image"
                          }
                          alt={
                            medias[currentImageIndex]?.alt || "No Product alt"
                          }
                        />
                      )}
                    </div>
                    <div className={styles.carouselSvgContainer}>
                      <SvgWrapper
                        svgSrc={"carouselright"}
                        className={`${
                          currentImageIndex === medias?.length - 1 &&
                          styles.inActiveSvg
                        }`}
                        onClick={() => {
                          if (
                            medias?.length > 0 &&
                            currentImageIndex !== medias.length - 1
                          ) {
                            setCurrentImageIndex(currentImageIndex + 1);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.multipleImagePreviewContainer}>
                    <SvgWrapper
                      svgSrc={"arrow-left"}
                      onClick={() => {
                        if (
                          currentImageIndex !== null &&
                          currentImageIndex === 0 &&
                          medias?.length > 0
                        ) {
                          setCurrentImageIndex(medias.length - 1);
                        } else if (
                          currentImageIndex !== null &&
                          medias?.length > 0
                        ) {
                          setCurrentImageIndex(currentImageIndex - 1);
                        }
                      }}
                    />
                    <div className={styles.imagesPreview}>
                      {medias?.length > 0 &&
                        medias.map((singleImage, index) => {
                          return (
                            singleImage?.type === "image" && (
                              <div
                                key={index}
                                className={`${styles.imageContainer} ${
                                  currentImageIndex === index && styles.selected
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                              >
                                <img
                                  src={singleImage?.url}
                                  alt={singleImage?.alt}
                                />
                              </div>
                            )
                          );
                        })}
                    </div>
                    <SvgWrapper
                      svgSrc={"arrow-right"}
                      onClick={() => {
                        if (
                          currentImageIndex !== null &&
                          currentImageIndex === medias?.length - 1
                        ) {
                          setCurrentImageIndex(0);
                        } else if (
                          currentImageIndex !== null &&
                          medias?.length > 0
                        ) {
                          setCurrentImageIndex(currentImageIndex + 1);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.productPricingContainer}>
                <h1 className={styles.productNameHeading}>
                  {productDetails?.name}
                </h1>
                {sizes?.length !== 0 && (
                  <div className={styles.productPriceContainer}>
                    <span className={styles.productMrp}>MRP :</span>
                    {(priceDataDefault || priceDataBySize) && (
                      <>
                        <span className={styles.productEffectivePrice}>
                          {priceDataBySize?.currency_symbol ||
                            priceDataDefault?.effective?.currency_symbol}
                          {priceDataBySize?.effective ||
                            priceDataDefault?.effective?.min}
                        </span>
                        <span className={styles.productMarkedPrice}>
                          {priceDataBySize?.currency_symbol ||
                            priceDataDefault?.marked?.currency_symbol}
                          {priceDataBySize?.marked ||
                            priceDataDefault?.marked?.min}
                        </span>
                      </>
                    )}
                    {(productMeta?.discount ||
                      productPriceBySlug?.discount) && (
                      <span className={styles.productDiscount}>
                        {productPriceBySlug?.discount || productMeta?.discount}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.productTaxLabel}>
                  Price inclusive of all tax
                </div>
                {productPriceBySlug?.seller?.name && (
                  <div className={styles.productSellerInformation}>
                    <span className={styles.sellerHeading}>Seller :</span>
                    <span className={styles.sellerName}>
                      &nbsp;{productPriceBySlug?.seller?.name}
                    </span>
                  </div>
                )}
                <div className={styles.sizeGuideContainer}>
                  <span className={styles.sizeGuideHeading}>SIZE GUIDE</span>
                  <span className={styles.plainScaleSvg}>
                    <SvgWrapper svgSrc={"plain-scale"} />
                  </span>
                </div>
                <div className={styles.sizeCartSelectionContainer}>
                  <div
                    className={styles.sizeSelectionContainer}
                    onClick={() => setSizeSideModal(!isSizeModalOpen)}
                  >
                    <div className={styles.sizeDetails}>
                      <p className={styles.currentSize}>
                        SIZE :&nbsp;
                        {sizes?.length > 0 && sizes[currentSizeIndex]?.display}
                      </p>
                      <SvgWrapper
                        svgSrc={"arrow-down"}
                        className={`${
                          isSizeModalOpen && styles.sizeContainerOpen
                        }`}
                      />
                      <div
                        className={`${styles.sizePopUpModal}`}
                        style={{ display: isSizeModalOpen ? "block" : "none" }}
                      >
                        {sizes?.length > 0 &&
                          sizes.map((singleSize, index) => {
                            return (
                              <p
                                key={singleSize?.display}
                                className={styles.singleSizes}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setCurrentSizeIndex(index);
                                  setSizeSideModal(false);
                                }}
                              >
                                {singleSize?.display}
                              </p>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles.cartSelectionContainer}
                    onClick={(e) => addItemsToCart(e)}
                  >
                    <SvgWrapper svgSrc={"cart"} />
                    <h5>ADD TO CART</h5>
                  </div>
                </div>
                {/* <div
                  className={styles.buyNowButtonContainer}
                  onClick={(e) => addItemsToCart(e, true)}
                >
                  <h5>BUY NOW</h5>
                </div> */}
                <div className={styles.pinCodeEnterContainer}>
                  <p className={styles.pincodeHeading}>
                    Select delivery location
                  </p>
                  <div className={styles.pincodeInputContainer}>
                    <input
                      type="tel"
                      max={6}
                      className={styles.pincodeInput}
                      placeholder="Please enter PIN code to check delivery time"
                      value={currentPincode}
                      onChange={(e) => {
                        handlePincodeInput(e.target.value);
                      }}
                    />
                    {/* <button className={styles.changePincodeContainer}>
                      <span className={styles.changePinCodeHeading}>
                        Check
                        <SvgWrapper svgSrc={"truck"} />
                      </span>
                    </button> */}
                  </div>
                  {currentPincode?.length === 6 && productPriceBySlug && (
                    <div className={styles.deliveryDateContainer}>
                     {!errMsg && <SvgWrapper svgSrc={"truck"} />}
                      <p>
                        {!errMsg ? (
                          <span>
                            {" "}
                            Product is servicable at Pincode {currentPincode}
                          </span>
                        ) : (
                          <span style={{ color: "red" }}>
                            Product is not servicable at Pincode{" "}
                            {currentPincode}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.productDetailsContainer}>
              {grouped_attributes?.length > 0 &&
                grouped_attributes.map((singleAttributes, index) => {
                  return (
                    <h5
                      className={`${styles.productDetailsTab} ${
                        activeTab === index && styles.tabsActive
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(index);
                      }}
                      key={singleAttributes.title}
                    >
                      {singleAttributes.title}
                    </h5>
                  );
                })}
            </div>
            {activeTab !== null &&
              grouped_attributes?.length > 0 &&
              grouped_attributes[activeTab] &&
              grouped_attributes[activeTab]?.details?.length > 0 && (
                <div className={styles.productDetailsData}>
                  <ul>
                    {grouped_attributes[activeTab]?.details?.map(
                      (singleAttribute) => {
                        if (singleAttribute?.type === "text") {
                          return (
                            <li key={singleAttribute?.key}>
                              {`${singleAttribute?.key} : ${singleAttribute?.value}`}
                            </li>
                          );
                        }
                      }
                    )}
                  </ul>
                </div>
              )}
          </>
        )}
      </div>
      {isLoading && <Loader />}
    </>
  );
};

export default ProductDescriptionPdp;
