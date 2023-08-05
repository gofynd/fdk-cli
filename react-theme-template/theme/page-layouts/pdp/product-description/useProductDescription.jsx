import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
const useProductDescription = (fpi, slug) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPincode, setCurrentPincode] = useState("");
  const [currentSizeIndex, setCurrentSizeIndex] = useState();
  const [errMsg, seterrMsg] = useState(null);
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const {
    product_details,
    product_variants,
    product_meta,
    product_price_by_slug,
  } = PRODUCT;
  const { sizes, loading: productMetaLoading } = product_meta || {};
  const { loading: productVariantsLoading } = product_variants || {};
  const { loading: productDetailsLoading } = product_details || {};
  const { loading: productPriceBySlugLoading } = product_price_by_slug || {};


  const isLoading =
    productMetaLoading ||
    productVariantsLoading ||
    productDetailsLoading ||
    productPriceBySlugLoading ||
    false;
  useEffect(() => {
    fpi.product.fetchProductBySlug({ slug });
    fpi.product.fetchProductMeta({ slug: slug });
  }, [slug]);

  useEffect(() => {
    if (sizes?.length > 0 && currentSizeIndex !== null) {
      setCurrentSizeIndex(0);
    }
  }, [sizes]);

  useEffect(() => {
    if (currentSizeIndex !== null && sizes?.length > 0) {
      const query = {
        slug,
        size: sizes[currentSizeIndex]?.value,
      };
      if (currentPincode?.length === 6) {
        query.pincode = currentPincode;
      }
      fpi.product.fetchProductPriceBySlug(query);
    }
  }, [currentSizeIndex, sizes]);

  useEffect(() => {
    if (
      currentPincode?.length === 6 &&
      currentSizeIndex !== null &&
      sizes?.length > 0
    ) {
      localStorage?.setItem("pincode", currentPincode);
      // Setting it Here so can Access on Cart Page if Added
      fpi.logistic
        .fetchPincodeDetails({
          pincode: `${currentPincode}`,
        })
        .then((res) => {
          if (res?.type == "pincodeDetails/rejected") {
            seterrMsg(res?.payload);
          } else {
            seterrMsg(null)
            fpi.product.fetchProductPriceBySlug({
              slug,
              size: sizes[currentSizeIndex]?.value,
              pincode: currentPincode?.length === 6 ? currentPincode : null,
            });
          }
        });
    }
  }, [currentPincode]);

  return {
    productDetails: product_details || {},
    productVariants: product_variants || {},
    productMeta: product_meta || {},
    productPriceBySlug: product_price_by_slug || {},
    currentImageIndex,
    currentSizeIndex,
    currentPincode,
    isLoading,
    errMsg,
    setCurrentSizeIndex,
    setCurrentImageIndex,
    setCurrentPincode,
  };
};

export default useProductDescription;
