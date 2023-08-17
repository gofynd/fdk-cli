import React from 'react';
import { isLoggedIn } from '../helper/auth-guard';
import Cart from '../page-layouts/cart/cart';

function CartPage({ fpi }) {
  return (
    <>
      <Cart fpi={fpi} />
    </>
  );
}

CartPage.serverFetch = () => { };

// CartPage.authGuard = isLoggedIn;
export default CartPage;
