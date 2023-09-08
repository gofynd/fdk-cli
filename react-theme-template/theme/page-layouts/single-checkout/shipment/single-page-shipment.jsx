import React from "react";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import { useSingleContext } from "../single-page-context";
import styles from "./single-page-shipment.less";
import SingleShipmentContent from "./single-shipment-content";
import { useNavigate,useSearchParams } from "react-router-dom";

function SinglePageShipment() {

  const context = useSingleContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");

  const getShipmentCount = (() => {
    if (context?.shipments.shipments) {
      return context.shipments?.shipments?.length;
    } else {
      return 0;
    }
  })();
  const editShipment = () => {
    context.setshowPayment(false);
    context.setshowShipment(true);
  };
  const proceedToPay = async () => {
    await context.fpi.payment.fetchPaymentOptions({
      amount:context.shipments.breakup_values?.raw?.total * 100 ,
      cartId: cart_id,
      pincode: "395008",
      checkoutMode: 'self',
    });
    context.setshowShipment(false);
    context.setshowPayment(true);
  };
  const gotoCart = () => {
    navigate("/cart");
  };
  return (
    <>
      {context.showShipment ? (
        <>
          <div className={styles.reviewHeaderSelect}>
            <div className={styles.left}>
              <div>
                <SvgWrapper svgSrc={"two-number"}></SvgWrapper>
              </div>
              <div className={styles.headerContainer}>
                <div className={styles.orderSummary}>Order Summary</div>
                <div className={styles.shipment}>
                  {getShipmentCount > 1
                    ? getShipmentCount + " shipments"
                    : getShipmentCount + " shipment"}
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.editCart} onClick={gotoCart}>
                Edit Cart
              </div>
              <div className={styles.proceedPay} onClick={proceedToPay}>
                Proceed To Pay
              </div>
            </div>
          </div>
          <SingleShipmentContent></SingleShipmentContent>
        </>
      ) : (
        <>
          {context.showPayment ? (
            <div className={styles.addressSelectedHeaderContainer}>
              <div className={styles.leftSelected}>
                <div className={styles.icon}>
                  <SvgWrapper svgSrc="checkmark"></SvgWrapper>
                </div>
                <div className={styles.deliverAdd}>
                  <div className={styles.title}>Order Summary</div>
                  <div className={styles.address}>
                    {getShipmentCount > 1
                      ? getShipmentCount + " shipments"
                      : getShipmentCount + " shipment"}
                  </div>
                </div>
              </div>
              <div className={styles.rightSelected} onClick={editShipment}>
                Edit
              </div>
            </div>
          ) : (
            <div className={styles.reviewHeaderUnselect}>
              <SvgWrapper svgSrc={"two-number"}></SvgWrapper>
              <div className={styles.heading}>Order Summary</div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default SinglePageShipment;
