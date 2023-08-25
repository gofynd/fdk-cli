import React, { useEffect, useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useNavigate } from "react-router-dom";

const useCart = (fpi) => {
  const CART = useGlobalStore(fpi.getters.CART);
  const navigate = useNavigate();

  const { buy_now_cart_items, cart_items, cart_items_count } = CART || {};
  const { breakup_values, loading: cartItemsLoading } = cart_items || {};
  const { loading: buyNowCartItemsLoading } = buy_now_cart_items || {};
  const { loading: cartItemsCountLoading } = cart_items_count || {};


  useEffect(() => {
    fpi?.cart?.getCartItems({ b: true, i: true });
    // fpi?.cart?.getShipments({ id: cart_items?.id });
  }, []);

  const cartItemsByItemId = useMemo(() => {
    if (cart_items?.items?.length > 0) {
      let cartitemsObj = {};
      cart_items?.items?.map((singleItem) => {
        if (singleItem?.key) {
          cartitemsObj[singleItem?.key] = singleItem;
        }
      });
      return cartitemsObj;
    } else {
      return {};
    }
  }, [cart_items]);

  function updateCartItems(
    event,
    itemDetails,
    itemSize,
    quantity,
    itemIndex,
    operation
  ) {
    if (event) {
      event.stopPropagation();
    }
    const itemQuery = {
      article_id: itemDetails?.product?.uid + "_" + itemSize,
      item_id: itemDetails?.product?.uid,
      identifiers: { identifier: itemDetails?.identifiers?.identifier },
      item_size: itemSize,
      quantity: (itemDetails?.quantity || 0) + quantity,
      parent_item_identifiers: {
        identifier: null,
        parent_item_size: null,
        parent_item_id: null,
      },
      item_index: itemIndex,
    };

    let callFunction;

    if (operation === "update") {
      fpi?.cart?.updateCartItems({ items: [itemQuery] }).then((res) => {
        if (res.payload.success) {
          // fpi?.cart?.getCartItems({ b: true, i: true });
          fpi.cart.getCartItemsCount();
        }
      });
    } else if (operation === "remove") {
      fpi?.cart?.removeCartItem({ items: [itemQuery] }).then((res) => {

        if (res.payload.success) {
          // fpi?.cart?.getCartItems({ b: true, i: true });
          fpi.cart.getCartItemsCount();
        }
      });
    }
  }
  function gotoCheckout() {
    // console.log(cart_items?.id);
    // navigate("/cart/checkout");
    navigate({
      pathname: "/cart/checkout",
      search: `id=${cart_items?.id}`,
    });
  }

  return {
    cartItems: cartItemsByItemId,
    cartItemCount: cart_items_count?.user_cart_items_count || 0,
    cartItemsWithActualIndex: cart_items?.items,
    breakUpValues: breakup_values,
    isLoading:
      cartItemsLoading ||
      cartItemsCountLoading ||
      buyNowCartItemsLoading ||
      false,
    updateCartItems,
    gotoCheckout,
  };
};

export default useCart;
