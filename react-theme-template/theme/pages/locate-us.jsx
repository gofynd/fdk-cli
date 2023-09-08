import React, { useEffect, useState } from "react";
import SinglePageContextProvider from "../page-layouts/single-checkout/single-page-context";
import SinglePageShipment from "../page-layouts/single-checkout/shipment/single-page-shipment";
import { useGlobalStore } from "fdk-core/utils";

import Singleaddress from "../page-layouts/single-checkout/address/single-address";
import styles from "../styles/single-checkout-page.less";
import CheckoutPayment from "../page-layouts/single-checkout/payment/checkout-payment";
import RightSideBreakup from "../page-layouts/single-checkout/right-side-breakup";

function Singlecheckoutpage({ fpi }) {
  const bagdata = useGlobalStore(fpi?.getters?.CART_ITEMS);
  useEffect(() => {
    // fpi.address.updateAddress({
    //   body: {
    //     is_default_address: false,
    //     name: "08460403963",
    //     phone: "8460403963",
    //     address: "B-305 Nijanand palace, near syani heights, A.k road",
    //     area: "Khatimwadi, Naupada Village, Bandra East, ",
    //     city: "Surat",
    //     landmark: "Khar Markaz Masjid, ",
    //     area_code: "395008",
    //     country: "India",
    //     state: "Gujarat",
    //     address_type: "home",
    //     geo_location: {
    //       latitude: 21.2087961,
    //       longitude: 72.83315259999999,
    //     },
    //   },
    // });
    fpi.address.getAddress();

    fpi.payment.fetchAggregatorsConfig();
    if (!bagdata?.id) {
      fpi?.cart?.getCartItems({ b: true, i: true });
    }
  }, []);

  return (
    <SinglePageContextProvider fpi={fpi}>
      <div className={styles.mainContainer}>
        <div className={styles.leftContainer}>
          <Singleaddress></Singleaddress>
          <SinglePageShipment></SinglePageShipment>
          <CheckoutPayment></CheckoutPayment>
        </div>
        <div className={styles.rightContainer}>
          <RightSideBreakup></RightSideBreakup>
        </div>
      </div>
    </SinglePageContextProvider>
  );
}

export default Singlecheckoutpage;
