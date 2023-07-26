import React from 'react';
import Cart from '../page-layouts/cart/cart';
// import Cart from '../components/cart/cart';


function CartPage({ fpi }) {
  return (
    <>
      <Cart fpi={fpi} />
    </>
  );
}

CartPage.serverFetch = () => {};

export default CartPage;
