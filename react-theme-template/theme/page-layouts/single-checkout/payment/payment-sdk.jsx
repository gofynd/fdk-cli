import React, { useEffect, useRef } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useSingleContext } from "../single-page-context";
const PaymentSDK = ({ sdks, setsdkLoaded }) => {
  
  const counter = useRef(0);
  const parentElm = useRef(null);
  const { fpi } = useSingleContext();
  const payment_config = useGlobalStore(fpi.getters.AGGREGATORS_CONFIG);

  useEffect(() => {
    appendScripts();
  }, []);

  const appendScripts = () => {
    const totalScripts = loadScripts();
    for (let i = 0; i < totalScripts.length; i++) {
      const script = document.createElement("script");
      script.src = totalScripts[i].src;
      script.onload = function () {
        counter.current++;
        if (counter.current === totalScripts.length) {
          // emit all scripts loaded
          // handleEvent can be a prop passed from the parent component
          handleEvent("sdks-loaded", true);
        }
      };
      script.onerror = function () {
        counter.current++;
        if (counter.current === totalScripts.length) {
          // emit all scripts loaded
          handleEvent("sdks-loaded", true);
        }
      };
      for (let key in totalScripts[i].attrs) {
        script.setAttribute(key, totalScripts[i].attrs[key]);
      }
      parentElm.current.appendChild(script);
    }

    if (totalScripts.length === 0) {
      handleEvent("sdks-loaded", true);
    }
  };

  const loadScripts = () => {
    const PAYMENT_AGGREGATOR_SDK = {
      Razorpay: [
        {
          src: "https://checkout.razorpay.com/v1/razorpay.js",
        },
      ],
      Potlee: [
        {
          src: "https://cdn.pixelbin.io/v2/potlee/original/public/sdk/potlee.js",
        },
      ],
      Simpl: [
        {
          src: "https://cdn.getsimpl.com/simpl-custom-v1.min.js",
          attrs: {
            id: "getsimpl",
            "data-env":
              payment_config.env === "live" ? "production" : "sandbox",
            "data-merchant-id": payment_config.simpl?.key,
          },
        },
      ],
      Stripe: [
        {
          src: "https://js.stripe.com/v3/",
        },
      ],
      Juspay: [],
    };

    let arrScripts = [];
    for (let key in sdks) {
      if (sdks[key].loadSdk) {
        const scripts = PAYMENT_AGGREGATOR_SDK[key];
        if (scripts) {
          arrScripts = arrScripts.concat(scripts);
        }
      }
    }

    return arrScripts;
  };

  const handleEvent = (eventName, eventData) => {
    // Handle the event in your parent component or wherever needed
    setsdkLoaded(eventData)

  };

  return (
    <div ref={parentElm}>
      {/* You can add any other necessary components or elements here */}
    </div>
  );
};

export default PaymentSDK;
