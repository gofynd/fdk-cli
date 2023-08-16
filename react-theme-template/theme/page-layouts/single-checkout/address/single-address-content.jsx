import React, { useContext, useState } from "react";
import useSingleAddressContent from "./useSingleAddressContent";
import SvgWrapper from "../../../components/svgWrapper/SvgWrapper";

import styles from "./single-address-content.less";
import Loader from "../../../components/loader/loader";

function SingleAddressContent({ allAddress, addressLoading }) {
  const {
    setselectedAddId,
    selectedAddId,
    getDefaultAdd,
    getOtherAdd,
    deliverToThis,
    addressmsg,
    addressError,
    setaddressError,
    removeAddress,
    editAddress,
    isLoading,
  } = useSingleAddressContent(allAddress);


  return (
    <>
      {allAddress && allAddress.length && !isLoading ? (
        <div className={styles.addressContentConitainer}>
          {getDefaultAdd.length ? (
            <div className={styles.heading}>Default Address</div>
          ) : null}
          {getDefaultAdd?.length > 0
            ? getDefaultAdd.map((item, index) => {
                return (
                  <>
                    <div
                      key={index}
                      className={styles.addressContent}
                      onClick={() => {
                        setselectedAddId(item.id);
                        setaddressError(false);
                      }}
                      style={
                        selectedAddId !== item.id
                          ? { border: "1px solid #f0f0f0" }
                          : {}
                      }
                    >
                      <div className={styles.addressContentTop}>
                        <div className={styles.addressContentTopLeft}>
                          {selectedAddId == item.id ? (
                            <SvgWrapper svgSrc={"radio-selected"}></SvgWrapper>
                          ) : (
                            <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                          )}
                          <span className={styles.phnumber}>
                            {item.country_code + item.phone}
                          </span>
                          <span className={styles.lable}>
                            {item.address_type}
                          </span>
                        </div>
                        {selectedAddId == item.id && (
                          <div className={styles.addressContentTopRight}>
                            <span
                              className={styles.edit}
                              onClick={() => editAddress(item)}
                            >
                              edit
                            </span>
                            <span>|</span>
                            <span
                              className={styles.remove}
                              onClick={() => removeAddress(item.id)}
                            >
                              Remove
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={styles.addressMid}>{`${item.address}, ${
                        item.area
                      } ${item.landmark ? "," + item.landmark : ""} ${
                        item.city ? "," + item.city : ""
                      } - ${item.area_code}`}</div>
                      <div className={styles.phEnd}>
                        {"+" + item.country_code + "-" + item.phone}
                      </div>
                      {addressError && selectedAddId == item.id && (
                        <div className={styles.errorMsg}>{addressmsg}</div>
                      )}
                      {selectedAddId == item.id && (
                        <div
                          className={styles.deliverToThis}
                          onClick={deliverToThis}
                        >
                          {" "}
                          DELIVER TO THIS ADDRESS
                        </div>
                      )}
                    </div>
                  </>
                );
              })
            : null}
          {getOtherAdd.length ? (
            <div className={styles.heading}>Other Address</div>
          ) : null}
          {getOtherAdd?.length > 0
            ? getOtherAdd.map((item, index) => {
                return (
                  <div
                  key={item.id}
                    className={styles.addressContent}
                    onClick={() => {
                      setselectedAddId(item.id);
                      setaddressError(false);
                    }}
                    style={
                      selectedAddId !== item.id
                        ? { border: "1px solid #f0f0f0" }
                        : {}
                    }
                  >
                    <div className={styles.addressContentTop}>
                      <div className={styles.addressContentTopLeft}>
                        {selectedAddId == item.id ? (
                          <SvgWrapper svgSrc={"radio-selected"}></SvgWrapper>
                        ) : (
                          <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                        )}
                        <span className={styles.phnumber}>
                          {item.country_code + item.phone}
                        </span>
                        <span className={styles.lable}>
                          {item.address_type}
                        </span>
                      </div>
                      {selectedAddId == item.id && (
                        <div className={styles.addressContentTopRight}>
                          <span
                            className={styles.edit}
                            onClick={() => editAddress(item)}
                          >
                            edit
                          </span>
                          <span>|</span>
                          <span
                            className={styles.remove}
                            onClick={() => removeAddress(item.id)}
                          >
                            Remove
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles.addressMid}>{`${item.address}, ${
                      item.area
                    } ${item.landmark ? "," + item.landmark : ""} ${
                      item.city ? "," + item.city : ""
                    } - ${item.area_code}`}</div>
                    <div className={styles.phEnd}>
                      {"+" + item.country_code + "-" + item.phone}
                    </div>
                    {addressError && selectedAddId == item.id && (
                      <div className={styles.errorMsg}>{addressmsg}</div>
                    )}
                    {selectedAddId == item.id && (
                      <div
                        className={styles.deliverToThis}
                        onClick={deliverToThis}
                      >
                        {" "}
                        DELIVER TO THIS ADDRESS
                      </div>
                    )}
                  </div>
                );
              })
            : ""}
        </div>
      ) : (
        <>
          {addressLoading || isLoading ? (
            <Loader></Loader>
          ) : (
            <div className={styles.addressContentConitainer} style={{textAlign:"center", color:'var(--textLabel)'}}>
              {" "}
              No Address Found, Please Add Address
            </div>
          )}
        </>
      )}
    </>
  );
}

export default SingleAddressContent;

// className=("[a-z-]+")
// className={styles[$1]}
