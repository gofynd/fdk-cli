import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSingleContext } from "../single-page-context";

const useSingleAddressContent = (allAddress) => {
  const [selectedAddId, setselectedAddId] = useState("");
  const [addressError, setaddressError] = useState(false);
  const [addressmsg, setaddressmsg] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const {
    setshowShipment,
    fpi,
    setmodaltitle,
    setisopenmodal,
    setiisNewAddr,
    setaddressitem,
  } = useSingleContext();

  const getDefaultAdd = (() => {
    return allAddress?.filter((item) => item.is_default_address) || [];
  })();
  useEffect(() => {
    if (getDefaultAdd.length && !selectedAddId) {
      setselectedAddId(getDefaultAdd[0].id);
    } else if (getOtherAdd.length && !selectedAddId) {
      setselectedAddId(getOtherAdd[0].id);
    }
  }, [allAddress]);

  const editAddress = (item) => {
    setmodaltitle("Edit Address");
    setaddressitem(item);
    setiisNewAddr(false);
    setisopenmodal(true);
  };
  const removeAddress = (id) => {
    fpi.address
      .deleteAddress({
        id,
      })
      .then(({ payload }) => {
        fpi.address.getAddress();
      });
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const getOtherAdd = (() => {
    return allAddress?.filter((item) => !item.is_default_address) || [];
  })();

  const updateQuery = (key, value) => {
    const queryParamKey = key; // Replace with your desired query parameter key
    const queryParamValue = value; // Replace with your desired query parameter value

    const searchParams = new URLSearchParams(location.search);
    const existingValue = searchParams.get(queryParamKey);

    if (existingValue !== null) {
      // Key already exists, update the value
      searchParams.set(queryParamKey, queryParamValue);
    } else {
      // Key doesn't exist, add the new query parameter
      searchParams.append(queryParamKey, queryParamValue);
    }

    const updatedSearch = searchParams.toString();

    navigate({ search: updatedSearch });
  };

  const deliverToThis = () => {
    setisLoading(true);
    const findAddress = allAddress.find((item) => item.id == selectedAddId);
    fpi.cart
      .selectAddress({
        body: {
          billing_address_id: findAddress.id,
          cart_id,
          id: findAddress.id,
        },
        cartId: cart_id,
      })
      .then(({ payload }) => {
        setisLoading(false);
        if (payload?.is_valid) {
          updateQuery("address_id", selectedAddId);
          fpi.cart.getShipments({
            addressId: selectedAddId,
            id: cart_id,
          });
          setshowShipment(true);
        } else {
          setaddressError(true);
          setaddressmsg(payload.message);
        }
      })
      .catch((e) => {
        setisLoading(false);
        setaddressError(true);
        setaddressmsg(e.message);
      });
  };
  return {
    setselectedAddId: setselectedAddId,
    selectedAddId: selectedAddId,
    getDefaultAdd: getDefaultAdd,
    getOtherAdd: getOtherAdd,
    deliverToThis: deliverToThis,
    addressError: addressError,
    addressmsg: addressmsg,
    setaddressError: setaddressError,
    removeAddress: removeAddress,
    editAddress: editAddress,
    isLoading: isLoading,
  };
};

export default useSingleAddressContent;
