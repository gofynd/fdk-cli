import FPIClient from "fdk-store";
import customTemplates from "./custom-templates";
import "./styles/base.less";
import sections from "./sections";

import Footer from "./page-layouts/footer/footer";
import Header from "./page-layouts/header/header";
import { globalDataResolver, pageDataResolver } from "./helper/lib";
import Loader from "./components/loader/loader";

export default async ({
  applicationID,
  applicationToken,
  domain,
  storeInitialData,
}) => {
  const fpiOptions = {
    applicationID,
    applicationToken,
    domain,
    storeInitialData,
  };
  const { client } = new FPIClient(fpiOptions);

  return {
    globalDataResolver,
    pageDataResolver,
    fpi: client,
    sections,
    customTemplates,
    getHeader: () => Header,
    getFooter: () => Footer,
    getComponentLoadingPage: () => Loader,
    getHome: () => import(/* webpackChunkName:"getHome" */ "./pages/home"),
    getLogin: () => import(/* webpackChunkName:"getLogin" */ "./pages/login"),
    getRegister: () =>
      import(/* webpackChunkName:"getRegister" */ "./pages/register"),
    getNotFound: () =>
      import(
        /* webpackChunkName:"getNotFound" */ "./components/page-not-found/page-not-found"
      ),
    getProductListing: () =>
      import(
        /* webpackChunkName:"getProductListing" */ "./pages/product-listing"
      ),
    getProductDescription: () =>
      import(
        /* webpackChunkName:"getProductDescription" */ "./pages/product-description"
      ),
    getCart: () => import(/* webpackChunkName:"getCart" */ "./pages/cart-landing"),
    getWishlist: () =>
      import(/* webpackChunkName:"getWishlist" */ "./pages/wishlist"),
    getSinglePageCheckout: () =>
      import(
        /* webpackChunkName:"getSinglePageCheckout" */ "./pages/locate-us"
      ),
    getOrderStatus: () =>
      import(/* webpackChunkName:"getOrderStatus" */ "./pages/order-status"),
    getForgotPassword: () =>
      import(/* webpackChunkName:"getForgotPassword" */ "./pages/forgot-password"),
  };
};
