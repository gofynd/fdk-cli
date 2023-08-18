import React from "react";
import { useSingleContext } from "../single-page-context";
import SingleAddressContent from "./single-address-content";
import SinglesAddressHeader from "./single-address-header";
import styles from "./single-address-header.less";
import useSingleAddress from "./useSingleAddress";

// import useSingleAddress from "../../../customHooks/useSingleAddress";

function Singleaddress() {
  const context = useSingleContext();
  const { allAddress,addressLoading } = useSingleAddress();
  return (
    <div className={styles.addressContainerLeft}>
      <SinglesAddressHeader allAddress={allAddress}></SinglesAddressHeader>
      {context.showShipment ||context.showPayment  ? null : (
        <SingleAddressContent allAddress={allAddress} addressLoading={addressLoading}></SingleAddressContent>
      )}
    </div>
  );
}

export default Singleaddress;
