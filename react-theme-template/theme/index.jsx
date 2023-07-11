import FPIClient from 'fdk-store';
import Header from './components/header';
import Footer from './components/footer';
import customTemplates from './custom-templates';
import './styles/main.less';

import sections from './sections';

export default async ({
	applicationID, applicationToken, domain, storeInitialData,
}) => {
	const fpiOptions = {
		applicationID, applicationToken, domain, storeInitialData,
	};
	const { client } = new FPIClient(fpiOptions);

	return {
		fpi: client,
		sections,
		customTemplates,
		getHeader: () => Header,
		getFooter: () => Footer,
		getHome: () => import(/* webpackChunkName:"getHome" */ './pages/home'),
		getProductListing: () => import(/* webpackChunkName:"getProductListing" */ './pages/product-listing'),
		getProductDescription: () => import(/* webpackChunkName:"getProductDescription" */ './pages/product-description'),
		getCart: () => import(/* webpackChunkName:"getCart" */ './pages/cart'),
		getWishlist: () => import(/* webpackChunkName:"getWishlist" */ './pages/wishlist'),
	};
};
