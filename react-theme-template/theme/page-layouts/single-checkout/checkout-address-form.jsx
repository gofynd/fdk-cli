import React, { useState } from "react";
import { useSingleContext } from "./single-page-context";
import style from "./checkout-address-form.less";

const CheckoutAddressForm = ({
  isNewAddr = true,
  showAddressType = true,
  addressitem = () => {},
}) => {

  const { fpi, resetAddressState } = useSingleContext();
  const userdata = [
    {
      label: "Full Name",
      required: true,
      name: "name",
      type: "text",
      autofocus: true,
      showerror: false,
      value: isNewAddr ? "" : addressitem?.name,
      validateFn: () => {},
      errortext: "Enter Full Name",
    },
    {
      label: "Mobile Number",
      required: true,
      name: "phone",
      type: "tel",
      showerror: false,
      validateFn: () => {},
      value: isNewAddr ? "" : addressitem?.phone,
      errortext: "Enter Mobile Number",
      maxlength: 10,
    },
    {
      label: "Email (optional)",
      required: false,
      name: "email",
      type: "text",
      showerror: false,
      validateFn: () => {},
      value: isNewAddr ? "" : addressitem.email ? addressitem.email : "",
      errortext: "Enter Email Id",
    },
  ];

  const formdata = [
    {
      label: "Flat No/House No",
      required: true,
      name: "address",
      type: "text",
      value: isNewAddr ? "" : addressitem?.address,
      showerror: false,
      validateFn: () => {},
      errortext: "Enter Flat No/House No",
    },
    {
      label: "Building Name/street",
      required: true,
      name: "area",
      type: "text",
      showerror: false,
      value: isNewAddr ? "" : addressitem?.area,
      validateFn: () => {},
      errortext: "Enter Building Name/street",
    },
    {
      label: "Locality/Landmark",
      required: true,
      name: "landmark",
      type: "text",
      showerror: false,
      value: isNewAddr ? "" : addressitem?.landmark,
      validateFn: () => {},
      errortext: "Enter Locality/Landmark",
    },
  ];
  const pincode = {
    label: "Pincode",
    required: true,
    name: "pincode",
    type: "text",
    showerror: false,
    value: isNewAddr ? "" : addressitem.area_code,
    validateFn: () => {},
    errortext: "Enter Valid Pincode",
  };
  const addressTypes = [
    {
      name: "home",
      type: "Home",
      display: "Home",
      icon: "/path/to/home-icon.svg",
    },
    {
      name: "work",
      type: "Work",
      display: "Work",
      icon: "/path/to/work-icon.svg",
    },
    {
      name: "friends & family",
      type: "Friends & Family",
      display: "Friends & Family",
      icon: "/path/to/work-icon.svg",
    },
    {
      name: "other",
      type: "Other",
      display: "Other",
      icon: "/path/to/work-icon.svg",
    },
    // Add more address types as needed
  ];

  const City = {
    label: "City",
    required: true,
    name: "city",
    type: "text",
    value: isNewAddr ? "" : addressitem.city,
    errortext: "enter city",
    showerror: false,
  };
  const State = {
    label: "State",
    required: true,
    name: "state",
    type: "text",
    value: isNewAddr ? "" : addressitem.state,
    errortext: "enter state",
    showerror: false,
  };
  const Country = {
    label: "Country",
    required: true,
    name: "country",
    type: "text",
    value: isNewAddr ? "" : addressitem.country,
    errortext: "enter country",
    showerror: false,
  };
  const address_name = {
    label: "Address Name",
    type: "text",
    showerror: false,
    value: isNewAddr ? "" : addressitem.address_type,
    errortext: "Enter Address Name",
  };
  const [addressName, setAddressName] = useState(address_name.value);
  const getSelectedAddress = () => {
    if (!isNewAddr) {
      let Alltype = addressTypes.map((item) => item.type);
      let Addtype = addressitem.address_type;

      if (Alltype.includes(Addtype)) {
        return Addtype;
      } else {
        return "Other";
      }
    } else {
      return null;
    }
  };

  const [formData, setFormData] = useState(formdata);
  const [pinCode, setpincode] = useState(pincode);
  const [city, setCity] = useState(City);
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState(State);
  const [country, setCountry] = useState(Country);
  const [selectedAddressType, setSelectedAddressType] = useState(
    getSelectedAddress()
  );

  const [Userdata, setUserdata] = useState(userdata);

  const handleformDataChange = (index, event) => {
    const { name, value } = event.target;
    const updatedFormData = [...formData];
    updatedFormData[index].value = value;
    setFormData(updatedFormData);
  };
  const handlePincodeDataChange = (event) => {
    const { value } = event.target;
    setpincode((prevState) => ({
      ...prevState,
      value: value,
    }));
  };
  const handleCityChange = (event) => {
    const { value } = event.target;
    setCity((prevState) => ({
      ...prevState,
      value: value,
    }));
  };
  const handleStateChange = (event) => {
    const { value } = event.target;
    setState((prevState) => ({
      ...prevState,
      value: value,
    }));
  };
  const handleCountryChange = (event) => {
    const { value } = event.target;
    setCountry((prevState) => ({
      ...prevState,
      value: value,
    }));
  };
  const handleAddressChange = (item) => {
    setSelectedAddressType(item.type);
    // Additional logic if needed
  };
  const handleAddressNameChange = (event) => {
    setAddressName(event.target.value);
    // Additional logic if needed
  };
  const handleUserdataChange = (index, event) => {
    const { name, value } = event.target;
    const updatedUserdata = [...Userdata];
    updatedUserdata[index].value = value;
    setUserdata(updatedUserdata);
  };
  // const address_name = {
  //   label: "Address Name",
  //   required: true,
  //   name: "address_name",
  //   type: "text",
  //   showerror: false,
  //   value: isNewAddr ? "" : getAddressName(),
  //   validateFn: () => {},
  //   errortext: "Enter Address Name",
  // };

  // const city = {
  //   label: "City",
  //   required: true,
  //   name: "city",
  //   type: "text",
  //   value: isNewAddr ? "" : addressitem.city,
  // };

  // const state = {
  //   label: "State",
  //   required: true,
  //   name: "state",
  //   type: "text",
  //   value: isNewAddr ? "" : addressitem.state,
  // };

  // const country = {
  //   label: "Country",
  //   required: true,
  //   name: "country",
  //   type: "text",
  //   value: isNewAddr ? "" : addressitem.country,
  // };

  const addAddress = () => {
    let obj = {
      is_default_address: checked,
      name: Userdata[0].value,
      phone: Userdata[1].value,
      email: Userdata[2].value,
      address: formData[0].value,
      area: formData[1].value,
      city: city.value,
      landmark: formData[2].value,
      area_code: pinCode.value.toString(),
      country: country.value,
      state: state.value,
      address_type:
        selectedAddressType == "Other" ? addressName : selectedAddressType,
    };

    fpi.address.updateAddress({ body: obj }).then((res) => {
      resetAddressState();
      fpi.address.getAddress();
    });

  };

  const updateAddress = () => {
    let obj = {
      ...addressitem,

      is_default_address: checked,
      name: Userdata[0].value,
      phone: Userdata[1].value,
      email: Userdata[2].value,
      address: formData[0].value,
      area: formData[1].value,
      city: city.value,
      landmark: formData[2].value,
      area_code: pinCode.value.toString(),
      country: country.value,
      state: state.value,
      address_type:
        selectedAddressType == "Other" ? addressName : selectedAddressType,
    };
    delete obj._id;
    fpi.address.updateAddress({ body: obj, id: obj.id }).then(() => {
      resetAddressState();
      fpi.address.getAddress();
    });
  };
  return (
    <>
      <div className={style.deliveryInfo}>Delivery Information</div>
      <div className={style.formContainer}>
        {formData.map((item, index) => (
          <div key={item.name + index} className={style.formItemDiv}>
            <input
              className={style.formInputBox}
              type={item.type}
              required={item.required}
              value={item.value}
              name={item.name}
              onChange={(event) => handleformDataChange(index, event)}
            />
            <span className={style.formLabel}>
              <span>{item.label}</span>
              <span className={style.formReq}>*</span>
            </span>

            <div
              className={`${style.formError} ${
                item.showerror ? style.visible : ""
              }`}
            >
              {item.errortext}
            </div>
          </div>
        ))}
        <div className={style.formItemDiv}>
          <input
            className={style.formInputBox}
            type={pinCode.type}
            required={pinCode.required}
            value={pinCode.value}
            name={pinCode.name}
            onChange={(event) => handlePincodeDataChange(event)}
          />
          <span className={style.formLabel}>
            <span>{pinCode.label}</span>
            <span className={style.formReq}>*</span>
          </span>

          <div
            className={`${style.formError} ${
              pinCode.showerror ? style.visible : ""
            }`}
          >
            {pinCode.errortext}
          </div>
        </div>
        <div className={style.formItemDiv}>
          <input
            className={style.formInputBox}
            type={city.type}
            required={city.required}
            value={city.value}
            name={city.name}
            onChange={handleCityChange}
          />
          <span className={style.formLabel}>
            <span>{city.label}</span>
            <span className={style.formReq}>*</span>
          </span>

          <div
            className={`${style.formError} ${
              city.showerror ? style.visible : ""
            }`}
          >
            {city.errortext}
          </div>
        </div>

        <div className={style.formItemDiv}>
          <input
            className={style.formInputBox}
            type={state.type}
            required={state.required}
            value={state.value}
            name={state.name}
            onChange={handleStateChange}
          />
          <span className={style.formLabel}>
            <span>{state.label}</span>
            <span className={style.formReq}>*</span>
          </span>

          <div
            className={`${style.formError} ${
              state.showerror ? style.visible : ""
            }`}
          >
            {state.errortext}
          </div>
        </div>

        <div className={style.formItemDiv}>
          <input
            className={style.formInputBox}
            type={country.type}
            required={country.required}
            value={country.value}
            name={country.name}
            onChange={handleCountryChange}
          />
          <span className={style.formLabel}>
            <span>{country.label}</span>
            <span className={style.formReq}>*</span>
          </span>

          <div
            className={`${style.formError} ${
              country.showerror ? style.visible : ""
            }`}
          >
            {country.errortext}
          </div>
        </div>

        <div className={style.secondContainer}>
          {showAddressType && (
            <div className={style.type}>
              <span className={style.addressTypeHeader}>SAVE AS</span>
              <div className={`${style.formInput} ${style.addressType}`}>
                {addressTypes.map((item, index) => (
                  <div className={style.type}>
                    <label
                      htmlFor={item.type}
                      className={`${style.addressTypes} ${
                        selectedAddressType === item.type
                          ? style.selectedDiv
                          : ""
                      }`}
                      key={item.name}
                      onClick={() => handleAddressChange(item)}
                    >
                      <label className={style.regularXxxs}>
                        {/* <img
                      src={item.icon}
                      alt={item.display}
                      className={style.addressTypeIcon}
                    /> */}
                        <span>{item.display}</span>
                      </label>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedAddressType === "Other" && (
            <div className={style.formItem}>
              <div className={style.formItemDiv}>
                <input
                  className={style.formInputBox}
                  type={address_name.type}
                  value={addressName}
                  name="address_name"
                  onChange={handleAddressNameChange}
                />
                <span className={style.formLabel}>
                  <span>{address_name.label}</span>
                  <span className={style.formReq}>*</span>
                </span>
                <div
                  className={`${style.formError} ${
                    address_name.showerror ? style.visible : ""
                  }`}
                >
                  {address_name.errortext}
                </div>
              </div>
            </div>
          )}

          <div className={style.contactInfo}>
            <span className={style.nccContactInfo}>Contact Details</span>
          </div>

          <div className={style.formContainer2}>
            {Userdata.map((item, index) => (
              <div key={index} className={style.formItemDiv}>
                {item.name === "phone" ? (
                  <input
                    className={`${style.formInputBox} ${style.commonInput} ${style.mobileFormInputBox}`}
                    type={item.type}
                    required={item.required}
                    value={item.value}
                    name={item.name}
                    onChange={(event) => handleUserdataChange(index, event)}
                  />
                ) : (
                  <input
                    className={style.formInputBox}
                    type={item.type}
                    required={item.required}
                    value={item.value}
                    name={item.name}
                    maxLength={item.maxlength}
                    onChange={(event) => handleUserdataChange(index, event)}
                  />
                )}
                <span className={style.formLabel}>
                  <span>{item.label}</span>
                  {item.required && <span className={style.formReq}>*</span>}
                </span>
                <div
                  className={`${style.formError} ${
                    item.showerror ? style.visible : ""
                  }`}
                >
                  {item.errortext}
                </div>
              </div>
            ))}
          </div>
          <div className={style.defaultAddress}>
            <input
              type="checkbox"
              id="default"
              name="default"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <label htmlFor="default">Make this my default address</label>
          </div>

          {isNewAddr ? (
            <div className={style.deliverBtnDiv}>
              <button
                className={`${style.commonBtn} ${style.deliverBtn}`}
                onClick={addAddress}
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className={style.deliverBtnDivEdit}>
              <button
                className={`${style.commonBtn} ${style.deliverBtn}`}
                onClick={updateAddress}
              >
                Update Address
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutAddressForm;
