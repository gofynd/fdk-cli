import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../components/loader/loader";
import SvgWrapper from "../components/svgWrapper/SvgWrapper";

import { useLoggedInUser } from "../helper/hooks";
import { convertDate } from "../helper/utils";

import styles from "../styles/order-status.less";
import empty from ".././assets/images/empty_state.png";

const orderFailurePageInfo = {
  link: "",
  linktext: "RETRY",
  text: "Oops! Your payment failed!",
  subText: "You can retry checkout or take another option for payment.",
  icon: empty,
};

function OrderStatus({ fpi }) {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("order_id");
  const [orderData, setorderData] = useState({});
  const navigate = useNavigate();

  const { loggedIn: isloggedIn } = useLoggedInUser(fpi);
  useEffect(() => {
    success == "true" &&
      fpi.order
        .getOrderById({ orderId })
        .then((res) => {
          setorderData(res.payload.order)
          // fpi.cart.getCartItemsCount();
        });
  }, []);

  function getOrderLink() {
    if (isloggedIn) {
      return "/profile/orders/";
    }
    return "/order-tracking/" + orderId;
  }
  function onOrderFailure() {
    navigate("/cart");
  }
  return success === "true" ? (
    <div className={styles.orders}>
      {orderData?.order_id ? (
        <div className={styles.orderStatus}>
          <div>
            {" "}
            <SvgWrapper svgSrc="true-check" />{" "}
          </div>
          <div className={styles.orderConfirmed}>ORDER CONFIRMED</div>
          <div className={styles.successMsg}>
            Thank you for shopping with us! Your order is placed successfully
          </div>
          <div className={styles.orderId}>
            ORDER ID: <span>{orderData.order_id}</span>
          </div>
          <div className={styles.orderTime}>
            Placed on:
            <span> {convertDate(orderData.order_created_time)}</span>
          </div>
          <div className={styles.trackOrderBtn}>
            <a href={getOrderLink()}>
              <button>TRACK ORDER</button>
            </a>
          </div>
        </div>
      ) : (
        <Loader></Loader>
      )}
    </div>
  ) : (
    <div>
      <div className={styles.orderFail}>
        <img src={orderFailurePageInfo.icon} alt={orderFailurePageInfo.icon} />
        <div className={styles.cartErrorText}>
          <span>{orderFailurePageInfo.text}</span>
          <span className={styles.subtext}>{orderFailurePageInfo.subText}</span>
          <button
            className={`${styles.commonBtn} ${styles.linkBtn} ${styles.boldSm}`}
            onClick={onOrderFailure}
          >
            {orderFailurePageInfo.linktext}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
