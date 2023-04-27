import React, { useEffect, useState } from 'react';
import { useGlobalStore } from 'fdk-core';
import ProductGallery from '../components/product-gallery';
import styles from '../styles/product-listing.less';

function ProductListing({ fpi }) {
	const [sdkOptions, setSDKOptions] = useState({});
	const {
		isLoading, error, ...products
	} = useGlobalStore((store) => store[fpi.getters.PRODUCT_LISTING_PAGE]);

	function isAtBottom() {
		return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
	}
	function scrollHandler() {
		if (isAtBottom()) {
			if (sdkOptions.idle) {
				setSDKOptions({
					...sdkOptions,
					pageNumber: sdkOptions.pageNumber + 1,
					idle: false,
				});
			}
		}
	}
	function handleWishlistButton() {
		// const updatedProducts = products.map((productInStore) => {
		// 	if (productInStore.slug !== slug) {
		// 		return productInStore;
		// 	}
		// 	return {
		// 		...productInStore,
		// 		isWishlisted: !productInStore.isWishlisted,
		// 	};
		// });
		// window.dispatchEvent(new Event('wishlist.add'), { slug })
		// setProducts({ data: updatedProducts });
	}

	useEffect(() => {
		window.addEventListener('scroll', scrollHandler);

		return () => {
			window.removeEventListener('scroll', scrollHandler);
		};
	}, []);

	useEffect(() => {
		if ((!products?.items?.length)) {
			// fetch from sdk and populate store
			fpi.client.productListing.fetchProducts(sdkOptions);
		}
	}, [JSON.stringify(sdkOptions)]);

	if (isLoading) {
		return <h1>Product details are being loaded</h1>;
	}

	if (error) {
		return (
			<>
				<h1>Error Occured !</h1>
				<pre>
					{JSON.stringify(error, null, 4)}
				</pre>
			</>
		);
	}

	if (!products?.items?.length) {
		return <h1>No products found !!</h1>;
	}
	return (
		<div className={styles.container}>
			<div className={styles.filterSection}>
				<p className={styles.red_text}>I am filter section</p>
				<TestSideComponent />
			</div>
			<div className={styles.listingSection}>
				{
					!products?.items?.length ? (<h1>Products are being loaded !!!</h1>) : (
						<ProductGallery
							products={products?.items}
							handleWishlistButton={handleWishlistButton}
						/>
					)
				}
			</div>
		</div>
	);
}

ProductListing.serverFetch = ({ router, fpi }) => {
	const { page_id: pageId = '*', page_size: pageSize = 50 } = router?.filterQuery || {};
	return fpi.client.productListing.fetchProducts({});
};

export default ProductListing;

function TestSideComponent() {
	return <h2>Filters here</h2>;
}
