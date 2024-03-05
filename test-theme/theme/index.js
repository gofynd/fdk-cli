import Blog from "./templates/pages/blog.vue";
import Home from "./templates/pages/home.vue";
import Footer from "./templates/components/footer.vue";
import Header from "./templates/components/header.vue";
import Loader from "./templates/components/loader.vue";

import styles from "./global/head.less";
import CustomTemplates from "./custom-templates";
import sections from "./sections";

export default {
  // Main chunk
  getFooter: () => Footer,
  getHeader: () => Header,
  getHome: () => Home,
  getBlog: () => Blog,
  getEmptyState: () => null,
  getLoader: () => Loader,

  getScreenSaver: () =>
    import(
      /*webpackChunkName:"extras" */ "./templates/components/screen-saver.vue"
    ),
  getFaq: () =>
    import(/*webpackChunkName:"extras" */ "./templates/pages/faq.vue"),

  getCartLanding: () =>
    import(/* webpackChunkName:"cart" */ "./templates/pages/cart-landing.vue"),
  getCartReview: () =>
    import(/* webpackChunkName:"cart" */ "./templates/pages/cart-review.vue"),
  getCartDelivery: () =>
    import(/* webpackChunkName:"cart" */ "./templates/pages/cart-delivery.vue"),

  getBrands: () =>
    import(/* webpackChunkName:"products" */ "./templates/pages/brands.vue"),
  getCategories: () =>
    import(
      /* webpackChunkName:"products" */ "./templates/pages/categories.vue"
    ),
  getCollections: () =>
    import(
      /* webpackChunkName:"products" */ "./templates/pages/collections.vue"
    ),
  getProductDescription: () =>
    import(
      /* webpackChunkName:"products" */ "./templates/pages/product-description.vue"
    ),
  getCompareProducts: () =>
    import(
      /* webpackChunkName:"products" */ "./templates/pages/compare-products.vue"
    ),

  getProductListing: () =>
    import(
      /* webpackChunkName:"products-listing" */ "./templates/pages/product-listing.vue"
    ),
  getCollectionListing: () =>
    import(
      /* webpackChunkName:"products-listing" */ "./templates/pages/collection-listing.vue"
    ),
  getBrandListing: () =>
    import(
      /* webpackChunkName:"products-listing" */ "./templates/pages/brand-listing.vue"
    ),
  getCategoryListing: () =>
    import(
      /* webpackChunkName:"products-listing" */ "./templates/pages/category-listing.vue"
    ),

  getOrderTrackingDetails: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/order-tracking-details.vue"
    ),
  getOrderTracking: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/order-tracking.vue"
    ),
  getOrderStatus: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/order-status.vue"
    ),
  getOrdersList: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/orders-list.vue"
    ),
  getWishList: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/wishlist.vue"
    ),
  getProfileDetails: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/profile-details.vue"
    ),
  getShipmentDetails: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/shipment-details.vue"
    ),
  getProfileAddress: () =>
    import(
      /* webpackChunkName:"profile" */ "./templates/pages/profile-address.vue"
    ),
  getCustomTemplates: () => {
    return CustomTemplates;
  },
  sections,
};
