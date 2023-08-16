import React, { useState } from "react";
import styles from "./cart.less";
import { FDKLink } from "fdk-core/components";
import SvgWrapper from "../../components/svgWrapper/SvgWrapper";
import Loader from "../../components/loader/loader";
import useCart from "./useCart";
import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../../helper/hooks";

const Cart = ({ fpi }) => {
  const [sizeModal, setSizeModal] = useState(null);
  const [currentSizeModalSize, setCurrentSizeModalSize] = useState(null);
  const [pincode, setpincode] = useState(localStorage?.getItem("pincode"));
  const [showModal, setshowModal] = useState(false);
  const [isError, setisError] = useState(false);
  const [errorMsg, seterrorMsg] = useState(false);
  const { loggedIn: isloggedIn } = useLoggedInUser(fpi);
	const navigate = useNavigate();

  

  const handlePincode = () => {
    fpi.logistic
      .fetchPincodeDetails({
        pincode: `${pincode}`,
      })
      .then((res) => {
        console.log("RES",res);
        if (res.payload.success) {
          localStorage?.setItem("pincode", pincode);
          fpi?.cart?.getCartItems({ b: true, i: true, areaCode: `${pincode}` });
          setshowModal(false);
        } else {
          setisError(true);
          seterrorMsg(res?.payload ?? "Something Went Wrong");
        }
      });
  };
  const handlePincodeInput = (input) => {
    const regex = /^[0-9]{0,6}$/; // Only allow numbers and maximum 6 digits

    if (regex.test(input)) {
      setpincode(input);
    }
  };

  const redirectToLogin = () => {
    console.log("here");
    navigate('/auth/login');
  }

  const {
    cartItemCount,
    cartItems,
    cartItemsWithActualIndex,
    breakUpValues,
    isLoading,
    updateCartItems,
    gotoCheckout,
  } = useCart(fpi);
  const cartItemsArray = Object.keys(cartItems || {});
  const sizeModalItemValue = cartItems && sizeModal && cartItems[sizeModal];

  return (
    <>
      <div className={styles.cartMainContainer}>
        <div className={styles.cartItemDetailsContainer}>
          <div className={styles.cartPincodeContainer}>
            <div className={styles.pinCodeDetailsContainer}>
              <span className={styles.pincodeHeading}>Deliver To:</span>
              <span className={styles.pinCode}>
                &nbsp;{`${pincode ? pincode : "Enter Pincode"}`}
              </span>
            </div>
            <div
              className={styles.changePinCodeButton}
              onClick={() => setshowModal(true)}
            >
              Change
            </div>
            {showModal && (
              <div className={styles.pinCodeModal}>
                <div className={styles.modalContainer}>
                  <div className={styles.modalHeader}>
                    <div>
                      <div className={styles.modalHeading}>
                        Enter Delivery Pincode
                      </div>
                    </div>
                    <div className={styles.modalCloseIcon}>
                      <span>
                        <SvgWrapper
                          svgSrc={"item-close"}
                          onClick={() => setshowModal(false)}
                        />
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalBody}>
                    <div className={styles.modalPincodeContainer}>
                      <div className={styles.modalPincodeInput}>
                        <input
                          placeholder="Enter Pincode"
                          value={pincode}
                          onChange={(e) => handlePincodeInput(e.target.value)}
                        />
                      </div>
                      <button
                        className={styles.modalChangePinCodeButton}
                        onClick={handlePincode}
                      >
                        Change
                      </button>
                    </div>
                    {isError && <div style={{ color: "red" }}> {errorMsg}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.cartItemDetailsContainer}>
            <div className={styles.bagDetailsContainer}>
              <span className={styles.bagCountHeading}>Your Bag</span>
              <span className={styles.bagCount}>
                {cartItemCount || 0} items
              </span>
            </div>
            <div></div>
          </div>
          {cartItemsArray?.length > 0 &&
            cartItemsArray?.map((singleItem, itemIndex) => {
              const singleItemDetails = cartItems[singleItem];
              const productImage =
                singleItemDetails?.product?.images?.length > 0 &&
                singleItemDetails?.product?.images[0]?.url;
              const currentSize = singleItem?.split("_")[1];
              return (
                <div className={styles.cartItemsListContainer} key={itemIndex}>
                  <div className={styles.eachItemContainer}>
                    <div className={styles.itemImageContainer}>
                      <FDKLink
                        to={`/product/${singleItemDetails?.product?.slug}`}
                      >
                        <img src={productImage} alt="Product Image" />
                      </FDKLink>
                    </div>
                    <div className={styles.eachItemDetailsContainer}>
                      <div
                        className={styles.removeItemSvgContainer}
                        onClick={(e) =>
                          updateCartItems(
                            e,
                            singleItemDetails,
                            currentSize,
                            0,
                            itemIndex,
                            "remove"
                          )
                        }
                      >
                        <SvgWrapper svgSrc={"item-close"} />
                      </div>
                      <div className={styles.itemBrand}>
                        {singleItemDetails?.product?.brand?.name}
                      </div>
                      <div className={styles.itemName}>
                        {singleItemDetails?.product?.name}
                      </div>
                      <div className={styles.itemSellerName}>
                        Sold by: {singleItemDetails?.article?.seller?.name}
                      </div>
                      <div className={styles.itemSizeQuantityContainer}>
                        <div className={styles.itemSizeQuantitySubContainer}>
                          <div
                            className={styles.sizeContainer}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSizeModal(singleItem);
                            }}
                          >
                            <div className={styles.sizeName}>
                              Size: {currentSize}
                            </div>
                            <span className={styles.itemSvg}>
                              <SvgWrapper
                                svgSrc={"arrow-down"}
                                style={{ width: "20px", height: "24px" }}
                              />
                            </span>
                          </div>
                          <div
                            className={styles.quantityIncreaseDecreaseContainer}
                          >
                            <div
                              className={styles.decreaseCount}
                              onClick={(e) =>
                                updateCartItems(
                                  e,
                                  singleItemDetails,
                                  currentSize,
                                  -1,
                                  itemIndex,
                                  "update"
                                )
                              }
                            >
                              <div className={styles.svgContainer}>
                                <SvgWrapper svgSrc={"decrease"} />
                              </div>
                            </div>
                            <div className={styles.count}>
                              {singleItemDetails?.quantity || 0}
                            </div>
                            <div
                              className={styles.increaseCount}
                              onClick={(e) =>
                                updateCartItems(
                                  e,
                                  singleItemDetails,
                                  currentSize,
                                  1,
                                  itemIndex,
                                  "update"
                                )
                              }
                            >
                              <div className={styles.svgContainer}>
                                <SvgWrapper svgSrc={"increase"} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.itemPriceContainer}>
                        <div className={styles.itemPrice}>
                          <span className={styles.effectivePrice}>
                            {singleItemDetails?.price?.base?.currency_symbol}
                            {singleItemDetails?.price?.base?.effective}
                          </span>
                          <span className={styles.markedPrice}>
                            {singleItemDetails?.price?.base?.currency_symbol}
                            {singleItemDetails?.price?.base?.marked}
                          </span>
                          <span className={styles.discount}>
                            {singleItemDetails?.discount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        {breakUpValues?.display.length > 0 && (
          <div className={styles.cartItemPriceSummaryDetails}>
            <div className={styles.priceSummaryContainer}>
              <div className={styles.priceSummaryHeading}>
                PRICE SUMMARY ({cartItemCount} ITEMS)
              </div>
              <div className={styles.priceEffective}>
                <div>{breakUpValues?.display[0]?.display}</div>
                <div>
                  {breakUpValues?.display[0]?.currency_symbol}
                  {breakUpValues?.display[0]?.value}
                </div>
              </div>
              <div className={styles.priceEffective}>
                <div>{breakUpValues?.display[1]?.display}</div>
                <div style={{ color: "#4cbb17" }}>
                  {breakUpValues?.display[1]?.currency_symbol}
                  {breakUpValues?.display[1]?.value}
                </div>
              </div>
              <div className={styles.priceEffective}>
                <div>{breakUpValues?.display[2]?.display}</div>
                <div>
                  {breakUpValues?.display[2]?.currency_symbol}
                  {breakUpValues?.display[2]?.value}
                </div>
              </div>
              <div className={styles.totalPrice}>
                <div className={styles.totalPriceSubContainer}>
                  <div>{breakUpValues?.display[3]?.display}</div>
                  <div>
                    {breakUpValues?.display[3]?.currency_symbol}
                    {breakUpValues?.display[3]?.value}
                  </div>
                </div>
              </div>
              <div className={styles.discountPreviewContiner}>
                <span className={styles.svgContainer}>
                  <SvgWrapper svgSrc={"celebration"} />
                </span>
                <span className={styles.discountPreviewMessage}>
                  Yayy!!! You've saved
                </span>
                <span className={styles.discountPreviewAmount}>
                  {breakUpValues?.display[1]?.currency_symbol}
                  {Math.abs(breakUpValues?.display[1]?.value || 0)}
                </span>
              </div>
            </div>
            {!isloggedIn && <button className={styles.priceSummaryLoginButton}
            onClick={redirectToLogin}
            >LOGIN</button>}
            {!isloggedIn && (
              <button
                className={styles.priceSummaryGuestButton}
                onClick={gotoCheckout}
              >
                CONTINUE AS GUEST
              </button>
            )}
           {isloggedIn && <button
              className={styles.priceSummaryLoginButton}
              onClick={gotoCheckout}
            >
              checkout
            </button>}
          </div>
        )}

        <div
          className={`${styles.sizeModalContainer} ${
            sizeModal && cartItems[sizeModal] !== null && styles.selected
          }`}
        >
          <div className={styles.modalContainer}>
            <div className={styles.sizeModalHeader}>
              <div className={styles.sizeModalDiv}>
                <div className={styles.sizeModalImage}>
                  <img
                    src={
                      sizeModalItemValue?.product?.images?.length > 0 ?
                      sizeModalItemValue?.product?.images[0]?.url:undefined
                    }
                  />
                </div>
                <div className={styles.sizeModalContent}>
                  <div>
                    <div className={styles.sizeModalBrand}>
                      {sizeModalItemValue?.product?.brand?.name}
                    </div>
                    <div className={styles.sizeModalName}>
                      {sizeModalItemValue?.product?.name}
                    </div>
                  </div>
                  <div className={styles.sizeDiscount}>
                    {sizeModalItemValue?.article?.price?.base?.currency_symbol}
                    {sizeModalItemValue?.article?.price?.base?.effective}
                  </div>
                </div>
              </div>
              <div
                className={styles.modalCloseIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setSizeModal(null);
                  setCurrentSizeModalSize(null);
                }}
              >
                <span>
                  <SvgWrapper svgSrc={"item-close"} />
                </span>
              </div>
            </div>
            <div className={styles.sizeModalBody}>
              <div className={styles.sizeSelectHeading}>Select Size</div>
              <div className={styles.sizeHorizontalList}>
                {sizeModalItemValue?.availability?.available_sizes?.length >
                  0 &&
                  sizeModalItemValue?.availability?.available_sizes?.map(
                    (singleSize) => {
                      const isEarlierSelectedSize =
                        !currentSizeModalSize &&
                        sizeModal?.split("_")[1] === singleSize?.value;
                      const isCurrentSelectedSize =
                        currentSizeModalSize?.split("_")[1] ===
                        singleSize?.value;
                      return (
                        <div
                          key={singleSize?.display}
                          className={`${styles.singleSize}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className={`${styles.singleSizeDetails} ${
                              (isEarlierSelectedSize ||
                                isCurrentSelectedSize) &&
                              styles.singleSizeSelected
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (singleSize?.value && !isEarlierSelectedSize) {
                                const newSizeModalValue =
                                  sizeModal?.split("_")[0] +
                                  "_" +
                                  singleSize?.value;
                                setCurrentSizeModalSize(newSizeModalValue);
                              }
                            }}
                          >
                            {singleSize?.display}
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
            <div
              className={styles.sizeModalFooter}
              onClick={(e) => {
                let itemIndex;
                for (let j = 0; j < cartItemsWithActualIndex.length; j += 1) {
                  if (cartItemsWithActualIndex[j]?.key === sizeModal) {
                    itemIndex = j;
                    break;
                  }
                }
                updateCartItems(
                  e,
                  sizeModalItemValue,
                  currentSizeModalSize
                    ? currentSizeModalSize.split("_")[1]
                    : sizeModal?.split("_")[1],
                  cartItems[sizeModal]?.quantity,
                  itemIndex,
                  "update"
                );
                setCurrentSizeModalSize(null);
                setSizeModal(null);
              }}
            >
              <div className={styles.updateSizeButton}>UPDATE</div>
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Loader />}
    </>
  );
};

export default Cart;
