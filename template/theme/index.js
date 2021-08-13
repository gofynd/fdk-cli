// pages templates
import CartLanding from './templates/pages/cart-landing.vue';
import CartReview from './templates/pages/cart-review.vue';
import CartDelivery from './templates/pages/cart-delivery.vue';
import Categories from './templates/pages/categories.vue';
import Collections from './templates/pages/collections.vue';
import CollectionListing from './templates/pages/collection-listing.vue';
import BrandListing from './templates/pages/brand-listing.vue';
import CategoryListing from './templates/pages/category-listing.vue';
import CompareProducts from './templates/pages/compare-products.vue';
import OrderTrackingDetails from './templates/pages/order-tracking-details.vue';
import OrderTracking from './templates/pages/order-tracking.vue';
import OrderStatus from './templates/pages/order-status.vue';
import ProductDescription from './templates/pages/product-description.vue';
import ProductListing from './templates/pages/product-listing.vue';
import OrdersList from './templates/pages/orders-list.vue';
import Blog from './templates/pages/blog.vue';
import Wishlist from './templates/pages/wishlist.vue';
import Brands from './templates/pages/brands.vue';
import ProfileDetails from './templates/pages/profile-details.vue';
import ProfileAddress from './templates/pages/profile-address.vue';
import ShipmentDetails from './templates/pages/shipment-details.vue';
import Home from './templates/pages/home.vue';
import AddProductReview from './templates/pages/add-product-review.vue';
import ProductReviews from './templates/pages/product-reviews.vue';
// component templates
import ScreenSaver from './templates/components/screen-saver.vue';
import Loader from './templates/components/loader.vue';
import Footer from './templates/components/footer.vue';
import Header from './templates/components/header.vue';
import EmptyState from './templates/components/empty-state.vue';

import sections from './sections';
import CustomTemplates from './custom-templates';
import styles from './global/head.less';

export default {
  getCartLanding: () => CartLanding,
  getCartReview: () => CartReview,
  getCategories: () => Categories,
  getCollections: () => Collections,
  getCollectionListing: () => CollectionListing,
  getCategoryListing: () => CategoryListing,
  getBrandListing: () => BrandListing,
  getCompareProducts: () => CompareProducts,
  getFooter: () => Footer,
  getHeader: () => Header,
  getOrderTrackingDetails: () => OrderTrackingDetails,
  getOrderTracking: () => OrderTracking,
  getProductDescription: () => ProductDescription,
  getProductListing: () => ProductListing,
  getScreenSaver: () => ScreenSaver,
  getBlog: () => Blog,
  getHome: () => Home,
  getBrands: () => Brands,
  getWishList: () => Wishlist,
  getCartDelivery: () => CartDelivery,
  getOrderStatus: () => OrderStatus,
  getOrdersList: () => OrdersList,
  getProfileDetails: () => ProfileDetails,
  getProfileAddress: () => ProfileAddress,
  getShipmentDetails: () => ShipmentDetails,
  getLoader: () => null,
  getCustomTemplates: () => CustomTemplates,
  getEmptyState: () => EmptyState,
  getProductReviews: () => ProductReviews,
  getAddProductReview: ()=> AddProductReview,
  sections,
};
