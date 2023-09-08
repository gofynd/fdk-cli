import React from "react";
import styles from "./right-side-breakup.less";
import { useGlobalStore } from "fdk-core/utils";
import { numberWithCommas } from "../../helper/utils";
import { useSingleContext } from "./single-page-context";
import Loader from "../../components/loader/loader";
import SvgWrapper from "../../components/svgWrapper/SvgWrapper";

function RightSideBreakup() {
  const { fpi } = useSingleContext();
  const { user_cart_items_count: cartItemsCount } = useGlobalStore(fpi?.getters?.CART_ITEMS_COUNT) || {};
  const bagdata = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const breakup = bagdata?.breakup_values?.display ?? [];
  const isLoading = bagdata?.loading ?? false;

  let totalVal = breakup.filter((item) => item.key == "total");
  let restVal = breakup.filter(
    (item) => item.key !== "total" && item.value !== 0
  );
  const breakupValues = [...restVal, ...totalVal];

  const getItemValue = (num) => {
    return numberWithCommas(num);
  };
  const getTotalDiscount = (() => {
    let mrp = 0;
    let total = 0;
    breakup.forEach((element) => {
      if (element.key === "mrp_total") {
        mrp = element.value;
      }
      if (element.key === "total") {
        total = element.value;
      }
    });
    return mrp - total;
  })();
  
  function getTotalDiscountWithComma() {
    return numberWithCommas(getTotalDiscount);
  }

  const currencySymbol = bagdata?.currency?.symbol || "₹";

  if (isLoading) {
    return <Loader />
  }
  return (
    <div
      id="price-breakup-container-id"
      className={styles.priceBreakupContainer}
    >
      <div className={styles.priceSummaryTxt}>
        PRICE SUMMARY {cartItemsCount} {cartItemsCount > 1 ? "ITEMS" : "ITEM"}
      </div>
      {breakupValues.map((item, index) => (
        <div key={`break_${index}`}>
          {index !== breakup.length - 1 ? (
            <div className={styles.priceSummaryTxt2}>
              <div>{item.display}</div>
              <div className={Number(item.value) < 0 ? styles.discount : ""}>
                {currencySymbol + getItemValue(item.value)}
              </div>
            </div>
          ) : (
            <div className={styles.totalPrice}>
              <div className={styles.totalPriceBox}>
                <div>{item.display}</div>
                <div>{currencySymbol + getItemValue(item.value)}</div>
              </div>
            </div>
          )}
        </div>
      ))}
      {
        getTotalDiscount > 0 && (
        <div className={styles.totalDiscountContainer}>
           <SvgWrapper svgSrc={"celebration"} />
          <span className={styles.yayy}>Yayy!!! You've saved</span>
          <span className={styles.yayyTotal}>
            {currencySymbol + getTotalDiscountWithComma()}
          </span>
        </div>
      )
      }
    </div>
  );
}

export default RightSideBreakup;
