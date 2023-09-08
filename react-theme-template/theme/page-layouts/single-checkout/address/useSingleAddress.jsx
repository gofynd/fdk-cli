import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import { useSingleContext } from "../single-page-context";


const useSingleAddress = () => {
  const { fpi, setisopenmodal, setmodaltitle } = useSingleContext();

  const ADDRESS = useGlobalStore(fpi.getters.ADDRESS);
  // const [searchParams] = useSearchParams();
  // const addressId = searchParams.get('address_id');

  let allAddress = ADDRESS?.address;
  let addressLoading =ADDRESS?.loading


  // let selectedAddress= allAddress?.filter((item)=>item.id==addressId)

  const editAddress = () => {

  };

  return {
    allAddress: allAddress,
    addressLoading:addressLoading
    // selectedAddress:selectedAddress
  };
};

export default useSingleAddress;
