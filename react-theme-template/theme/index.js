import FPIClient from 'fdk-store';
import Header from './components/header';
import Footer from './components/footer';
import customTemplates from './custom-templates';

import sections from './sections';

export default async ({
	applicationID, applicationToken, domain, storeInitialData,
}) => {
	const fpi = new FPIClient(applicationID, applicationToken, { domain }, storeInitialData);

	return {
		fpi,
		sections,
		customTemplates,
		getHeader: () => Header,
		getFooter: () => Footer,
		getHome: () => import(/* webpackChunkName:"getHome" */ './pages/Home'),
		getProductListing: () => import(/* webpackChunkName:"getProductListing" */ './pages/product-listing'),
		getProductDescription: () => import(/* webpackChunkName:"getProductDescription" */ './pages/product-description'),
		getCart: () => import(/* webpackChunkName:"getCart" */ './pages/cart'),
		getWishlist: () => import(/* webpackChunkName:"getWishlist" */ './pages/wishlist'),
		getSections: () => import(/* webpackChunkName:"getSections" */ './pages/sections-page'),
	};
};
