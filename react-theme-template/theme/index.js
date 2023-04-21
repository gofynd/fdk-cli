import FPIClient, { GETTERS } from 'fdk-store';

import Header from './components/header/header';
import Footer from './components/footer/footer';

import sections from './sections';

export default async ({
	applicationID, applicationToken, domain, storeInitialData,
}) => {
	const fpi = new FPIClient(applicationID, applicationToken, { domain }, storeInitialData);

	return {
		fpi,
		sections,
		GETTERS,
		getHome: () => import(/* webpackChunkName:"getHome" */ './pages/homepage/Home'),
		getHeader: () => Header,
		getFooter: () => Footer,
		getProductListing: () => import(/* webpackChunkName:"getProductListing" */ './pages/product-listing/product-listing'),
		getProductDescription: () => import(/* webpackChunkName:"getProductDescription" */ './pages/product-description/product-description'),
		getCart: () => import(/* webpackChunkName:"getCart" */ './pages/cart/cart'),
		getWishlist: () => import(/* webpackChunkName:"getWishlist" */ './pages/wishlist/wishlist'),
		getSections: () => import(/* webpackChunkName:"getSections" */ './pages/sections-page/sections-page'),
	};
};
