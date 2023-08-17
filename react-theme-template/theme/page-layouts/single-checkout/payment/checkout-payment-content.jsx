import React, { useEffect, useRef, useState } from "react";
import styles from "./checkout-payment-content.less";
import PaymentSDK from "./payment-sdk";
import { useGlobalStore } from "fdk-core/utils";
import { useSingleContext } from "../single-page-context";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";
import { useSearchParams } from "react-router-dom";
import Loader from "../../../components/loader/loader";
const isLoggedIn = true;
import IMask from "imask";
import cardValidator from "card-validator";
import { numberWithCommas } from "../../../helper/utils";

export const CREDIT_CARD_MASK = [
  {
    mask: "0000 000000 00000",
    cardtype: "american-express",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "discover",
  },
  {
    mask: "0000 000000 0000",
    cardtype: "diners-club",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "mastercard",
  },

  {
    mask: "0000 000000 00000",
    cardtype: "jcb15",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "jcb",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "maestro",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "visa",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "unionpay",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "rupay",
  },
  {
    mask: "0000 0000 0000 0000",
    cardtype: "Unknown",
  },
];

var cardnumber_mask;
var expirationdate_mask;
var name;
var numberValidation;

function CheckoutPaymentContent() {
  const { fpi } = useSingleContext();
  const paymentOption = useGlobalStore(fpi?.getters?.PAYMENT_OPTIONS);
  const bagdata = useGlobalStore(fpi?.getters?.CART_ITEMS);
  const [sdkLoaded, setsdkLoaded] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");

  //card
  const [addNewCard, setAddNewCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardCVV, setSelectedCardCVV] = useState("");
  const [cvvNumber, setCvvNumber] = useState("");
  const [showError, setShowError] = useState(false);
  const [cardNumberError, setcardNumberError] = useState(false);
  const [cardExpiryError, setcardExpiryError] = useState(false);
  const [cardCVVError, setcardCVVError] = useState(false);
  const [cardNameError, setcardNameError] = useState(false);
  const [isCardSecure, setisCardSecure] = useState(true);
  const [isSavedCardSecure, setisSavedCardSecure] = useState(null);
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const address_id = searchParams.get("address_id");
  const nameRef = useRef(null);
  const cardNumberRef = useRef(null);
  const expirationDateRef = useRef(null);

  //wallet

  const [selectedWallet, setselectedWallet] = useState({});

  //upi

  const [vpa, setvpa] = useState("");

  //nb
  const [selectedNB, setselectedNB] = useState({});
  const [selectedOtherNB, setselectedOtherNB] = useState({});

  //paylater
  const [selectedPayLater, setselectedPayLater] = useState({});

  //cardless

  const [selectedCardless, setselectedCardless] = useState({});
  const initiateMask = () => {
    name = nameRef.current;
    // Mask the Credit Card Number Input
    cardnumber_mask = new IMask(cardNumberRef.current, {
      mask: CREDIT_CARD_MASK,
      dispatch: function (appended, dynamicMasked) {
        for (let i = 0; i < dynamicMasked.compiledMasks.length; i++) {
          let re = dynamicMasked.compiledMasks[i].cardtype;
          if (
            numberValidation?.card?.type &&
            numberValidation?.card?.type === re &&
            dynamicMasked?.unmaskedValue
          ) {
            return dynamicMasked.compiledMasks[i];
          } else {
            return dynamicMasked.compiledMasks[
              dynamicMasked.compiledMasks.length - 1
            ];
          }
        }
      },
    });

    // Mask the Expiration Date
    expirationdate_mask = new IMask(expirationDateRef.current, {
      mask: "MM{/}YY",
      blocks: {
        YY: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 99,
        },
        MM: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
        },
      },
    });

    cardnumber_mask.on("accept", () => {
      numberValidation = cardValidator?.number(cardnumber_mask.value);
    });

    expirationdate_mask.on("accept", () => {});
  };

  const getTrimmedCardNumber = (number) => {
    // Implement the logic to trim the card number
    return number?.substring(number.length - 4);
  };

  const getCardBorder = (card) => {
    // Implement the logic to determine the card border class

    if (selectedCard?.card_id === card?.card_id) {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  };

  const handleSavedCardState = (e) => {
    // Implement the logic to handle the saved card state
    setsetisSavedCardSecure(e.target.checked);
  };

  const addNewCardShow = () => {
    setAddNewCard(true);
    initiateMask();
  };
  const selectedTabData = paymentOption.payment_options.payment_option.find(
    (optn) => optn.name == selectedTab
  );
  const getCurrencySymbol = (() => {
    return bagdata?.currency?.symbol || "₹";
  })();

  const hideNewCard = () => {
    setAddNewCard(false);
  };

  const keypressCvv = (event) => {
    // Implement the logic to handle the CVV keypress event
    let re = /^[0-9]+$/;
    let cvv = re.test(event.key);
    if (!cvv) {
      event.preventDefault();
      return false;
    }
    return true;
  };

  const handleCardSaveState = () => {
    // Implement the logic to handle the card save state
    setisCardSecure((pre) => !pre);
  };
  const isPayByCardCvv = () => {
    if (!cvvNumber) {
      setcardCVVError("Enter CVV");
      setShowError(true);
      return false;
    } else if (cvvNumber.toString().length > 4) {
      setcardCVVError("Invalid CVV");
      setShowError(true);
      return false;
    }
    return true;
  };

  const checkEmpty = () => {
    let bEmpty = false;
    if (!cardnumber_mask.value) {
      setcardNumberError("This field is required");
      bEmpty = true;
    }
    if (!expirationdate_mask.value) {
      setcardExpiryError("This field is required");
      bEmpty = true;
    }
    if (!name.value) {
      setcardNameError("This field is required");
      bEmpty = true;
    }
    return bEmpty;
  };
  const checkExpiry = () => {
    var d = new Date();
    var currentYear = d.getFullYear();
    var currentMonth = d.getMonth() + 1;

    //get expiry y, m entered
    var expYear = parseInt(expirationdate_mask.value.split("/")[1], 10) + 2000;
    var expMonth = parseInt(expirationdate_mask.value.split("/")[0], 10);

    if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      //card has expired
      setcardExpiryError("The expiry date has passed");
      return true;
    } else {
      //continue
      setcardExpiryError("");
      return false;
    }
  };
  const isValidCardDetails = () => {
    let bIsEmpty = checkEmpty();
    if (!bIsEmpty) {
      if (numberValidation?.card === null || !numberValidation?.card) {
        setcardNumberError("Card number is invalid");
        return false;
      }
      //Only if card number is proper and expiry date is proper
      if (expirationdate_mask.masked.isComplete) {
        return !checkExpiry();
      } else {
        setcardExpiryError("Expiry time is invalid");
      }
      return false;
    }
    return false;
  };

  const isCardDetailsValid = () => {
    //reset error
    setcardNumberError("");
    setcardNameError("");
    setcardExpiryError("");
    setcardCVVError("");

    const isValidCvv = isPayByCardCvv();
    const isValidCard = isValidCardDetails();
    return isValidCvv && isValidCard;
  };
  const getCardDetails = () => {
    const name = nameRef.current;
    let obj = {
      cvv: cvvNumber,
      card_number: cardnumber_mask.value.replace(/\s/g, ""),
      name: name.value,
      exp_month: expirationdate_mask.value.split("/")[0],
      exp_year: expirationdate_mask.value.split("/")[1],
    };
    return obj;
  };

  const selectedNewCardData = paymentOption.payment_options.payment_option.find(
    (optn) => optn.name == "CARD"
  );

  function addParamsToLocation(params) {
    // Get the current URL
    var currentUrl = window.location.href;
    // Remove the query parameters
    var urlWithoutQueryParams = currentUrl.split("?")[0];
    history.pushState(
      {},
      null,
      urlWithoutQueryParams +
        "?" +
        Object.keys(params)
          .map((key) => {
            return (
              encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
            );
          })
          .join("&")
    );
  }
  function getQueryParams() {
    const queryParams = {};

    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }

    return queryParams;
  }
  const selectedUPIData = paymentOption.payment_options.payment_option.filter(
    (optn) => optn.name == "UPI"
  )[0]?.list[0];
  const proceedToPay = (mode, codData) => {
    // Implement the logic to proceed with the payment
    if (mode == "newCARD") {
 
      let valid = isCardDetailsValid();
      let cardObj;
      if (!valid) {
        return;
      } else {
        cardObj = getCardDetails();
      }
      // if (!isCardSecure) {
      //     openRbiGuidelineDialog = true;
      //     return;
      // }

      let payload = {
        aggregator_name: selectedNewCardData.aggregator_name,
        payment_mode: "CARD",
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true);
      let confirmedPayment = fpi.payment.confirmPayment(payload);

      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedNewCardData.aggregator_name,
        payment_mode: "CARD",
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          queryParams: getQueryParams(),
          payment: {
            ...selectedNewCardData,
            ...cardObj,
            is_card_secure: isCardSecure,
          },
          address_id: address_id,
          billing_address_id: address_id,
          paymentflow:
            paymentOption.payment_options.payment_flows[
              selectedNewCardData.aggregator_name
            ],
        })
        .then((res) => {

        });
    } else if (mode == "CARD") {
      if (
        !selectedCard.compliant_with_tokenisation_guidelines &&
        !isSavedCardSecure
      ) {
        // openRbiGuidelineDialog = true;
        // return;
      }

      let payload = {
        aggregator_name: selectedCard.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCard.card_id,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true);
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedCard.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCard.card_id,
        card_reference: selectedCard.card_reference,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: {
          ...selectedCard,
          card_security_code: selectedCardCVV,
          is_card_secure: selectedCard.compliant_with_tokenisation_guidelines
            ? true
            : isSavedCardSecure,
        },
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[
            selectedCard.aggregator_name
          ],
      });
    } else if (mode == "WL") {
      let payload = {
        aggregator_name: selectedWallet.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedWallet.code,
        merchant_code: selectedWallet.merchant_code,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedWallet.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedWallet.code,
        merchant_code: selectedWallet.merchant_code,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          payment: selectedWallet,
          address_id: address_id,
          billing_address_id: address_id,
          paymentflow:
            paymentOption.payment_options.payment_flows[
              selectedWallet.aggregator_name
            ],
        })
        .then((res) => {});
    } else if (mode == "UPI") {
      let payload = {
        aggregator_name: selectedUPIData.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedUPIData.code,
        merchant_code: selectedUPIData.merchant_code,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedUPIData.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedUPIData.code,
        merchant_code: selectedUPIData.merchant_code,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: {
          ...selectedUPIData,
          upi: { vpa: vpa },
        },
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[
            selectedUPIData.aggregator_name
          ],
      });
    } else if (mode == "NB") {
      let payload = {
        aggregator_name:
          selectedNB == "otherNB"
            ? selectedOtherNB.aggregator_name
            : selectedNB.aggregator_name,
        payment_mode: mode,
        payment_identifier:
          selectedNB == "otherNB"
            ? selectedOtherNB.bank_code
            : selectedNB.bank_code,
        merchant_code:
          selectedNB == "otherNB"
            ? selectedOtherNB.merchant_code
            : selectedNB.merchant_code,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);

      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name:
          selectedNB == "otherNB"
            ? selectedOtherNB.aggregator_name
            : selectedNB.aggregator_name,
        payment_mode: mode,
        payment_identifier:
          selectedNB == "otherNB"
            ? selectedOtherNB.bank_code
            : selectedNB.bank_code,
        merchant_code:
          selectedNB == "otherNB"
            ? selectedOtherNB.merchant_code
            : selectedNB.merchant_code,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: selectedNB == "otherNB" ? selectedOtherNB : selectedNB,
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[options.aggregator_name],
      });
    } else if (mode == "COD") {
      let payload = {
        aggregator_name: codData.aggregator_name,
        payment_mode: mode,
        payment_identifier: "" + codData.payment_mode_id,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: codData.aggregator_name,
        payment_mode: mode,
        payment_identifier: codData.payment_mode_id,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: codData,
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[codData.aggregator_name],
      });
    } else if (mode == "PL") {
      let payload = {
        aggregator_name: selectedPayLater.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedPayLater.code,
        merchant_code: selectedPayLater.merchant_code,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedPayLater.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedPayLater.code,
        merchant_code: selectedPayLater.merchant_code,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: selectedPayLater,
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[
            selectedPayLater.aggregator_name
          ],
      });
    } else if (mode == "CARDLESS_EMI") {
      let payload = {
        aggregator_name: selectedCardless.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCardless.code,
        merchant_code: selectedCardless.merchant_code,
        id: cart_id,
        is_redirection: false,
      };
      setisLoading(true)
      let confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedCardless.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCardless.code,
        merchant_code: selectedCardless.merchant_code,
      });
      let { id, is_redirection, ...options } = payload;
      fpi.payment.checkoutPayment({
        ...options,
        payment: selectedCardless,
        address_id: address_id,
        billing_address_id: address_id,
        paymentflow:
          paymentOption.payment_options.payment_flows[
            selectedCardless.aggregator_name
          ],
      });
    }
  };

  const getTotalValue = () => {
    // Implement the logic to calculate the total value

    let totalObj = bagdata?.breakup_values?.display?.find(
      (item) => item.key == "total"
    );
    return numberWithCommas(totalObj?.value);
  };
  //

  const setNavigationTab = (name) => {
    setSelectedTab(name);
  };
  const PAYMENT_OPTIONS_SVG = {
    CARD: "card-payment",
    WL: "wallet",
    UPI: "upi",
    NB: "nb",
    CARDLESS_EMI: "emi",
    PL: "pay-later",
    COD: "cod",
  };

  const sdksToInitialize = () => {
    if (paymentOption && paymentOption?.payment_options?.payment_flows) {
      let flows = paymentOption && paymentOption.payment_options.payment_flows;
      let tempSdk = {};
      for (let flow in flows) {
        tempSdk[flow] = {
          loadSdk: true,
          paymentFlowMeta: flows[flow],
        };
      }
      return tempSdk;
    }
  };
  function orderBy(collection, iteratees, orders) {
    if (!Array.isArray(collection) || collection.length === 0) {
      return [];
    }
    return [...collection].sort((a, b) => {
      for (let i = 0; i < iteratees.length; i++) {
        const iteratee = iteratees[i];
        const order = orders && orders[i] === "desc" ? -1 : 1;

        const aValue =
          typeof iteratee === "function" ? iteratee(a) : a?.[iteratee];
        const bValue =
          typeof iteratee === "function" ? iteratee(b) : b?.[iteratee];

        if (aValue < bValue) {
          return -1 * order;
        }
        if (aValue > bValue) {
          return 1 * order;
        }
      }

      return 0;
    });
  }

  const options = () => {
    let tempOpt = [];
    let orderedOptions = orderBy(
      paymentOption.payment_options?.payment_option,
      "display_priority",
      "asc"
    );

    orderedOptions?.forEach((optn) => {
      let data = PAYMENT_OPTIONS_SVG[optn.name];
      if (data) {
        tempOpt.push({
          display_name: optn.display_name,
          svg: data,
          name: optn.name,
        });
      } else {
        tempOpt.push({
          display_name: optn.display_name,
          svg: "payment-other",
          name: optn.name,
        });
      }
    });

    return tempOpt;
  };
  function getWalletdBorder(wlt) {
    if (selectedWallet?.code === wlt?.code) {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  }

  function validateVPA() {
    let validPattern = /^.+@.+$/;
    return validPattern.test(vpa);
  }
  const topFiveBank = selectedTabData?.list?.slice(0, 5) ?? [];

  function getNBBorder(nb) {
    if (nb && selectedNB?.code === nb?.code) {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  }
  function getNBOtherBorder() {
    if (selectedNB == "otherNB") {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  }
  const restBanks = selectedTabData?.list?.slice(5) ?? [];

  function selectBank(item) {
    setselectedOtherNB(JSON.parse(item.target.value));
  }

  const getNormalisedList = (selectedTabData) => {
    let tabData = selectedTabData?.list;
    return tabData.reduce((acc, tab) => {
      if (tab.aggregator_name == "Potlee") {
        let temp = tab;
        temp.isDisabled = true;
        temp.id =
          tab.aggregator_name + tab.code + selectedTabData.payment_mode_id;
        acc.push(temp);
        return acc;
      } else if (tab.aggregator_name == "Simpl") {
        let temp = tab;
        temp.isDisabled = true;
        temp.id =
          tab.aggregator_name + tab.code + selectedTabData.payment_mode_id;
        acc.push(temp);
        return acc;
      } else if (tab.aggregator_name == "Rupifi") {
        let temp = tab;
        temp.isDisabled = true;
        temp.id =
          tab.aggregator_name + tab.code + selectedTabData.payment_mode_id;
        acc.push(temp);
        return acc;
      } else {
        acc.push(tab);
        return acc;
      }
    }, []);
  };

  function getPayLaterBorder(payLater) {
    if (selectedPayLater?.code === payLater?.code) {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  }
  function getCardlessBorder(emi) {
    if (selectedCardless?.code === emi?.code) {
      return `${styles.selectedBorder}`;
    }
    return `${styles.nonSelectedBorder}`;
  }
  useEffect(() => {
    let option = options();
    if (option?.length) setSelectedTab(option[0].name);
  }, []);
  return (
    <>
      <PaymentSDK
        sdks={sdksToInitialize()}
        setsdkLoaded={setsdkLoaded}
      ></PaymentSDK>
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <div className={styles.container}>
          {paymentOption.success && sdkLoaded ? (
            <>
              <div className={styles.navigationLink}>
                {options().map((opt, index) => (
                  <div
                    className={styles.linkWrapper}
                    key={opt.display_name}
                    onClick={() => setNavigationTab(opt.name)}
                  >
                    <div
                      className={` ${
                        selectedTab === opt.name ? styles.indicator : ""
                      }`}
                    >
                      &nbsp;
                    </div>
                    <div className={styles.link}>
                      <div className={styles.icon}>
                        {/* <img src={opt.svg} alt="" /> */}
                        <SvgWrapper svgSrc={opt.svg}></SvgWrapper>
                      </div>
                      <div className={styles.modeName}>{opt.display_name}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.navigationTab}>
                {selectedTab === "CARD" && (
                  <div className={styles.cardTab}>
                    <div
                      className={styles.savedCardWrapper}
                      style={{ display: addNewCard ? "none" : "block" }}
                    >
                      <div className={styles.cardHeader}>
                        Saved Credit/Debit Cards
                      </div>
                      <div className={styles.cardList}>
                        {selectedTabData &&
                          selectedTabData.list &&
                          selectedTabData.list.map((card, index) => (
                            <label
                              key={card.card_id}
                              onClick={() => setSelectedCard(card)}
                            >
                              {/* <input
                                type="radio"
                                name="card"
                                value={card}
                                checked={selectedCard === card}
                                onChange={(e) =>
                                  setSelectedCard(e.target.value)
                                }
                              /> */}
                              <div
                                className={`${styles.cardItem} ${getCardBorder(
                                  card
                                )}`}
                              >
                                <div className={styles.cardDetailsWrapper}>
                                  <div className={styles.leftWrapper}>
                                    <div className={styles.cardLeft}>
                                      {(!selectedCard ||
                                        selectedCard.card_id !==
                                          card.card_id) && (
                                        <SvgWrapper
                                          svgSrc={"radio"}
                                        ></SvgWrapper>
                                      )}
                                      {selectedCard &&
                                        selectedCard.card_id ===
                                          card.card_id && (
                                          <SvgWrapper
                                            svgSrc={"radio-selected"}
                                          ></SvgWrapper>
                                        )}
                                    </div>
                                    <div className={styles.cardMiddle}>
                                      <div className={styles.numberLogo}>
                                        <div className={styles.number}>
                                          <span>****</span>
                                          {getTrimmedCardNumber(
                                            card.card_number
                                          )}
                                        </div>
                                        <div className={styles.logo}>
                                          <img
                                            src={card.card_brand_image}
                                            alt={card.nickname}
                                          />
                                        </div>
                                      </div>
                                      {card.compliant_with_tokenisation_guidelines && (
                                        <div className={styles.securedCard}>
                                          <img
                                            src="/public/assets/shield-green.svg"
                                            alt="rbi-icon"
                                          />
                                          <span
                                            className={styles.securedCardText}
                                          >
                                            secured
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className={styles.rightWrapper}>
                                    <input
                                      className={styles.cardRight}
                                      style={{
                                        visibility:
                                          selectedCard &&
                                          selectedCard.card_id === card.card_id
                                            ? "visible"
                                            : "hidden",
                                      }}
                                      value={selectedCardCVV}
                                      onChange={(e) =>
                                        setSelectedCardCVV(e.target.value)
                                      }
                                      type="text"
                                      autoComplete="off"
                                      maxLength="4"
                                      placeholder="CVV*"
                                    />
                                  </div>
                                </div>
                                {!card.compliant_with_tokenisation_guidelines &&
                                  isLoggedIn && (
                                    <div className={styles.rbiGuidelines}>
                                      <label htmlFor="terms">
                                        <input
                                          type="checkbox"
                                          id="terms"
                                          name="terms"
                                          checked={
                                            card.compliant_with_tokenisation_guidelines
                                          }
                                          onChange={(e) =>
                                            handleSavedCardState(e)
                                          }
                                        />
                                      </label>
                                      <div className={styles.rbiGuidelinesText}>
                                        Save my card as per RBI Guidelines
                                      </div>
                                      {/* <div className={styles.rbiGuidelineIcon}>
                                  <a
                                    href="/help/card-tokenisation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src="/public/assets/rbi-guidelines-icon.svg"
                                      alt="rbi-icon"
                                    />
                                  </a>
                                </div> */}
                                    </div>
                                  )}
                                {selectedCard &&
                                  selectedCard.card_id === card.card_id && (
                                    <div>
                                      <div>
                                        <button
                                          className={`${styles.commonBtn} ${styles.payBtn}`}
                                          disabled={
                                            selectedCardCVV.length === 0
                                          }
                                          onClick={() => proceedToPay("CARD")}
                                        >
                                          PAY{" "}
                                          {getCurrencySymbol + getTotalValue()}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </label>
                          ))}
                      </div>
                      <div>
                        <button
                          className={styles.addNewCard}
                          onClick={addNewCardShow}
                        >
                          + Add New Card
                        </button>
                      </div>
                    </div>
                    <div
                      className={styles.newCardWrapper}
                      style={{ display: addNewCard ? "block" : "none" }}
                    >
                      <div className={styles.addCardHeader}>
                        <button onClick={hideNewCard}>
                          <SvgWrapper svgSrc={'back'}></SvgWrapper>
                        </button>
                        <div className={styles.newCardHeaderText}>
                          Pay Using Credit/Debit Card
                        </div>
                      </div>
                      <div className={styles.newCard}>
                        <div className={styles.cardInputWrapper}>
                          <input
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            ref={cardNumberRef}
                            placeholder="Card Number*"
                            className={styles.cardNumber}
                            contentEditable="true"
                          />
                          <div
                            className={`${styles.formError} ${styles.lightXxxs}`}
                          >
                            {cardNumberError}
                          </div>
                        </div>
                        <div className={styles.cardInputWrapper}>
                          <input
                            maxLength="20"
                            type="text"
                            placeholder="Name on Card*"
                            className={styles.cardName}
                            ref={nameRef}
                            contentEditable="true"
                          />
                          <div
                            className={`${styles.formError} ${styles.lightXxxs}`}
                          >
                            {cardNameError}
                          </div>
                        </div>
                        <div className={styles.cardDateCvvWrapper}>
                          <div className={styles.cardInputWrapper}>
                            <input
                              type="text"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              ref={expirationDateRef}
                              placeholder="Expiry Date (mm/yy)*"
                              className={styles.cardExpiry}
                              contentEditable="true"
                            />
                            <div
                              className={`${styles.formError} ${styles.lightXxxs}`}
                            >
                              {cardExpiryError}
                            </div>
                          </div>
                          <div className={styles.cardInputWrapper}>
                            <input
                              value={cvvNumber}
                              type="password"
                              onKeyPress={keypressCvv}
                              maxLength="4"
                              placeholder="CVV*"
                              className={styles.cardCvv}
                              onChange={(e) => setCvvNumber(e.target.value)}
                            />
                            <div
                              className={`${styles.error} ${styles.formError} ${
                                styles.lightXxxs
                              } ${showError ? styles.visible : ""}`}
                            >
                              {cardCVVError}
                            </div>
                          </div>
                        </div>
                        {isLoggedIn && (
                          <div className={styles.rbiGuidelines}>
                            <label htmlFor="terms">
                              <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                checked={isCardSecure}
                                onChange={handleCardSaveState}
                              />
                            </label>
                            <div className={styles.rbiGuidelinesText}>
                              Save my card as per RBI Guidelines
                            </div>
                            {/* <div className={styles.rbiGuidelineIcon}>
                        <a
                          href="/help/card-tokenisation"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="/public/assets/rbi-guidelines-icon.svg"
                            alt="rbi-icon"
                          />
                        </a>
                      </div> */}
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          className={styles.saveNewCard}
                          onClick={() => proceedToPay("newCARD")}
                        >
                          PAY {getCurrencySymbol + getTotalValue()}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  {selectedTab === "WL" && (
                    <div>
                      <div className={styles.walletHeader}>
                        Select Wallet To Pay
                      </div>
                      <div className={styles.walletOption}>
                        {selectedTabData.list.map((wlt, index) => (
                          <lable
                            key={index}
                            onClick={(e) => setselectedWallet(wlt)}
                          >
                            {/* <input
                        type="radio"
                        name="wallet"
                        value={selectedWallet}
                        checked={selectedWallet === wlt}
                      /> */}
                            <div
                              className={`${
                                styles.walletItem
                              } ${getWalletdBorder(wlt)}`}
                            >
                              <div className={styles.walletLeft}>
                                {(!selectedWallet ||
                                  selectedWallet.code !== wlt.code) && (
                                  <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                                )}
                                {selectedWallet &&
                                  selectedWallet.code === wlt.code && (
                                    // <fdk-inline-svg src="radio-selected" />
                                    <SvgWrapper
                                      svgSrc={"radio-selected"}
                                    ></SvgWrapper>
                                  )}
                              </div>
                              <div className={styles.walletMiddle}>
                                <img
                                  src={wlt.logo_url.small}
                                  alt={wlt.display_name}
                                />
                              </div>
                              <div className={styles.walletRight}>
                                {wlt.display_name}
                              </div>
                            </div>
                          </lable>
                        ))}
                      </div>
                      <div className={styles.walletPay}>
                        {selectedWallet.wallet_id && (
                          <button
                            className={styles.payBtn}
                            onClick={() => proceedToPay("WL")}
                          >
                            PAY {getCurrencySymbol + getTotalValue()}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  {selectedTab === "UPI" && (
                    <div className={styles.upiWrapper}>
                      <div className={styles.upiHeader}>Enter UPI ID</div>
                      <div>
                        <label>
                          <input
                            className={styles.upiInput}
                            type="text"
                            placeholder="Enter UPI ID"
                            value={vpa}
                            onChange={(e) => setvpa(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className={styles.upiPay}>
                        {vpa && validateVPA() && (
                          <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={() => proceedToPay("UPI")}
                          >
                            PAY {getCurrencySymbol + getTotalValue()}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  {selectedTab === "NB" && (
                    <>
                      <div className={styles.nbHeader}>Select a Bank</div>
                      <div className={styles.nbOption}>
                        {topFiveBank.map((nb, index) => (
                          <label
                            key={nb.display_name}
                            onClick={() => setselectedNB(nb)}
                          >
                            {/* <input
                        type="radio"
                        name="net-banking"
                        value={selectedNB}
                        checked={selectedNB === nb}
                        onChange={(e) => setselectedNB(e.target.value)}
                      /> */}
                            <div
                              className={`${styles.nbItem} ${getNBBorder(nb)}`}
                            >
                              <div className={styles.nbLeft}>
                                {(!selectedNB ||
                                  selectedNB.code !== nb.code) && (
                                  <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                                )}
                                {selectedNB && selectedNB.code === nb.code && (
                                  <SvgWrapper svgSrc="radio-selected" />
                                )}
                              </div>
                              <div className={styles.nbMiddle}>
                                <img
                                  src={nb.logo_url.small}
                                  alt={nb.display_name}
                                />
                              </div>
                              <div className={styles.nbRight}>
                                {nb.display_name}
                              </div>
                            </div>
                          </label>
                        ))}
                        {restBanks && (
                          <label
                            key="6"
                            onClick={() => setselectedNB("otherNB")}
                          >
                            <div
                              className={`${
                                styles.nbItem
                              } ${getNBOtherBorder()}`}
                            >
                              <div className={styles.nbLeft}>
                                {(!selectedNB || selectedNB !== "otherNB") && (
                                  <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                                )}
                                {selectedNB && selectedNB === "otherNB" && (
                                  <SvgWrapper
                                    svgSrc={"radio-selected"}
                                  ></SvgWrapper>
                                )}
                              </div>
                              <div className={styles.nbMiddle}>
                                {/* <fdk-inline-svg src="otherNB" /> */}
                                {/* <img src="" alt="other" srcset="" /> */}
                              </div>
                              <div className={styles.nbRight}>Other Banks</div>
                            </div>
                          </label>
                        )}
                        {selectedNB === "otherNB" && (
                          <select
                            className={styles.otherSelect}
                            onChange={selectBank}
                          >
                            {restBanks.map((nb, index) => (
                              <option key={nb.display_name} value={JSON.stringify(nb)}>
                                {nb.display_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {(selectedNB.code || selectedNB === "otherNB") && (
                        <div className={styles.nbPay}>
                          <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={() => proceedToPay("NB")}
                          >
                            PAY {getCurrencySymbol + getTotalValue()}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  {selectedTab === "COD" && (
                    <>
                      <div className={styles.codHeader}>Pay In Cash</div>
                      {selectedTabData && selectedTabData.cod_charges > 0 && (
                        <div className={styles.codInfo}>
                          Additional{" "}
                          <span style={{ fontWeight: 600 }}>
                            ₹{selectedTabData.cod_charges}
                          </span>{" "}
                          will be charged for cash collection
                        </div>
                      )}
                      <div className={styles.codPay}>
                        <button
                          className={`${styles.commonBtn} ${styles.payBtn}`}
                          onClick={() => proceedToPay("COD", selectedTabData)}
                        >
                          PAY {getCurrencySymbol + getTotalValue()}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {selectedTab === "PL" && (
                    <>
                      <div className={styles.payLaterHeader}>
                        Choose An Option
                      </div>
                      <div className={styles.payLaterOption}>
                        {getNormalisedList(selectedTabData).map(
                          (payLater, index) => (
                            <>
                              {!payLater.isDisabled && (
                                <label
                                  key={payLater.id}
                                  id={payLater.id}
                                  onClick={() => setselectedPayLater(payLater)}
                                >
                                  <div
                                    className={`${
                                      styles.payLaterItem
                                    } ${getPayLaterBorder(payLater)}`}
                                  >
                                    <div className={styles.payLaterLeft}>
                                      {!selectedPayLater ||
                                      selectedPayLater.code !==
                                        payLater.code ? (
                                        <SvgWrapper
                                          svgSrc={"radio"}
                                        ></SvgWrapper>
                                      ) : (
                                        <SvgWrapper
                                          svgSrc={"radio-selected"}
                                        ></SvgWrapper>
                                      )}
                                    </div>
                                    <div className={styles.payLaterMiddle}>
                                      <img
                                        src={payLater.logo_url.small}
                                        alt={payLater.display_name}
                                      />
                                    </div>
                                    <div className={styles.payLaterRight}>
                                      {payLater.display_name}
                                    </div>
                                  </div>
                                </label>
                              )}
                            </>
                          )
                        )}
                      </div>
                      <div className={styles.payLaterPay}>
                        {selectedPayLater.code && (
                          <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={() => proceedToPay("PL")}
                          >
                            PAY {getCurrencySymbol + getTotalValue()}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {selectedTab === "CARDLESS_EMI" && (
                    <>
                      <div className={styles.cardlessHeader}>
                        Choose An Option
                      </div>
                      <div className={styles.cardlessOption}>
                        {selectedTabData.list.map((emi, index) => (
                          <label
                            key={emi.display_name}
                            onClick={() => setselectedCardless(emi)}
                          >
                            {/* <input
                        type="radio"
                        name="cardless"
                        value={emi}
                        checked={selectedCardless === emi}
                        onChange={(e) => setSelectedCardless(e.target.value)}
                      /> */}
                            <div
                              className={`${
                                styles.cardlessItem
                              } ${getCardlessBorder(emi)}`}
                            >
                              <div className={styles.cardlessLeft}>
                                {!selectedCardless ||
                                selectedCardless.code !== emi.code ? (
                                  <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                                ) : (
                                  <SvgWrapper
                                    svgSrc={"radio-selected"}
                                  ></SvgWrapper>
                                )}
                              </div>
                              <div className={styles.cardlessMiddle}>
                                <img
                                  src={emi.logo_url.small}
                                  alt={emi.display_name}
                                />
                              </div>
                              <div className={styles.cardlessRight}>
                                {emi.display_name}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className={styles.cardlessPay}>
                        {selectedCardless.code && (
                          <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={() => proceedToPay("CARDLESS_EMI")}
                          >
                            PAY {getCurrencySymbol + getTotalValue()}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Loader></Loader>
          )}
        </div>
      )}
    </>
  );
}

export default CheckoutPaymentContent;
