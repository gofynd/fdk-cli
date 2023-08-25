import React, { useContext, useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import Modal from "./modal";
import CheckoutAddressForm from "./checkout-address-form";
const SinglePageContext = React.createContext();
export function useSingleContext() {
  return useContext(SinglePageContext);
}

function SinglePageContextProvider({ children, fpi }) {
  const shipments = useGlobalStore(fpi.getters.SHIPMENTS);
  const [showShipment, setshowShipment] = useState(false);
  const [showPayment, setshowPayment] = useState(false);
  const [isopenmodal, setisopenmodal] = useState(false);
  const [isNewAddr, setiisNewAddr] = useState(true);
  const [addressitem, setaddressitem] = useState(false);
  const [modaltitle, setmodaltitle] = useState("");

  const resetAddressState = () => {
    setisopenmodal(false);
    setiisNewAddr(true);
    setaddressitem(false);
    setmodaltitle("");
  };
  const value = {
    showShipment,
    setshowShipment,
    fpi,
    shipments,
    isopenmodal,
    setisopenmodal,
    setmodaltitle,
    setaddressitem,
    setiisNewAddr,
    resetAddressState,
    showPayment,
    setshowPayment,
  };
  return (
    <SinglePageContext.Provider value={value}>
      {children}
      <Modal
        title={modaltitle}
        isOpen={isopenmodal}
        onCloseDialog={() => {
          resetAddressState();
          setisopenmodal(false);
        }}
      >
        <CheckoutAddressForm
          isNewAddr={isNewAddr}
          addressitem={addressitem}
        ></CheckoutAddressForm>
      </Modal>
    </SinglePageContext.Provider>
  );
}

export default SinglePageContextProvider;
