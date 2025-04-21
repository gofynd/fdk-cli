import CartLanding from "./templates/pages/cart-landing.vue";
import CartReview from "./templates/pages/cart-review.vue";
import CartDelivery from "./templates/pages/cart-delivery.vue";
import Categories from "./templates/pages/categories.vue";
import Collections from "./templates/pages/collections.vue";
import CollectionListing from "./templates/pages/collection-listing.vue";
import BrandListing from "./templates/pages/brand-listing.vue";
import CategoryListing from "./templates/pages/category-listing.vue";
import CompareProducts from "./templates/pages/compare-products.vue";
import Footer from "./templates/components/footer.vue";
import Header from "./templates/components/header.vue";
import OrderTrackingDetails from "./templates/pages/order-tracking-details.vue";
import OrderTracking from "./templates/pages/order-tracking.vue";
import OrderStatus from "./templates/pages/order-status.vue";
import ProductDescription from "./templates/pages/product-description.vue";
import ProductListing from "./templates/pages/product-listing.vue";
import ProductReviews from "./templates/pages/product-reviews.vue";
import AddProductReview from "./templates/pages/add-product-review.vue";
import OrdersList from "./templates/pages/orders-list.vue";
import ScreenSaver from "./templates/components/screen-saver.vue";
import Blog from "./templates/pages/blog.vue";
import Loader from "./templates/components/loader.vue";
import Wishlist from "./templates/pages/wishlist.vue";
import Brands from "./templates/pages/brands.vue";
import EmptyState from "./templates/components/empty-state.vue";
import ProfileDetails from "./templates/pages/profile-details.vue";
import ProfileAddress from "./templates/pages/profile-address.vue";
import ShipmentDetails from "./templates/pages/shipment-details.vue";
import FAQ from "./templates/pages/faq.vue";
import Home from "./templates/pages/home.vue";
import Login from './templates/pages/login.vue'
import Register from './templates/pages/register.vue'
import CustomTemplates from "./custom-templates";
import styles from "./global/head.less";
import sections from "./sections";

/* UNCOMMENT TO APPLY FYND THEME */

export default {
    getCartLanding: () => CartLanding,
    getCartReview: () => CartReview,
    getCartDelivery: () => CartDelivery,
    getCategories: () => Categories,
    getCollections: () => Collections,
    getCollectionListing: () => CollectionListing,
    getBrandListing: () => BrandListing,
    getCategoryListing: () => CategoryListing,
    getCompareProducts: () => CompareProducts,
    getFooter: () => Footer,
    getHeader: () => Header,
    getOrderTrackingDetails: () => OrderTrackingDetails,
    getOrderTracking: () => OrderTracking,
    getOrderStatus: () => OrderStatus,
    getProductDescription: () => ProductDescription,
    getProductListing: () => ProductListing,
    getOrdersList: () => OrdersList,
    getScreenSaver: () => ScreenSaver,
    getHome: () => Home,
    getBlog: () => Blog,
    getBrands: () => Brands,
    getLoader: () => Loader,
    getWishList: () => Wishlist,
    getProfileDetails: () => ProfileDetails,
    getShipmentDetails: () => ShipmentDetails,
    getProfileAddress: () => ProfileAddress,
    getFaq: () => FAQ,
    getEmptyState: () => null,
    getProductReviews: () => ProductReviews,
    getAddProductReview: () => AddProductReview,
    getLogin: () => Login,
    getRegister: () => Register,
    getCustomTemplates: () => {
        return CustomTemplates;
    },
    sections,
};