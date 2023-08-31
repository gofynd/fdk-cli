import React from "react";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import { useSingleContext } from "../single-page-context";
import CheckouPaymentContent from "./checkout-payment-content";
import styles from "./checkout-payment.less";

function CheckoutPayment() {
  const { showPayment } = useSingleContext();
  return (
    <div className={styles.paymentContainer}>
      {showPayment ? (
        <>
          <div className={styles.paymentHeaderSelect}>
            <div className={styles.icon}>
              <SvgWrapper svgSrc={"three-number"}></SvgWrapper>
            </div>
            <div className={styles.content}>
              <div className={styles.head}>Payment Method</div>
              <div className={styles.desc}>Select a payment method</div>
            </div>
          </div>
          <CheckouPaymentContent></CheckouPaymentContent>
        </>
      ) : (
        <div className={styles.reviewHeaderUnselect}>
          <SvgWrapper svgSrc={"three-number"}></SvgWrapper>
          <div className={styles.heading}>Payment Method</div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPayment;
