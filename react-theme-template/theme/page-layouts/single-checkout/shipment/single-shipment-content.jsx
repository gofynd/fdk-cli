import React from "react";

import { numberWithCommas } from "../../../helper/utils";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import { useSingleContext } from "../single-page-context";
import styles from "./single-shipment-content.less";
import { FDKLink } from "fdk-core/components";
import { useSearchParams } from "react-router-dom";
import Loader from "../../../components/loader/loader";

function SingleShipmentContent() {
  const { shipments, setshowShipment, setshowPayment, fpi } =
    useSingleContext();
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");

  const getShipmentItems = (shipment) => {
    let grpBySameSellerAndProduct = shipment.items.reduce((result, item) => {
      result[
        "" + item.article.seller.uid + item.article.store.uid + item.product.uid
      ] = (
        result[
          "" +
            item.article.seller.uid +
            item.article.store.uid +
            item.product.uid
        ] || []
      ).concat(item);
      return result;
    }, []);

    let updateArr = [];
    for (let key in grpBySameSellerAndProduct) {
      updateArr.push({
        item: grpBySameSellerAndProduct[key][0],
        articles: grpBySameSellerAndProduct[key],
      });
    }
    return updateArr;
  };
  const getProductImage = (product) => {
    if (product?.product?.images?.[0]?.url) {
      return product.product.images[0].url.replace("original", "resize-w:110");
    }
  };
  const getProductPath = (product) => {
    return "/product/" + product.product.slug;
  };
  const getCurrencySymbol = () => {
    return (
      shipments?.shipments?.[0]?.items?.[0]?.price?.converted
        ?.currency_symbol || "₹"
    );
  };

  const getMarkedPrice = (articles) => {
    let markedSum = articles.reduce((sum, artcl) => {
      sum += artcl.price.converted.marked;
      return sum;
    }, 0);
    let effective = articles.reduce((sum, artcl) => {
      sum += artcl.price.converted.effective;
      return sum;
    }, 0);
    return markedSum != effective ? numberWithCommas(markedSum) : null;
  };

  const getEffectivePrice = (articles) => {
    return numberWithCommas(
      articles.reduce((sum, artcl) => {
        sum += artcl.price.converted.effective;
        return sum;
      }, 0)
    );
  };
  const proceedToPay = async () => {
    await fpi.payment.fetchPaymentOptions({
      amount: shipments.breakup_values?.raw?.total * 100,
      cartId: cart_id,
      pincode: "395008",
      checkoutMode: "self",
    });
    setshowShipment(false);
    setshowPayment(true);
  };
  return (
    <>
      {shipments.loading ? (
        <Loader></Loader>
      ) : (
        <div className={styles.parent}>
          {shipments?.shipments?.length &&
            shipments.shipments.map((item, index) => (
              <React.Fragment key={index+2000}>
                <div className={styles.reviewContentContainer}>
                  <div className={styles.shipmentWrapper}>
                    <div className={styles.shipmentHeading}>
                      <div className={styles.headerLeft}>
                        <div className={styles.shipmentNumber}>
                          Shipment {index + 1}/{shipments.shipments.length}
                        </div>
                        <div className={styles.itemCount}>
                          ({item.items.length}{" "}
                          {item.items.length === 1 ? "Item" : "Items"})
                        </div>
                      </div>
                      <div className={styles.deliveryDateWrapper}>
                        <div className={styles.shippingLogo}>
                          <SvgWrapper svgSrc={"shipping-logo"}></SvgWrapper>
                        </div>
                        {item.promise && (
                          <div className={styles.deliveryDate}>
                            Delivery by {item.promise.formatted.max}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.item}>
                      {getShipmentItems(item).map((product, index) => (
                        <div className={styles.itemWrapper} key={product.item.product.name}>
                          {product.item.coupon_message.length > 0 && (
                            <div className={styles.couponRibbon}>
                              <SvgWrapper
                                svgSrc={"applied-coupon-small"}
                              ></SvgWrapper>
                              <span className={styles.ribbonMsg}>
                                {product.item.coupon_message}
                              </span>
                            </div>
                          )}
                          <div className={styles.leftImg}>
                            <FDKLink to={getProductPath(product.item)}>
                              <img
                                src={getProductImage(product.item)}
                                alt={product.item.product.name}
                              />
                            </FDKLink>
                          </div>
                          <div className={styles.rightDetails}>
                            <div className={styles.productDetails}>
                              <div>
                                <div className={styles.brandName}>
                                  {product.item.product.brand.name}
                                </div>
                                <div className={styles.productName}>
                                  {product.item.product.name}
                                </div>
                              </div>
                              <div className={styles.sizeInfo}>
                                {product.articles.map((article, index) => (
                                  <div
                                    className={styles.sizeQuantity}
                                    key={article.article.size + index}
                                  >
                                    <div className={styles.size}>
                                      Size: {article.article.size}
                                    </div>
                                    <div className={styles.qty}>
                                      Qty: {article.quantity}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className={styles.paymentInfo}>
                              <div className={styles.priceWrapper}>
                                <div className={styles.effectivePrice}>
                                  {getCurrencySymbol() +
                                    getEffectivePrice(product.articles)}
                                </div>
                                {!product.item.is_set &&
                                  getMarkedPrice(product.articles) !== null && (
                                    <div className={styles.markedPrice}>
                                      {getCurrencySymbol() +
                                        getMarkedPrice(product.articles)}
                                    </div>
                                  )}
                                <div className={styles.discount}>
                                  {product.articles[0].discount}
                                </div>
                              </div>
                              <div className={styles.offersWarning}>
                                {product.item.article.quantity < 11 && (
                                  <div className={styles.limitedQnty}>
                                    Hurry! Only {product.item.article.quantity}{" "}
                                    Left
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          <div className={styles.proceedBtnWrapper}>
            <button className={styles.proceedBtn} onClick={proceedToPay}>
              {"Proceed To Pay >"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SingleShipmentContent;

// className=("[a-z-]+")
// className={styles[$1]}
