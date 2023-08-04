import React, { useEffect } from "react";

import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import { useSingleContext } from "../single-page-context";
import styles from "./single-address-header.less";

import { useNavigate, useSearchParams } from "react-router-dom";

function SinglesAddressHeader({ allAddress }) {
  const context = useSingleContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedAddId = searchParams.get("address_id");

  const RemoveQuery = (key) => {
    const queryParamKeyToRemove = key; // Replace with the query parameter key to remove

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(queryParamKeyToRemove);

    const updatedSearch = searchParams.toString();

    navigate({ search: updatedSearch });
  };
  const editAddress = () => {
    RemoveQuery("address_id");
    context.setshowShipment(false);
    context.setshowPayment(false)
  };
  const addNewAddress = () => {
    context.setmodaltitle("Add New Address");
    context.setisopenmodal(true);
  };
  const selectedAddress = (() => {
    if (allAddress?.length) {
      const add = allAddress?.find((item) => item.id == selectedAddId);
      return add;
    }
  })();
  return (
    <>
      {context.showShipment || context.showPayment ? (
        <>
          <div className={styles.addressSelectedHeaderContainer}>
            <div className={styles.leftSelected}>
              <div className={styles.icon}>
                <SvgWrapper svgSrc="checkmark"></SvgWrapper>
              </div>
              <div className={styles.deliverAdd}>
                <div className={styles.title}>Delivery Address</div>
                <div className={styles.address}>{selectedAddress?.address}</div>
              </div>
            </div>
            <div className={styles.rightSelected} onClick={editAddress}>
              Edit
            </div>
          </div>
        </>
      ) : (
        <div className={styles.addressHeaderContainer}>
          <div className={styles.wrapper}>
            <SvgWrapper svgSrc="one-number"></SvgWrapper>
            <div className={styles.headerWrapper}>
              <div className={styles.addressHeading}>Delivery Address</div>
              <div className={styles.addressString}>
                Select delivery address 
              </div>
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <button
              className={`${styles.commonBtn} ${styles.addBtn}`}
              onClick={addNewAddress}
            >
              + &nbsp; Add New Address
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SinglesAddressHeader;

// className=("[a-z-]+")
// className={styles[$1]}
