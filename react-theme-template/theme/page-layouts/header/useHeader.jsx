import { useEffect } from "react";
import { useGlobalStore } from "fdk-core/utils";

const useHeader = (fpi) => {
  const CONTENT = useGlobalStore(fpi.getters.CONTENT);

  const CART_ITEMS_COUNT = useGlobalStore(fpi.getters.CART_ITEMS_COUNT);

  const cartItemCount = CART_ITEMS_COUNT?.user_cart_items_count;

  useEffect(() => {
    if (
      !(CONTENT?.navigation?.items && CONTENT?.navigation?.items[0]?.navigation)
    ) {
      fpi.content.fetchNavigation();
    }
  }, []);

  const userLoggedin = useGlobalStore(fpi.getters.LOGGED_IN);
  useEffect(() => {
    fpi.cart.getCartItemsCount();
  
},[userLoggedin])
  return {
    navigation:
      CONTENT?.navigation?.items && CONTENT?.navigation?.items[0]?.navigation,
    cartItemCount,
  };
};

export default useHeader;
